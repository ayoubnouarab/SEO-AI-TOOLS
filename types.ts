
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

export interface WordPressConfig {
  siteUrl: string;
  username: string;
  applicationPassword: string;
}

export interface WordPressCategory {
  id: number;
  name: string;
  count: number;
}

export interface ArticleTemplate {
  id: string;
  label: string;
  description: string;
  defaultTone: string;
  structureInstruction: string;
}

export interface SEOConfig {
  topic: string;
  audience: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  type: ArticleType;
  templateId?: string; // New field for template selection
  targetWordCount?: string; // New field for word count preference
  provider: AIProvider; 
  relatedPillarTopic?: string; 
  satelliteThemes?: string[]; 
  apiKey?: string; 
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
  tags?: string[]; 
  slug: string;
  validation?: ValidationResult;
  history: ArticleVersion[];
  chatHistory: ChatMessage[]; 
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
