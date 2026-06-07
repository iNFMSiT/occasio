// Direct Gemini API integration for Nanobanana image generation
import { GoogleGenAI } from '@google/genai';
import type { Content } from '@google/genai';
import { GEMINI_CONFIG, isApiConfigured } from '../config/gemini.js';
import type { BlueprintItem, GenerateBatchOptions, GeneratedCard, GenerateImageOptions } from './ai/types';

// Robustly parse the model's reply into up to 3 clean message strings.
// Handles a JSON array, fenced code blocks, or plain numbered/bulleted lines.
export function parseMessageOptions(text: string | null | undefined): string[] {
  if (!text) return [];
  let s = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

  const jsonStart = s.indexOf('[');
  if (jsonStart !== -1) {
    try {
      const arr = JSON.parse(s.slice(jsonStart, s.lastIndexOf(']') + 1));
      if (Array.isArray(arr)) {
        return arr.map((x) => String(x).trim()).filter(Boolean).slice(0, 3);
      }
    } catch {
      /* fall through to line parsing */
    }
  }

  return s
    .split('\n')
    .map((l) => l.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, '').replace(/^["'“”]+|["'“”]+$/g, '').trim())
    .filter(Boolean)
    .slice(0, 3);
}

class GeminiService {
  private client: GoogleGenAI | null;

  constructor() {
    this.client = null;
    this._initClient();
  }

  private _initClient(): void {
    if (isApiConfigured()) {
      this.client = new GoogleGenAI({ apiKey: GEMINI_CONFIG.apiKey });
    }
  }

  private _getModelId(tier: string | undefined): string {
    const key = tier ?? GEMINI_CONFIG.defaultModel;
    const models = GEMINI_CONFIG.models as Record<string, { id: string } | undefined>;
    const model = models[key];
    return model?.id ?? GEMINI_CONFIG.models.nanoBanana.id;
  }

  // Convert a File to base64 string
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // reader.result is string when readAsDataURL is used; cast is safe here.
        const dataUrl = reader.result as string;
        // Strip the data:image/xxx;base64, prefix
        resolve(dataUrl.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Analyze a photo to extract a text description of the person ("The Anchor")
  async analyzeImage(imageFile: File): Promise<string> {
    if (!this.client) throw new Error('Gemini API not configured. Check your API key.');

    const base64 = await this.fileToBase64(imageFile);

    const contents: Content[] = [
      {
        role: 'user',
        parts: [
          { text: GEMINI_CONFIG.visionPrompt },
          { inlineData: { mimeType: imageFile.type, data: base64 } },
        ],
      },
    ];

    const response = await this.client.models.generateContent({
      model: GEMINI_CONFIG.visionModel,
      contents,
    });

    const text = response.candidates?.[0]?.content?.parts
      ?.filter((p) => p.text)
      .map((p) => p.text)
      .join(' ');

    if (!text) throw new Error('Could not analyze the image. Please try a different photo.');
    return text.trim();
  }

  // Generate short greeting-card message options from a text prompt.
  // Returns an array of strings (the prompt instructs a JSON array of 3).
  async generateMessages(prompt: string): Promise<string[]> {
    if (!this.client) throw new Error('Gemini API not configured. Check your API key.');

    const contents: Content[] = [{ role: 'user', parts: [{ text: prompt }] }];

    const response = await this.client.models.generateContent({
      model: GEMINI_CONFIG.visionModel, // gemini-2.5-flash (text)
      contents,
    });

    const text = (response.candidates?.[0]?.content?.parts
      ?.filter((p) => p.text)
      .map((p) => p.text)
      .join('') ?? '').trim();

    return parseMessageOptions(text);
  }

  // Generate a single card image from a prompt
  async generateImage(prompt: string, options: GenerateImageOptions = {}): Promise<GeneratedCard> {
    if (!this.client) throw new Error('Gemini API not configured. Check your API key.');

    const modelId = this._getModelId(options.modelTier);

    const contents: Content[] = [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    // Include reference image for face consistency if provided
    if (options.referenceImageBase64) {
      contents[0].parts!.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: options.referenceImageBase64,
        },
      });
    }

    const response = await this.client.models.generateContent({
      model: modelId,
      contents,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        // NOTE: the original JS passed `imageGenerationConfig: { aspectRatio, numberOfImages }`,
        // but that field name is not recognized by @google/genai and was silently dropped at
        // runtime — so no aspect ratio was ever sent. Preserving that behavior here.
        // To actually enforce GEMINI_CONFIG.imageConfig.aspectRatio (2:3), pass `imageConfig: { aspectRatio }` — tracked as a separate intentional change.
      },
    });

    // Extract the base64 image from the response
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData);
    const textPart = parts.find((p) => p.text);

    if (!imagePart?.inlineData?.data) {
      throw new Error('No image was generated. The model may have declined the prompt.');
    }

    const mimeType = imagePart.inlineData.mimeType ?? 'image/png';
    const imageUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

    return {
      imageUrl,
      prompt,
      model: modelId,
      description: textPart?.text ?? '',
    };
  }

  // Generate multiple images sequentially with progress callback
  async generateBatch(blueprintItems: BlueprintItem[], options: GenerateBatchOptions = {}): Promise<GeneratedCard[]> {
    const results: GeneratedCard[] = [];
    const { onProgress, modelTier, referenceImageBase64 } = options;
    const delay = GEMINI_CONFIG.rateLimits.delayBetweenRequests;

    for (let i = 0; i < blueprintItems.length; i++) {
      const item = blueprintItems[i];

      try {
        const result = await this.generateImage(item.prompt, {
          modelTier,
          referenceImageBase64,
          aspectRatio: GEMINI_CONFIG.imageConfig.aspectRatio,
        });

        results.push({
          ...result,
          cardIndex: item.cardIndex,
          style: item.style,
          theme: item.theme,
          composition: item.composition,
          mood: item.mood,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Failed to generate card ${i}:`, err);
        results.push({
          imageUrl: null,
          error: message,
          cardIndex: item.cardIndex,
          style: item.style,
          theme: item.theme,
          prompt: item.prompt,
        });
      }

      if (onProgress) {
        onProgress({ current: i + 1, total: blueprintItems.length });
      }

      // Rate limit delay between requests
      if (i < blueprintItems.length - 1) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    return results;
  }
}

export default new GeminiService();
