// Direct Gemini API integration for Nanobanana image generation
import { GoogleGenAI } from '@google/genai';
import { GEMINI_CONFIG, isApiConfigured } from '../config/gemini.js';

// Robustly parse the model's reply into up to 3 clean message strings.
// Handles a JSON array, fenced code blocks, or plain numbered/bulleted lines.
export function parseMessageOptions(text) {
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
  constructor() {
    this.client = null;
    this._initClient();
  }

  _initClient() {
    if (isApiConfigured()) {
      this.client = new GoogleGenAI({ apiKey: GEMINI_CONFIG.apiKey });
    }
  }

  _getModelId(tier) {
    const model = GEMINI_CONFIG.models[tier || GEMINI_CONFIG.defaultModel];
    return model?.id || GEMINI_CONFIG.models.nanoBanana.id;
  }

  // Convert a File to base64 string
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        // Strip the data:image/xxx;base64, prefix
        resolve(dataUrl.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Analyze a photo to extract a text description of the person ("The Anchor")
  async analyzeImage(imageFile) {
    if (!this.client) throw new Error('Gemini API not configured. Check your API key.');

    const base64 = await this.fileToBase64(imageFile);

    const response = await this.client.models.generateContent({
      model: GEMINI_CONFIG.visionModel,
      contents: [
        {
          role: 'user',
          parts: [
            { text: GEMINI_CONFIG.visionPrompt },
            { inlineData: { mimeType: imageFile.type, data: base64 } },
          ],
        },
      ],
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
  async generateMessages(prompt) {
    if (!this.client) throw new Error('Gemini API not configured. Check your API key.');

    const response = await this.client.models.generateContent({
      model: GEMINI_CONFIG.visionModel, // gemini-2.5-flash (text)
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = (response.candidates?.[0]?.content?.parts
      ?.filter((p) => p.text)
      .map((p) => p.text)
      .join('') || '').trim();

    return parseMessageOptions(text);
  }

  // Generate a single card image from a prompt
  async generateImage(prompt, options = {}) {
    if (!this.client) throw new Error('Gemini API not configured. Check your API key.');

    const modelId = this._getModelId(options.modelTier);

    const contents = [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    // Include reference image for face consistency if provided
    if (options.referenceImageBase64) {
      contents[0].parts.push({
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
        imageGenerationConfig: {
          aspectRatio: options.aspectRatio || GEMINI_CONFIG.imageConfig.aspectRatio,
          numberOfImages: 1,
        },
      },
    });

    // Extract the base64 image from the response
    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData);
    const textPart = parts.find((p) => p.text);

    if (!imagePart?.inlineData?.data) {
      throw new Error('No image was generated. The model may have declined the prompt.');
    }

    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    const imageUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

    return {
      imageUrl,
      prompt,
      model: modelId,
      description: textPart?.text || '',
    };
  }

  // Generate multiple images sequentially with progress callback
  async generateBatch(blueprintItems, options = {}) {
    const results = [];
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
        console.error(`Failed to generate card ${i}:`, err);
        results.push({
          imageUrl: null,
          error: err.message,
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
