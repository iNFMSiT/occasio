import type { SurveyData } from './survey';

export type ProductMedium = 'image' | 'song';
export type ProductFormat = 'digital' | 'postcard' | 'card-deck' | 'mug';

export interface ProductType {
  id: string;
  medium: ProductMedium;
  label: string;
  description: string;
  steps: string[];
  surveyId: string;
  enabled: boolean;
}

export interface GenerationOutput {
  id: string;
  medium: ProductMedium;
  url: string;
  prompt: string;
  rating?: number;
  createdAt: number;
}

export interface ProductSpec {
  occasionId?: string;
  surveyData: SurveyData;
  selections: Record<string, string[]>;
  prompt?: string;
}

export interface Product {
  id: string;
  typeId: string;
  spec: ProductSpec;
  outputs: GenerationOutput[];
  status: 'draft' | 'generating' | 'review' | 'complete';
  createdAt: number;
  updatedAt: number;
}
