export enum ArticleType {
  PILLAR = 'PILLAR',
  SATELLITE = 'SATELLITE'
}

export interface SEOConfig {
  topic: string;
  audience: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  type: ArticleType;
  relatedPillarTopic?: string; // If type is satellite
}

export interface ArticleVersion {
  id: string;
  timestamp: number;
  content: string;
  note: string; // e.g., "Initial Draft", "Before Image Generation"
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