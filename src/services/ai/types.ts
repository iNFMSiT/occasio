export interface BlueprintItem {
  cardIndex: number;
  prompt: string;
  style: string;
  theme: string;
  composition: string;
  mood: string;
  madLibId?: string | null;
}

export interface GenerateBatchOptions {
  modelTier?: string;
  referenceImageBase64?: string | null;
  onProgress?: (progress: { current: number; total: number }) => void;
}

export interface GenerateImageOptions {
  modelTier?: string;
  referenceImageBase64?: string | null;
  aspectRatio?: string;
  cardIndex?: number;
  style?: string;
  theme?: string;
}

// Actual object returned per card by generateBatch (and generateImage).
// Some fields are absent on error paths or single-image calls — match JS reality.
export interface GeneratedCard {
  imageUrl: string | null;
  prompt: string;
  model?: string;
  cardIndex?: number;
  style?: string;
  theme?: string;
  composition?: string;
  mood?: string;
  description?: string;
  error?: string;
}

export interface ImageProvider {
  usesReferenceImage: boolean;
  analyzeImage(file: File): Promise<string>;
  fileToBase64(file: File): Promise<string | null>;
  generateBatch(items: BlueprintItem[], options: GenerateBatchOptions): Promise<GeneratedCard[]>;
  generateImage(prompt: string, options?: GenerateImageOptions): Promise<GeneratedCard>;
}
