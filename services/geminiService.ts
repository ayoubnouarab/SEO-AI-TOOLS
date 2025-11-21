import { GoogleGenAI, Type, Schema, GenerateContentResponse } from "@google/genai";
import { SEOConfig, ArticleType, GeneratedContent, ClusterPlan, ValidationResult } from '../types';

// Initialize the client with the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

*** VISUALS ***
-   Always include the 4 requested images (1 Cover, 3 Body).
-   Use "Chart Graphique" style for body images.
`;

export const suggestTopicFromNiche = async (niche: string, category: string, subCategory: string = ''): Promise<string> => {
  const prompt = `
    Act as an expert SEO Strategist.
    My niche is: "${niche}".
    Broad Category: "${category}".
    ${subCategory ? `Specific Sub-Category: "${subCategory}".` : ''}
    
    Generate ONE single, high-potential, SEO-optimized "Main Topic" title for a comprehensive Pillar article in this specific category hierarchy.
    The topic should be:
    1. Search-intent driven (something people actually search for).
    2. Specific enough to target a clear audience.
    3. Catchy but professional.
    
    Return ONLY the topic title string. Do not include quotes or extra text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error suggesting topic:", error);
    throw error;
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
    // IMPORTANT: Do not use responseMimeType or responseSchema with googleSearch tool
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    let text = response.text;
    if (!text) throw new Error("No research data generated");
    
    // Cleanup potential markdown if model ignores instruction
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating cluster plan:", error);
    throw error;
  }
};

export const generateArticleContent = async (config: SEOConfig): Promise<GeneratedContent> => {
  // Using Pro for Pillar to handle the large token output requirement better
  const modelId = config.type === ArticleType.PILLAR ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';

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
    
    **LENGTH GOAL**: Write as much as possible (aim for 5000 words). Do not stop early. Be exhaustive.
    ` 
    : `
    **SATELLITE STRUCTURE**:
    - Answer the specific question immediately.
    - Give actionable steps.
    - Link back to the main topic context.
    `;

  const prompt = `
    Write a world-class ${config.type} article in Native American English.
    
    **Topic**: ${config.topic}
    **Audience**: ${config.audience} (Write specifically for them)
    **Main Keyword**: ${config.mainKeyword}
    **Secondary Keywords**: ${config.secondaryKeywords.join(', ')}
    ${config.relatedPillarTopic ? `**Related Pillar**: ${config.relatedPillarTopic} (Link to it)` : ''}

    ${structureInstruction}

    ### *** MANDATORY COMPLIANCE CHECKLIST (VERIFY BEFORE GENERATING) ***
    You MUST ensure the following are TRUE in the generated content:
    
    [STRUCTURE]
    - [ ] H1 matches EXACTLY: "${config.topic.toLowerCase()}"
    - [ ] Coherent H2/H3 hierarchy (Sentence case only)
    - [ ] Internal Link included to Pillar/Satellite
    
    [SEO - SURFER SCORE > 85]
    - [ ] Main Keyword in H1, First 100 words (Intro), and H2 headers.
    - [ ] Balanced Density (1.5% - 2%) - NO Keyword Stuffing.
    - [ ] All 3-5 Secondary Keywords integrated naturally.
    - [ ] URL/Slug is short and optimized.
    
    [QUALITY]
    - [ ] Images have optimized ALT text based on the H2 context.
    - [ ] **SENTENCE LENGTH**: STRICTLY < 20 WORDS per sentence.
    - [ ] **TONE**: 100% Human, American, Non-Robotic.

    ### IMAGES (MANDATORY - 4 TOTAL):
    Generate exactly 4 images using Markdown syntax.
    The ALT TEXT must be a detailed prompt describing the image based on the H2 section it is inside (Context-Aware).
    1. **Cover**: After H1. \`![Detailed prompt for cover image about ${config.mainKeyword}](https://placehold.co/1200x600/EEE/31343C?text=${encodeURIComponent(config.mainKeyword.replace(/\s/g, '+'))})\`
    2. **Body 1**: Inside first major section. \`![Detailed prompt relevant to this specific H2 section](https://placehold.co/800x400/EEE/31343C?text=Chart+1)\` (Wide)
    3. **Body 2**: Middle of article. \`![Detailed prompt relevant to this specific H2 section](https://placehold.co/600x600/EEE/31343C?text=Diagram)\` (Square)
    4. **Body 3**: Near end. \`![Detailed prompt relevant to this specific H2 section](https://placehold.co/1000x500/EEE/31343C?text=Infographic)\` (Large)
    
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
    
    ![Cover Image](...)
    
    [Content...]
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_AYOUB,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");
    
    // Parse the split response (Metadata JSON + Markdown Content)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    
    let metadata = {
      title: config.topic,
      slug: config.topic.toLowerCase().replace(/\s+/g, '-'),
      metaDescription: `A comprehensive guide about ${config.topic}.`
    };
    
    let content = text;

    if (jsonMatch) {
      try {
        const parsedMeta = JSON.parse(jsonMatch[1]);
        metadata = { ...metadata, ...parsedMeta };
        // Remove the JSON block from the content
        content = text.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.warn("Failed to parse metadata JSON from response", e);
      }
    }

    // Run auto-validation
    const validation = validateContentLocal(content, config.mainKeyword, config.secondaryKeywords);

    return {
      id: crypto.randomUUID(),
      type: config.type,
      title: metadata.title,
      slug: metadata.slug,
      metaDescription: metadata.metaDescription,
      content: content,
      validation,
      history: [] // Initialize empty history
    } as GeneratedContent;
  } catch (error) {
    console.error("Error generating article:", error);
    throw error;
  }
};

const validateContentLocal = (content: string, mainKeyword: string, secondaryKeywords: string[]): ValidationResult => {
  const lowerContent = content.toLowerCase();
  const lowerKeyword = mainKeyword.toLowerCase();

  // Check H1
  const h1Match = content.match(/^#\s+(.+)$/m);
  const h1Present = !!h1Match;
  const keywordInH1 = h1Match ? h1Match[1].toLowerCase().includes(lowerKeyword) : false;

  // Check Structure
  const structureValid = content.includes('## ') && content.includes('### ');
  
  // Check Intro (Approximate check for keyword in first 500 chars)
  const introText = content.substring(0, 500).toLowerCase();
  const introStructure = introText.includes(lowerKeyword);

  // Keyword Density & Count
  const keywordCount = (lowerContent.match(new RegExp(lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  const wordCount = content.split(/\s+/).length;
  const density = (keywordCount / wordCount) * 100;
  let keywordDensity: 'Low' | 'Good' | 'High' = 'Good';
  
  // Strict SEO density check (0.5% - 2.5%)
  if (density < 0.5) keywordDensity = 'Low';
  if (density > 2.5) keywordDensity = 'High';

  // Secondary Keywords
  let secCount = 0;
  secondaryKeywords.forEach(sk => {
    if (lowerContent.includes(sk.toLowerCase())) secCount++;
  });

  // Links
  const linksPresent = content.includes('](');
  
  // Sentence Length Check (Sample check on first paragraph)
  // Note: Regex is approximate for sentence splitting
  const sentences = content.split(/[.!?]+/);
  const avgSentenceLength = sentences.slice(0, 10).reduce((acc, s) => acc + s.split(' ').length, 0) / 10;
  const shortSentences = avgSentenceLength < 25; // Allowing slightly more flexibility in calc, but prompt is strict 20

  // SEO Score Calculation (Simple Algorithm for Checklist)
  let seoScore = 0;
  if (h1Present) seoScore += 10;
  if (keywordInH1) seoScore += 15;
  if (introStructure) seoScore += 10;
  if (keywordDensity === 'Good') seoScore += 15;
  if (secCount >= 3) seoScore += 15;
  if (structureValid) seoScore += 10;
  if (linksPresent) seoScore += 10;
  if (wordCount > 800) seoScore += 15;
  
  // Cap at 100
  seoScore = Math.min(100, seoScore);

  return {
    h1Present,
    keywordInH1,
    structureValid,
    introStructure,
    keywordDensity,
    secondaryKeywordsCount: secCount,
    shortSentences, 
    linksPresent,
    seoScore
  };
};

export const reviewArticleContent = async (content: string, config: SEOConfig): Promise<string> => {
  const prompt = `
    Act as a peer reviewer for the following article based on our internal SEO guidelines.
    
    Target Audience: ${config.audience}
    Main Keyword: ${config.mainKeyword}

    Check for:
    1. American English accuracy.
    2. Presence of 4 Images (1 Cover, 3 Body).
    3. Short sentences (max 20 words).
    4. NO social hashtags.
    5. Correct Markdown Header hierarchy (H1, H2, H3) and Sentence Case.

    Provide a bulleted list of specific improvements or validation points in Markdown.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          { text: `ARTICLE CONTENT:\n${content}` }
        ]
      },
      config: {
        systemInstruction: "You are a strict SEO Mentor performing a code/content review.",
      }
    });
    
    return response.text || "No review generated.";
  } catch (error) {
    console.error("Error reviewing article:", error);
    throw error;
  }
};

export const generateRealImage = async (prompt: string, aspectRatio: string = '16:9'): Promise<string> => {
  try {
    // Using Imagen 4 model for high quality image generation
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio,
        outputMimeType: 'image/jpeg'
      },
    });

    const base64String = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64String) throw new Error("No image data returned");
    
    return `data:image/jpeg;base64,${base64String}`;
  } catch (error) {
    console.error("Error generating real image:", error);
    throw error;
  }
};