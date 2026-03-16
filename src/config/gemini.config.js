// Gemini API Configuration for Nanobanana integration

export const GEMINI_CONFIG = {
  apiKey: import.meta.env.VITE_NANOBANANA_API_KEY || '',

  // Vision model for analyzing uploaded photos (text-only output)
  visionModel: 'gemini-2.5-flash',

  // Image generation models — three tiers
  models: {
    nanoBananaLegacy: {
      id: 'gemini-2.0-flash-exp-image-generation',
      label: 'Nano Banana OG',
      description: 'Original model, fast & cheap',
      badge: 'OG',
      costPerImage: 0.01,
      maxResolution: '1K',
      retiring: 'March 31, 2026',
    },
    nanoBanana: {
      id: 'gemini-2.5-flash-image',
      label: 'Nano Banana',
      description: 'Best speed/quality balance, up to 2K',
      badge: '2.5',
      costPerImage: 0.04,
      maxResolution: '2K',
    },
    nanoBananaPro: {
      id: 'gemini-3-pro-image-preview',
      label: 'Nano Banana Pro',
      description: 'Highest quality, 4K, 14 ref images',
      badge: 'PRO',
      costPerImage: 0.13,
      maxResolution: '4K',
    },
  },

  defaultModel: 'nanoBanana',

  imageConfig: {
    aspectRatio: '2:3', // Playing card ratio
    numberOfImages: 1,
  },

  visionPrompt: `You are creating a detailed visual reference description of this person for an AI image generator. The description must be specific enough that another AI can recreate their likeness accurately across multiple images in different styles.

Describe in this exact order:
1. SKIN: Exact skin tone (e.g. "warm medium-brown", "pale ivory with pink undertones", "deep mahogany"), any freckles, moles, or birthmarks
2. FACE SHAPE: Precise face shape (oval, round, square, heart, oblong, diamond)
3. EYES: Eye shape, exact color, eyebrow shape/thickness/color, any asymmetry
4. NOSE: Shape and size (button, aquiline, broad, narrow, upturned)
5. MOUTH/LIPS: Lip shape, fullness, natural color
6. HAIR: Exact color (not just "brown" — specify "warm chestnut brown with subtle auburn highlights"), texture (straight, wavy, curly, coily), length, current style, parting
7. FACIAL HAIR: If present — style, coverage, color
8. BUILD: Approximate body type and proportions visible in the photo
9. GLASSES/ACCESSORIES: Any glasses (frame shape, color), jewelry, piercings, visible tattoos
10. DISTINCTIVE FEATURES: Dimples, scars, gap teeth, prominent cheekbones, strong jaw — anything that makes this person uniquely recognizable

Write it as a single flowing paragraph, not a list. Be extremely specific. Do NOT include names.`,

  rateLimits: {
    maxConcurrent: 2,
    delayBetweenRequests: 1500, // ms
  },
};

export function isApiConfigured() {
  return GEMINI_CONFIG.apiKey && GEMINI_CONFIG.apiKey.length > 10;
}
