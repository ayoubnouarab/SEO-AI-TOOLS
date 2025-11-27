
import { GoogleGenAI, Type, Schema, GenerateContentResponse, Modality } from "@google/genai";
import { SEOConfig, ArticleType, GeneratedContent, ClusterPlan, ValidationResult, TopicSuggestion, WordPressConfig, WordPressCategory, ArticleTemplate } from '../types';
import { uploadToBlob, base64ToBlob } from './blobService';

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

// --- TEMPLATE LIBRARY ---
export const ARTICLE_TEMPLATES: ArticleTemplate[] = [
  {
    id: 'ultimate-guide',
    label: 'Ultimate Guide (Pillar)',
    description: 'Comprehensive, deep-dive content covering A-Z of a topic.',
    defaultTone: 'Authoritative & Educational',
    structureInstruction: `
      **STRUCTURE (ULTIMATE GUIDE):**
      1. **The Hook**: Start with a relatable problem or a bold statement.
      2. **What is [Topic]?**: Define the core concept simply.
      3. **Why it Matters**: Explain the importance/benefits.
      4. **Core Strategy/Steps**: The "Meat" of the guide. Use H2s for steps and H3s for details.
      5. **Advanced Tactics**: Tips for experts.
      6. **Case Study/Example**: Real-world application.
      7. **FAQ**: Answer 3-5 common questions.
      8. **Conclusion & CTA**: Summarize and direct to next step.
    `
  },
  {
    id: 'listicle',
    label: 'Listicle / Roundup',
    description: 'Scannable list of items, tools, or tips. High click-through potential.',
    defaultTone: 'Exciting & Direct',
    structureInstruction: `
      **STRUCTURE (LISTICLE):**
      1. **Intro**: Quick hook, who is this for, and why they need this list.
      2. **The List**: Use H2 for each item name (e.g., "1. Tool Name").
         - Under each item include: "What is it?", "Key Features", "Pros/Cons", and "Pricing/Verdict".
      3. **Comparison Table**: A Markdown table summarizing the items.
      4. **Buying Guide**: What to look for when choosing.
      5. **Conclusion**: The #1 recommendation.
    `
  },
  {
    id: 'how-to',
    label: 'How-To Tutorial',
    description: 'Step-by-step instructions to solve a specific problem.',
    defaultTone: 'Instructional & Encouraging',
    structureInstruction: `
      **STRUCTURE (HOW-TO):**
      1. **Intro**: The end result (what will they achieve?).
      2. **Prerequisites**: What tools/knowledge do they need before starting?
      3. **Step-by-Step Guide**: Numbered H2 headers (e.g., "Step 1: [Action]").
         - Use bold text for buttons/actions.
         - Include "Pro Tips" in blockquotes.
      4. **Troubleshooting**: Common pitfalls and fixes.
      5. **Conclusion**: Encouragement to start.
    `
  },
  {
    id: 'comparison',
    label: 'Product Comparison (Vs)',
    description: 'Direct comparison between two or more competitors.',
    defaultTone: 'Objective & Analytical',
    structureInstruction: `
      **STRUCTURE (COMPARISON):**
      1. **Intro**: Why these two? The current market context.
      2. **At a Glance**: Quick summary table (Winner).
      3. **Round 1: Features**: Compare specific feature sets.
      4. **Round 2: Performance/Ease of Use**: User experience comparison.
      5. **Round 3: Pricing**: Value for money.
      6. **The Verdict**: Who should buy X, and who should buy Y?
    `
  },
  {
    id: 'case-study',
    label: 'Case Study / Analysis',
    description: 'Data-driven story of success or failure.',
    defaultTone: 'Professional & Data-Driven',
    structureInstruction: `
      **STRUCTURE (CASE STUDY):**
      1. **Executive Summary**: The result in 1 sentence (TL;DR).
      2. **The Challenge**: What was the problem before?
      3. **The Solution**: The strategy implemented.
      4. **The Results**: Hard numbers/data points (Use a markdown table).
      5. **Key Takeaways**: What the reader can learn from this.
    `
  }
];

// --- API KEY MANAGEMENT ---

const getApiKey = (): string => {
  // CRITICAL FIX FOR VERCEL:
  // Vercel/Vite requires EXPLICIT, DIRECT access to import.meta.env.VITE_API_KEY
  
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore error
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

export const hasValidApiKey = (): boolean => {
  const key = getApiKey();
  return !!key && key.length > 0 && key !== "MISSING_KEY_PLACEHOLDER";
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
-   **ASPECT RATIO**: Use strictly 19:9 (Panoramic) for all images.
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
      tags: metadata.tags, // Populate tags
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
  // Use Gemini 3 Pro Preview for Pillars for depth, but fallback if not enabled
  const modelId = config.type === ArticleType.PILLAR ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
  const client = getAIClient(config.apiKey);
  
  try {
    const response = await client.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_AYOUB,
        temperature: 0.7,
      },
    });
    return response.text || "";
  } catch (error: any) {
    console.warn(`Gemini model ${modelId} failed:`, error);
    
    // Automatic fallback to flash if pro fails
    if (modelId !== 'gemini-2.5-flash') {
        console.log("Falling back to gemini-2.5-flash...");
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION_AYOUB,
              temperature: 0.7,
            },
        });
        return response.text || "";
    }
    throw error;
  }
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

// --- WORDPRESS PUBLISHING SERVICE ---

const parseInlineMarkdown = (text: string): string => {
    return text
        // Bold **text**
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic *text*
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Links [text](url)
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
};

const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return "";

  const lines = markdown.split('\n');
  let html = "";
  let inList = false;
  let inQuote = false;
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Skip empty lines, close states if needed
    if (line === "") {
      if (inList) { html += "</ul>\n"; inList = false; }
      if (inQuote) { html += "</blockquote>\n"; inQuote = false; }
      if (inTable) { html += "</tbody></table></div>\n"; inTable = false; }
      continue;
    }

    // Table Detection: | Col | Col |
    if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
            html += '<div class="wp-block-table"><table><thead><tr>';
            const headers = line.split('|').filter(c => c.trim());
            headers.forEach(h => html += `<th>${parseInlineMarkdown(h.trim())}</th>`);
            html += '</tr></thead><tbody>';
            inTable = true;
            // Look ahead for separator line |---|
            if (i + 1 < lines.length && lines[i+1].includes('---')) {
                i++; // Skip separator
            }
        } else {
            html += '<tr>';
            const cells = line.split('|').filter(c => c.trim() !== ''); // Basic split
            cells.forEach(c => html += `<td>${parseInlineMarkdown(c.trim())}</td>`);
            html += '</tr>';
        }
        continue;
    } else if (inTable) {
        html += "</tbody></table></div>\n";
        inTable = false;
    }

    // Headers
    if (line.startsWith('# ')) {
      html += `<h1>${parseInlineMarkdown(line.substring(2))}</h1>\n`;
    } else if (line.startsWith('## ')) {
      html += `<h2>${parseInlineMarkdown(line.substring(3))}</h2>\n`;
    } else if (line.startsWith('### ')) {
      html += `<h3>${parseInlineMarkdown(line.substring(4))}</h3>\n`;
    } 
    // Blockquotes
    else if (line.startsWith('> ')) {
        if (!inQuote) { html += "<blockquote>"; inQuote = true; }
        html += `<p>${parseInlineMarkdown(line.substring(2))}</p>`;
    }
    // Images: ![alt](url)
    else if (line.match(/^!\[.*?\]\(.*?\)$/)) {
        const match = line.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (match) {
            html += `<figure><img src="${match[2]}" alt="${match[1]}" /><figcaption>${match[1]}</figcaption></figure>\n`;
        }
    }
    // Lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        html += "<ul>\n";
        inList = true;
      }
      html += `<li>${parseInlineMarkdown(line.substring(2))}</li>\n`;
    } 
    // Paragraphs
    else {
      if (inList) { html += "</ul>\n"; inList = false; }
      if (inQuote) { html += "</blockquote>\n"; inQuote = false; }
      html += `<p>${parseInlineMarkdown(line)}</p>\n`;
    }
  }

  if (inList) html += "</ul>\n";
  if (inQuote) html += "</blockquote>\n";
  if (inTable) html += "</tbody></table></div>\n";

  return html;
};

const formatWpUrl = (siteUrl: string): string => {
  let baseUrl = siteUrl.replace(/\/$/, "");
  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }
  return baseUrl;
};

// --- HELPER: Upload Image to WP Media Library ---
const uploadImageToWordPress = async (base64Data: string, altText: string, wpConfig: WordPressConfig): Promise<string> => {
    const baseUrl = formatWpUrl(wpConfig.siteUrl);
    const endpoint = `${baseUrl}/wp-json/wp/v2/media`;
    const authString = btoa(`${wpConfig.username}:${wpConfig.applicationPassword}`);

    // 1. Convert Base64 to Blob
    const mimeTypeMatch = base64Data.match(/^data:(.*?);base64,(.*)$/);
    if (!mimeTypeMatch) throw new Error("Invalid base64 image data");
    
    const mimeType = mimeTypeMatch[1];
    const byteCharacters = atob(mimeTypeMatch[2]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    // 2. Generate Filename
    const ext = mimeType.split('/')[1] || 'png';
    const filename = `ai-gen-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;

    // 3. Upload
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Type': mimeType
            },
            body: blob
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `WP Upload Error: ${response.status}`);
        }

        const data = await response.json();
        
        // 4. Update Alt Text (Optional but good for SEO)
        try {
            await fetch(`${endpoint}/${data.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ alt_text: altText })
            });
        } catch (e) {
            console.warn("Failed to set alt text", e);
        }

        return data.source_url; // The public URL of the image
    } catch (error) {
        console.error("Image Upload Failed", error);
        throw error;
    }
};

export const fetchWordPressCategories = async (wpConfig: WordPressConfig): Promise<WordPressCategory[]> => {
  if (!wpConfig.siteUrl || !wpConfig.username || !wpConfig.applicationPassword) {
    throw new Error("Missing WordPress credentials.");
  }
  
  const baseUrl = formatWpUrl(wpConfig.siteUrl);
  const endpoint = `${baseUrl}/wp-json/wp/v2/categories?per_page=100`;
  const authString = btoa(`${wpConfig.username}:${wpConfig.applicationPassword}`);
  
  try {
    const response = await fetch(endpoint, {
       method: 'GET',
       headers: {
         'Authorization': `Basic ${authString}`
       }
    });
    
    if (!response.ok) {
       const err = await response.json().catch(() => ({}));
       throw new Error(err.message || `WP Error: ${response.status}`);
    }
    
    const categories = await response.json();
    return categories.map((c: any) => ({
      id: c.id,
      name: c.name,
      count: c.count
    }));
  } catch (error) {
    console.error("Failed to fetch WP Categories:", error);
    throw error;
  }
};

export const publishToWordPress = async (article: GeneratedContent, wpConfig: WordPressConfig, categoryId?: number, status: string = 'draft', scheduledDate?: string): Promise<string> => {
  if (!wpConfig.siteUrl || !wpConfig.username || !wpConfig.applicationPassword) {
    throw new Error("Missing WordPress configuration details.");
  }

  const baseUrl = formatWpUrl(wpConfig.siteUrl);
  const endpoint = `${baseUrl}/wp-json/wp/v2/posts`;
  const authString = btoa(`${wpConfig.username}:${wpConfig.applicationPassword}`);

  // --- IMAGE UPLOAD HANDLER ---
  // Iterate through content to find base64 images, upload them, and replace with WP URLs
  let finalMarkdown = article.content;
  const imageRegex = /!\[(.*?)\]\((data:image\/.*?;base64,.*?)\)/g;
  let match;
  const uploads = [];
  
  // Find all images first
  while ((match = imageRegex.exec(article.content)) !== null) {
      uploads.push({ fullMatch: match[0], alt: match[1], data: match[2] });
  }

  if (uploads.length > 0) {
      console.log(`Found ${uploads.length} generated images. Uploading to WordPress Media Library...`);
      for (const item of uploads) {
          try {
              const wpImageUrl = await uploadImageToWordPress(item.data, item.alt, wpConfig);
              // Replace the huge base64 string with the nice WP URL
              finalMarkdown = finalMarkdown.replace(item.data, wpImageUrl);
          } catch (e) {
              console.warn(`Failed to upload image: ${item.alt}. Removing from content to prevent errors.`);
              // If upload fails, strip the image to save the text content at least
              finalMarkdown = finalMarkdown.replace(item.fullMatch, `> [Image upload failed for: ${item.alt}]`);
          }
      }
  }

  // Convert content with robust parser (handles tables, lists, headers)
  const htmlContent = convertMarkdownToHtml(finalMarkdown);

  if (!htmlContent) throw new Error("Content generation resulted in empty HTML.");

  // Prepare payload
  const postData: any = {
    title: article.title,
    content: htmlContent,
    status: status, // Use the selected status (draft, publish, pending, future)
    excerpt: article.metaDescription,
    slug: article.slug,
  };
  
  // Handle scheduling (only relevant if status is 'future')
  if (status === 'future' && scheduledDate) {
      // Ensure strict ISO 8601 with seconds (YYYY-MM-DDTHH:mm:ss) for WordPress API
      // If input is YYYY-MM-DDTHH:mm (16 chars), we append :00
      if (scheduledDate.length <= 16) {
          postData.date = `${scheduledDate}:00`;
      } else {
          postData.date = scheduledDate;
      }
  }
  
  if (categoryId) {
    postData.categories = [categoryId];
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `WordPress Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.link || "Published successfully";
  } catch (error) {
    console.error("WP Publish Error:", error);
    throw error;
  }
};

// --- HELPER FUNCTIONS ---

const buildArticlePrompt = (config: SEOConfig): string => {
  const targetRepetition = config.type === ArticleType.PILLAR ? '60' : '15';

  // Determine structure instructions based on Template Selection or Type
  let structureInstruction = "";
  
  if (config.templateId) {
    const selectedTemplate = ARTICLE_TEMPLATES.find(t => t.id === config.templateId);
    if (selectedTemplate) {
      structureInstruction = `
      **TEMPLATE MODE ACTIVE: ${selectedTemplate.label}**
      Tone Goal: ${selectedTemplate.defaultTone}
      
      ${selectedTemplate.structureInstruction}
      
      **NOTE:** The H2 headers above are required structure. Adapt the content to the topic "${config.topic}".
      `;
    }
  } else {
    // Default fallback logic if no template selected
    structureInstruction = config.type === ArticleType.PILLAR 
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
  }

  return `
    Write a world-class article in Native American English.
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
    **ASPECT RATIO**: Use strictly 19:9 (1900x900 px).
    **RULES**: Do NOT include the article title in the image text or Alt text. Keep Alt text purely descriptive of the visual (e.g., "A laptop showing an SEO dashboard", not "Article: SEO Tools - A laptop").
    
    1. **Cover Image**: MUST BE placed immediately after the # H1 Title line.
       Format: \`![Visual description of cover](https://placehold.co/1900x900/EEE/31343C)\`
    
    2. **Body 1**: Inside first major section. \`![Visual description of chart](https://placehold.co/1900x900/EEE/31343C)\`
    3. **Body 2**: Middle of article. \`![Visual description of diagram](https://placehold.co/1900x900/EEE/31343C)\`
    4. **Body 3**: Near end. \`![Visual description of infographic](https://placehold.co/1900x900/EEE/31343C)\`
    
    OUTPUT:
    Raw Markdown starting with this JSON block:
    \`\`\`json
    {
      "title": "${config.topic.toLowerCase()}",
      "slug": "slug-url",
      "metaDescription": "seo description",
      "tags": ["tag1", "tag2", "tag3"]
    }
    \`\`\`
    
    # ${config.topic.toLowerCase()}
    
    ![Visual description of cover](...)
    
    [Content starts here...]
  `;
};

const parseArticleResponse = (text: string, topic: string) => {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  let metadata = {
    title: topic,
    slug: topic.toLowerCase().replace(/\s+/g, '-'),
    metaDescription: `A comprehensive guide about ${topic}.`,
    tags: [] as string[]
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
  let base64Result: string | null = null;
  
  // Handle non-standard aspect ratios for the API
  // 19:9 is not a standard supported ratio for Gemini/Imagen APIs, mapping to 16:9 to ensure success
  let apiAspectRatio = aspectRatio;
  if (aspectRatio === '19:9') {
      console.log("Mapping non-standard 19:9 aspect ratio to 16:9 for API compatibility.");
      apiAspectRatio = '16:9';
  }

  // 1. Try Imagen 3 (Standard)
  try {
    console.log(`Attempting image generation with model: imagen-3.0-generate-001 (Ratio: ${apiAspectRatio})`);
    const response = await client.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: prompt,
      config: { numberOfImages: 1, aspectRatio: apiAspectRatio, outputMimeType: 'image/jpeg' },
    });
    const base64String = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64String) base64Result = `data:image/jpeg;base64,${base64String}`;
  } catch (error) {
    console.warn("Imagen 3 failed:", error);
    lastError = error;
  }

  // 2. Try Gemini 3 Pro Image Preview (High Quality Content Gen with imageConfig)
  if (!base64Result) {
    try {
      console.log(`Attempting image generation with model: gemini-3-pro-image-preview (Ratio: ${apiAspectRatio})`);
      const response = await client.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
              aspectRatio: apiAspectRatio, 
              imageSize: "1K"
          }
        }
      });

      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
             base64Result = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
             break;
          }
        }
      }
    } catch (error) {
      console.warn("Gemini 3 Pro Image failed:", error);
      lastError = error;
    }
  }

  // 3. Try Gemini 2.5 Flash Image (Fallback using generateContent)
  if (!base64Result) {
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
             base64Result = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
             break;
          }
        }
      }
    } catch (error) {
      console.warn("Gemini Flash Image failed:", error);
      lastError = error;
    }
  }

  // 4. Try Imagen 4 (Premium Fallback)
  if (!base64Result) {
    try {
      console.log(`Attempting image generation with model: imagen-4.0-generate-001 (Ratio: ${apiAspectRatio})`);
      const response = await client.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, aspectRatio: apiAspectRatio, outputMimeType: 'image/jpeg' },
      });
      const base64String = response.generatedImages?.[0]?.image?.imageBytes;
      if (base64String) base64Result = `data:image/jpeg;base64,${base64String}`;
    } catch (error) {
      console.warn("Imagen 4 failed:", error);
      lastError = error;
    }
  }

  if (!base64Result) {
    throw lastError || new Error("Image generation failed on all models.");
  }

  // --- UPLOAD TO BLOB IF CONFIGURED ---
  try {
    const blob = await base64ToBlob(base64Result);
    const filename = `img-${Date.now()}.png`;
    const blobUrl = await uploadToBlob(blob, filename);
    return blobUrl;
  } catch (e) {
    console.warn("Failed to upload to blob, returning base64", e);
    return base64Result;
  }
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
    
    // Upload to Blob
    try {
        const filename = `vid-${Date.now()}.mp4`;
        const blobUrl = await uploadToBlob(blob, filename);
        return blobUrl;
    } catch (e) {
        return URL.createObjectURL(blob);
    }
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
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");

    const bytes = decodeBase64ToBytes(base64Audio);
    // The model output is raw PCM, so we wrap it in WAV container.
    const blob = injectWavHeader(bytes, 24000);
    
    // Upload to Blob
    try {
        const filename = `audio-${Date.now()}.wav`;
        const blobUrl = await uploadToBlob(blob, filename);
        return blobUrl;
    } catch (e) {
        return URL.createObjectURL(blob);
    }
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

export const generateAudioMimic = async (base64RefAudio: string, mimeType: string, textToSpeak: string): Promise<string> => {
   try {
    const client = getAIClient();
    // Reverting to the logic that worked: Flash Native Audio Preview if available, else TTS.
    // But since user reported 404, we stick to TTS fallback logic.
    return await generateSpeech(textToSpeak, 'Kore'); 

  } catch (error) {
    console.error("Error generating mimic audio:", error);
    throw error;
  }
};