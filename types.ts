
export enum ArticleType {
  PILLAR = 'PILLAR',
  SATELLITE = 'SATELLITE'
}

export type AIProvider = 'GEMINI' | 'OPENAI' | 'CLAUDE';

export interface User {
  email: string;
  accessId: string; // The "ID" or password
  name: string;
}

export interface SEOConfig {
  topic: string;
  audience: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  type: ArticleType;
  provider: AIProvider; // New field for selecting the AI model
  relatedPillarTopic?: string; // If type is satellite
  satelliteThemes?: string[]; // Optional: For Pillar article structure alignment
  apiKey?: string; // Optional API Key for external providers
}

export interface ArticleVersion {
  id: string;
  timestamp: number;
  content: string;
  note: string; // e.g., "Initial Draft", "Before Image Generation"
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface GeneratedContent {
  id: string;
  type: ArticleType;
  title: string;
  content: string;
  metaDescription: string;
  slug: string;
  validation?: ValidationResult;
  history: ArticleVersion[];
  chatHistory: ChatMessage[]; // Per-article chat history
}

export interface TopicSuggestion {
  topic: string;
  score: number; // 0-100 SEO Potential
}

export interface ClusterPlan {
  pillar: { title: string; mainKeyword: string };
  satellites: { title: string; mainKeyword: string }[];
}

export interface ValidationResult {
  h1Present: boolean;
  keywordInH1: boolean;
  structureValid: boolean; // Has H2/H3
  introStructure: boolean;
  keywordDensity: 'Low' | 'Good' | 'High';
  secondaryKeywordsCount: number;
  shortSentences: boolean;
  linksPresent: boolean;
  seoScore: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'Structure' | 'SEO' | 'Quality';
  checked: boolean;
}

export interface LogMessage {
  timestamp: number;
  text: string;
  type: 'info' | 'success' | 'error';
}
