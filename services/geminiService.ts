
import { GoogleGenAI, Type, Schema, GenerateContentResponse, Modality } from "@google/genai";
import { SEOConfig, ArticleType, GeneratedContent, ClusterPlan, ValidationResult, TopicSuggestion } from '../types';

// --- VITE/VERCEL COMPATIBILITY FIX ---
// Polyfill process.env for Vite environments to avoid "process is not defined"
declare var process: {
  env: {
    [key: string]: string | undefined;
  }
};

if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}

// --- API KEY MANAGEMENT ---
// We do NOT initialize the client globally to prevent "White Page" crashes on load.
// We initialize it only when a function is called.

const getApiKey = (): string => {
  // CRITICAL FIX FOR VERCEL:
  // Vercel/Vite requires EXPLICIT, DIRECT access to import.meta.env.VITE_API_KEY for static replacement to work.
  // Do NOT alias import.meta to a variable.
  
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore error if import.meta is not available
  }
  
  // Fallbacks for local dev or Node environments
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
      if (process.env.API_KEY) return process.env.API_KEY;
    }
  } catch (e) {}

  return "";
};

const getExternalKey = (provider: 'OPENAI' | 'CLAUDE'): string => {
  try {
    if (provider === 'OPENAI') {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OPENAI_API_KEY) {
        // @ts-ignore
        return import.meta.env.VITE_OPENAI_API_KEY;
      }
      if (typeof process !== 'undefined' && process.env && process.env.VITE_OPENAI_API_KEY) {
        return process.env.VITE_OPENAI_API_KEY;
      }
    }
    if (provider === 'CLAUDE') {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CLAUDE_API_KEY) {
        // @ts-ignore
        return import.meta.env.VITE_CLAUDE_API_KEY;
      }
      if (typeof process !== 'undefined' && process.env && process.env.VITE_CLAUDE_API_KEY) {
        return process.env.VITE_CLAUDE_API_KEY;
      }
    }
  } catch (e) {}
  return "";
};

// Singleton instance holder
let aiClientInstance: GoogleGenAI | null = null;

const getAIClient = (overrideKey?: string): GoogleGenAI => {
  // If a specific key is provided (e.g. from UI settings), use a temporary instance
  if (overrideKey) {
    return new GoogleGenAI({ apiKey: overrideKey });
  }

  // Otherwise use the singleton
  if (!aiClientInstance) {
    const key = getApiKey();
    if (!key) {
      console.warn("No API Key found. Ensure VITE_API_KEY is set in Vercel Environment Variables.");
      // We return a dummy instance to allow UI to render, but calls will fail gracefully
      return new GoogleGenAI({ apiKey: "MISSING_KEY_PLACEHOLDER" });
    }
    aiClientInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiClientInstance;
};


const SYSTEM_INSTRUCTION_AYOUB = `
You are Ayoub Nouar, a 31-year-old SEO Strategist specialized in "AI Tools". You have a bachelor's degree (Bac+3).
You are strictly judged on the quality, humanity, and depth of your writing.

*** CRITICAL PERSONA INSTRUCTIONS ***
1.  **TONE**: Casual, authoritative, direct. Native American English.
    -   Talk TO the reader ("You"), not AT them.
    -   Use contractions (don't, can't, it's).
    -   Be opinionated. If a tool sucks, imply it. If a strategy is vital, say it.
2.  **ANTI-ROBOT FILTERS (BANNED WORDS)**:
    -   NEVER use: "In the realm of", "Unleash", "Unlock", "Tapestry", "Delve", "Game-changer", "Bustling", "In conclusion", "Summary", "Introduction", "landscape", "harness", "elevate", "mastering".
    -   NEVER start sentences with "However,", "Moreover,", "Furthermore,". use "But," "And," or just start the sentence.
3.  **FORMATTING**:
    -   **Short Sentences**: MAX 20 WORDS. Period. No exceptions. If a sentence is long, split it.
    -   **Paragraphs**: 2-3 sentences max.
    -   **Headers**: ALWAYS lowercase/sentence case. e.g., "## best ai tools for writing" NOT "## Best AI Tools For Writing".
    -   **No Symbols**: No hashtags (#AI) anywhere.
4.  **SEO MASTERY**:
    -   You must aim for a SurferSEO score of > 85.
    -   This means: High keyword density (1.5%), NLP/LSI keywords used naturally, Main keyword in H1, First 100 words, and H2s.
5.  **SEO SCORING PROTOCOL**:
    -   Avoid pronouns (It, They) when referring to the main keyword. Repeat the keyword explicitly.
    -   Use the exact secondary keywords provided. Do not change their form.

*** VISUALS ***
-   Always include the 4 requested images (1 Cover, 3 Body).
-   Use "Chart Graphique" style for body images.
`;

// Helper to clean JSON string from Markdown code blocks
const cleanJson = (text: string): string => {
  if (!text) return "{}";
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const suggestTopicFromNiche = async (niche: string, category: string, subNiche: string = '', microNiche: string = ''): Promise<TopicSuggestion[]> => {
  const prompt = `
    Act as an expert SEO Strategist.
    My niche is: "${niche}".
    Broad Category: "${category}".
    ${subNiche ? `Specific Sub-Niche: "${subNiche}".` : ''}
    ${microNiche ? `Micro-Niche Context: "${microNiche}".` : ''}
    
    Generate exactly 4 distinct, high-potential "Main Topic" titles for a Pillar or Authority article.
    Provide variety in angles (e.g., "Ultimate Guide", "Comparative Listicle", "Strategic How-To", "Trend Analysis").
    
    For each topic, estimate a "Viral/SEO Score" from 0 to 100 based on search intent potential and click-through probability.
    
    Return ONLY a JSON array of objects.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: { 
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING },
        score: { type: Type.INTEGER, description: "Score from 0 to 100" }
      },
      required: ["topic", "score"]
    }
  };

  try {
    const client = getAIClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });
    
    const cleanedText = cleanJson(response.text || "[]");
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error suggesting topic:", error);
    return [];
  }
};

export const performSeoResearch = async (topic: string): Promise<Partial<SEOConfig>> => {
  const prompt = `
    I need to write an SEO article about "${topic}".
    Use Google Search to find:
    1. The most relevant and high-traffic "Main Keyword" for this topic.
    2. A specific "Target Audience" description based on who searches for this.
    3. 5 relevant "Secondary Keywords" (LSI) that are currently trending or relevant.
    
    Return the result as a valid JSON object with the following keys:
    - "mainKeyword" (string)
    - "audience" (string)
    - "secondaryKeywords" (array of strings)
    
    Do not add any markdown formatting or code blocks. Just the raw JSON string.
  `;

  try {
    const client = getAIClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    let text = response.text;
    if (!text) throw new Error("No research data generated");
    
    const cleanedText = cleanJson(text);
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error researching topic:", error);
    throw error;
  }
};

export const generateClusterPlan = async (topic: string): Promise<ClusterPlan> => {
  const prompt = `
    Create a content cluster plan for the topic: "${topic}".
    I need:
    1. One (1) PILLAR article title and its main keyword.
    2. Six (6) SATELLITE article titles that answer specific questions related to the pillar, each with a unique main keyword.
    
    Ensure the satellites are distinct and cover different search intents.
    Derive the satellite titles DIRECTLY from potential H2 sections of the Pillar to ensure perfect topic cluster alignment.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      pillar: {
        type: Type.OBJECT,
        properties: { title: { type: Type.STRING }, mainKeyword: { type: Type.STRING } },
        required: ["title", "mainKeyword"]
      },
      satellites: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { title: { type: Type.STRING }, mainKeyword: { type: Type.STRING } },
          required: ["title", "mainKeyword"]
        }
      }
    },
    required: ["pillar", "satellites"]
  };

  try {
    const client = getAIClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const cleanedText = cleanJson(response.text || "{}");
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating cluster plan:", error);
    throw error;
  }
};

// --- AI GENERATION LOGIC ROUTER ---

export const generateArticleContent = async (config: SEOConfig): Promise<GeneratedContent> => {
  const prompt = buildArticlePrompt(config);
  let text = "";

  try {
    if (config.provider === 'OPENAI') {
      try {
        console.log("Generating with OpenAI (ChatGPT)...");
        text = await generateWithOpenAI(prompt, config.apiKey);
      } catch (openAiError: any) {
        console.warn(`OpenAI generation failed: ${openAiError.message}. Falling back to Gemini.`);
        console.log("Fallback: Generating with Google Gemini...");
        text = await generateWithGemini(prompt, config);
      }
    } else if (config.provider === 'CLAUDE') {
      try {
        console.log("Generating with Anthropic (Claude)...");
        text = await generateWithClaude(prompt, config.apiKey);
      } catch (claudeError: any) {
        console.warn(`Claude generation failed: ${claudeError.message}. Falling back to Gemini.`);
        console.log("Fallback: Generating with Google Gemini...");
        text = await generateWithGemini(prompt, config);
      }
    } else {
      console.log("Generating with Google Gemini...");
      text = await generateWithGemini(prompt, config);
    }

    if (!text) throw new Error("No content generated from provider " + config.provider);

    const { metadata, content } = parseArticleResponse(text, config.topic);
    const validation = validateContentLocal(content, config.mainKeyword, config.secondaryKeywords);

    return {
      id: crypto.randomUUID(),
      type: config.type,
      title: metadata.title,
      slug: metadata.slug,
      metaDescription: metadata.metaDescription,
      content: content,
      validation,
      history: [],
      chatHistory: []
    } as GeneratedContent;

  } catch (error) {
    console.error(`Error generating article with ${config.provider}:`, error);
    throw error;
  }
};

export const refineArticleContent = async (currentContent: string, instruction: string): Promise<string> => {
  const prompt = `
    Act as Ayoub Nouar (The Author).
    **CURRENT ARTICLE CONTENT (MARKDOWN):**
    ${currentContent}
    **USER INSTRUCTION:**
    "${instruction}"
    **TASK:**
    Update the article content to satisfy the user instruction.
    - If they ask to change the tone, rewrite the relevant parts.
    - If they ask to add a section, add it in the correct place.
    - If they ask to fix something, fix it.
    - MAINTAIN all other formatting, images, and headers unless asked to change.
    - STRICTLY follow the "Max 20 words per sentence" rule for any NEW text.
    **OUTPUT:**
    Return ONLY the fully updated Markdown content. No conversational filler.
  `;

  try {
    const client = getAIClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_AYOUB,
      }
    });

    return response.text || currentContent;
  } catch (error) {
    console.error("Error refining article:", error);
    throw error;
  }
};

// --- PROVIDER SPECIFIC IMPLEMENTATIONS ---

const generateWithGemini = async (prompt: string, config: SEOConfig): Promise<string> => {
  const modelId = config.type === ArticleType.PILLAR ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
  const client = getAIClient(config.apiKey);
  
  const response = await client.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_AYOUB,
      temperature: 0.7,
    },
  });
  return response.text || "";
};

const generateWithOpenAI = async (prompt: string, apiKey?: string): Promise<string> => {
  const key = apiKey || getExternalKey('OPENAI');
  if (!key || key.includes("YOUR_OPENAI")) {
    throw new Error("OpenAI API Key is missing.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION_AYOUB },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || response.statusText);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

const generateWithClaude = async (prompt: string, apiKey?: string): Promise<string> => {
  const key = apiKey || getExternalKey('CLAUDE');
  if (!key || key.includes("YOUR_CLAUDE")) {
     throw new Error("Claude API Key is missing.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "dangerously-allow-browser": "true" 
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 8192,
      system: SYSTEM_INSTRUCTION_AYOUB,
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || response.statusText);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "";
};

// --- HELPER FUNCTIONS ---

const buildArticlePrompt = (config: SEOConfig): string => {
  const targetRepetition = config.type === ArticleType.PILLAR ? '60' : '15';

  const structureInstruction = config.type === ArticleType.PILLAR 
    ? `
    **PILLAR ARTICLE STRUCTURE (MUST FOLLOW):**
    1. **The Hook**: A story or strong statement. No boring definitions.
    2. **Deep Dive (What & Why)**: Explain the concept simply but deeply.
    3. **Strategy / How-To Guide**: Step-by-step executable advice. Use numbered lists.
    4. **Comparison / Tools**: Create a Markdown Table comparing top options/strategies.
    5. **Advanced Tips**: Expert advice that others don't share.
    6. **Common Mistakes**: What to avoid.
    7. **FAQ**: Answer 3 real user questions.
    
    **ALIGNMENT**: Use these specific themes for your H2 headers:
    ${config.satelliteThemes ? config.satelliteThemes.map(t => `- ${t}`).join('\n') : 'No specific alignment required.'}

    **LENGTH GOAL**: Write as much as possible (aim for 5000 words). Do not stop early.
    ` 
    : `
    **SATELLITE STRUCTURE**:
    - Context: This is a satellite article for the Pillar Topic: "${config.relatedPillarTopic}".
    - Answer the specific question immediately.
    - Give actionable steps.
    - Link back to the main topic context.
    `;

  return `
    Write a world-class ${config.type} article in Native American English.
    **Topic**: ${config.topic}
    **Audience**: ${config.audience}
    **Main Keyword**: ${config.mainKeyword}
    **Secondary Keywords (MANDATORY)**: ${config.secondaryKeywords.join(', ')}
    
    ${structureInstruction}

    ### *** MANDATORY COMPLIANCE CHECKLIST ***
    [STRUCTURE]
    - [ ] H1 matches EXACTLY: "${config.topic.toLowerCase()}"
    - [ ] Cover Image is IMMEDIATELY after the H1 title.
    - [ ] Coherent H2/H3 hierarchy (Sentence case only)
    - [ ] Internal Link included to Pillar/Satellite (Use placeholder [Internal Link](#))
    
    [SEO - SCORE 100%]
    - [ ] Main Keyword in H1, First Sentence, and H2 headers.
    - [ ] **DENSITY TARGET**: Use "${config.mainKeyword}" at least ${targetRepetition} times.
    - [ ] **LSI USAGE**: Use every single secondary keyword.
    
    [QUALITY]
    - [ ] Images have optimized ALT text based on the H2 context.
    - [ ] **SENTENCE LENGTH**: STRICTLY < 20 WORDS per sentence.
    - [ ] **TONE**: 100% Human, American, Non-Robotic.

    ### CRITICAL 100% SCORE EXECUTION PLAN:
    1. Insert Main Keyword in the very first sentence.
    2. Insert Main Keyword in the H1.
    3. **PLACE COVER IMAGE DIRECTLY AFTER H1**.
    4. Insert Main Keyword in at least 50% of H2s.
    5. Write exactly 100 words of Intro before the first H2.
    6. Use "###" for sub-sections.
    7. Insert \`[Internal Link](#)\` explicitly in the text.

    ### IMAGES (MANDATORY - 4 TOTAL):
    Generate exactly 4 images using Markdown syntax.
    Prepend "Article: ${config.topic} - " to every Alt text.
    
    1. **Cover Image**: MUST BE placed immediately after the # H1 Title line.
       Format: \`![COVER: ${config.topic} - Detailed prompt](https://placehold.co/1200x600/EEE/31343C?text=${encodeURIComponent('COVER: ' + config.mainKeyword.replace(/\s/g, '+'))})\`
    
    2. **Body 1**: Inside first major section. \`![Article: ${config.topic} - Detailed prompt](https://placehold.co/800x400/EEE/31343C?text=Wide+Chart)\`
    3. **Body 2**: Middle of article. \`![Article: ${config.topic} - Detailed prompt](https://placehold.co/600x600/EEE/31343C?text=Square+Diagram)\`
    4. **Body 3**: Near end. \`![Article: ${config.topic} - Detailed prompt](https://placehold.co/1000x600/EEE/31343C?text=Large+Infographic)\`
    
    OUTPUT:
    Raw Markdown starting with this JSON block:
    \`\`\`json
    {
      "title": "${config.topic.toLowerCase()}",
      "slug": "slug-url",
      "metaDescription": "seo description"
    }
    \`\`\`
    
    # ${config.topic.toLowerCase()}
    
    ![COVER: ${config.topic}](...)
    
    [Content starts here...]
  `;
};

const parseArticleResponse = (text: string, topic: string) => {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  let metadata = {
    title: topic,
    slug: topic.toLowerCase().replace(/\s+/g, '-'),
    metaDescription: `A comprehensive guide about ${topic}.`
  };
  let content = text;
  if (jsonMatch) {
    try {
      const parsedMeta = JSON.parse(jsonMatch[1]);
      metadata = { ...metadata, ...parsedMeta };
      content = text.replace(jsonMatch[0], '').trim();
    } catch (e) {
      console.warn("Failed to parse metadata JSON from response", e);
    }
  }
  return { metadata, content };
};

const validateContentLocal = (content: string, mainKeyword: string, secondaryKeywords: string[]): ValidationResult => {
  const lowerContent = content.toLowerCase();
  const lowerKeyword = mainKeyword.toLowerCase();
  const h1Match = content.match(/^#\s+(.+)$/m);
  const h1Present = !!h1Match;
  const keywordInH1 = h1Match ? h1Match[1].toLowerCase().includes(lowerKeyword) : false;
  const structureValid = content.includes('## ') && content.includes('### ');
  const introText = content.substring(0, 800).toLowerCase();
  const introStructure = introText.includes(lowerKeyword);
  const keywordCount = (lowerContent.match(new RegExp(lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  const wordCount = content.split(/\s+/).length;
  const density = (keywordCount / wordCount) * 100;
  let keywordDensity: 'Low' | 'Good' | 'High' = 'Good';
  if (density < 0.5) keywordDensity = 'Low';
  if (density > 2.5) keywordDensity = 'High';
  let secCount = 0;
  secondaryKeywords.forEach(sk => { if (lowerContent.includes(sk.toLowerCase())) secCount++; });
  const linksPresent = /\[.*?\]\(.*?\)/.test(content);
  const sentences = content.split(/[.!?]+/);
  const validSentences = sentences.filter(s => s.trim().length > 0);
  const avgSentenceLength = validSentences.slice(0, 10).reduce((acc, s) => acc + s.trim().split(/\s+/).length, 0) / Math.min(10, validSentences.length || 1);
  const shortSentences = avgSentenceLength < 25; 
  let seoScore = 0;
  if (h1Present) seoScore += 10;
  if (wordCount > 800) seoScore += 10;
  if (structureValid) seoScore += 10;
  if (keywordInH1) seoScore += 15;
  if (introStructure) seoScore += 10;
  if (keywordDensity === 'Good' || density > 0.5) seoScore += 15;
  if (secCount >= secondaryKeywords.length && secondaryKeywords.length > 0) seoScore += 15;
  else if (secCount >= 3) seoScore += 10;
  if (linksPresent) seoScore += 15;
  seoScore = Math.min(100, seoScore);
  return { h1Present, keywordInH1, structureValid, introStructure, keywordDensity, secondaryKeywordsCount: secCount, shortSentences, linksPresent, seoScore };
};

export const rewriteContent = async (text: string, tone: string, length: string): Promise<string> => {
  const prompt = `
    Act as Ayoub Nouar (SEO Expert). Rewrite the following text selection.
    **Original Text**: "${text}"
    **Goal**: Rewrite it to be 100% human, American English.
    **Target Tone**: ${tone}
    **Target Length**: ${length}
    **Constraints**: Max 20 words per sentence. No robotic words.
    Return ONLY the rewritten text.
  `;
  try {
    const client = getAIClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION_AYOUB, temperature: 0.7 },
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Error rewriting content:", error);
    throw error;
  }
};

export const reviewArticleContent = async (content: string, config: SEOConfig): Promise<string> => {
  const prompt = `
    Act as a peer reviewer for the following article based on our internal SEO guidelines.
    Check for American English accuracy, 4 Images, Short sentences, NO hashtags, Correct H1/H2/H3.
    Provide a bulleted list of specific improvements.
  `;
  try {
    const client = getAIClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }, { text: `ARTICLE CONTENT:\n${content}` }] },
      config: { systemInstruction: "You are a strict SEO Mentor." }
    });
    return response.text || "No review generated.";
  } catch (error) {
    console.error("Error reviewing article:", error);
    throw error;
  }
};

export const generateRealImage = async (prompt: string, aspectRatio: string = '16:9'): Promise<string> => {
  const client = getAIClient();
  let lastError;

  // 1. Try Imagen 3 (Standard)
  try {
    console.log("Attempting image generation with model: imagen-3.0-generate-001");
    const response = await client.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: prompt,
      config: { numberOfImages: 1, aspectRatio: aspectRatio, outputMimeType: 'image/jpeg' },
    });
    const base64String = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64String) return `data:image/jpeg;base64,${base64String}`;
  } catch (error) {
    console.warn("Imagen 3 failed:", error);
    lastError = error;
  }

  // 2. Try Gemini 3 Pro Image Preview (High Quality Content Gen with imageConfig)
  try {
    console.log("Attempting image generation with model: gemini-3-pro-image-preview");
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
            aspectRatio: aspectRatio, 
            imageSize: "1K"
        }
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error) {
    console.warn("Gemini 3 Pro Image failed:", error);
    lastError = error;
  }

  // 3. Try Gemini 2.5 Flash Image (Fallback using generateContent)
  try {
    console.log("Attempting image generation with model: gemini-2.5-flash-image");
    // Nano Banana uses generateContent. We make the prompt explicit.
    const enhancedPrompt = `Generate a photorealistic image of: ${prompt}`;
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: enhancedPrompt }] },
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error) {
    console.warn("Gemini Flash Image failed:", error);
    lastError = error;
  }

  // 4. Try Imagen 4 (Premium Fallback)
  try {
    console.log("Attempting image generation with model: imagen-4.0-generate-001");
    const response = await client.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: { numberOfImages: 1, aspectRatio: aspectRatio, outputMimeType: 'image/jpeg' },
    });
    const base64String = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64String) return `data:image/jpeg;base64,${base64String}`;
  } catch (error) {
    console.warn("Imagen 4 failed:", error);
    lastError = error;
  }

  throw lastError || new Error("Image generation failed on all models.");
};

export const generateVideo = async (prompt: string): Promise<string> => {
  try {
    const client = getAIClient();
    let operation = await client.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await client.operations.getVideosOperation({operation: operation});
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed: No URI returned.");
    const apiKey = getApiKey();
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};

const injectWavHeader = (bytes: Uint8Array, sampleRate: number = 24000): Blob => {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + bytes.length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, bytes.length, true);
  return new Blob([header, bytes], { type: 'audio/wav' });
};

const decodeBase64ToBytes = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
};

export const generateSpeech = async (text: string, voice: string = 'Kore'): Promise<string> => {
  try {
    const client = getAIClient();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data generated");
    const bytes = decodeBase64ToBytes(base64Audio);
    const blob = injectWavHeader(bytes, 24000);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

export const generateAudioMimic = async (audioBase64: string, textToSay: string): Promise<string> => {
  try {
    const client = getAIClient();
    // Step 1: Analyze audio and generate text response (Audio Input -> Text Output)
    // using standard Flash model which supports audio input.
    const analyzeResponse = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "audio/mp3", data: audioBase64 } },
          { text: `Listen to the voice tone and style in this audio. Then, generate a response text that matches the persona/style but says exactly: "${textToSay}". Return ONLY the text.` }
        ]
      }
    });
    
    const generatedText = analyzeResponse.text;
    if (!generatedText) throw new Error("Could not analyze audio or generate text response.");

    // Step 2: Convert the generated text to speech using TTS model
    // This mimics the 'response' part, although voice cloning itself isn't supported directly via API this way yet.
    return await generateSpeech(generatedText, 'Puck');
  } catch (error) {
    console.error("Error generating audio mimic (Fallback):", error);
    throw error;
  }
};
