// Mock data service for development without API calls

import type { BlueprintItem, GenerateBatchOptions, GeneratedCard, GenerateImageOptions } from './ai/types';

const MOCK_ANCHOR = `Young adult, appears mid-20s, male presentation. Medium-length brown hair, slightly wavy, swept to the side. Oval face shape with defined jawline. Brown eyes, medium build. Clean-shaven with a warm, friendly expression. No glasses. Wearing a casual t-shirt.`;

const MOCK_STYLES = [
  { gradient: ['#667eea', '#764ba2'], label: 'Mystical' },
  { gradient: ['#f093fb', '#f5576c'], label: 'Vibrant' },
  { gradient: ['#4facfe', '#00f2fe'], label: 'Cool' },
  { gradient: ['#43e97b', '#38f9d7'], label: 'Fresh' },
  { gradient: ['#fa709a', '#fee140'], label: 'Warm' },
  { gradient: ['#a18cd1', '#fbc2eb'], label: 'Dreamy' },
  { gradient: ['#fccb90', '#d57eeb'], label: 'Sunset' },
  { gradient: ['#e0c3fc', '#8ec5fc'], label: 'Sky' },
];

function generateMockImage(index: number, style: string | undefined, theme: string | undefined): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 900;
  // Non-null assertion: '2d' context is always available on a newly-created canvas element.
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const mockStyle = MOCK_STYLES[index % MOCK_STYLES.length];
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, mockStyle.gradient[0]);
  grad.addColorStop(1, mockStyle.gradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(
      300 + Math.cos(i * 0.8) * 120,
      450 + Math.sin(i * 0.8) * 180,
      80 + i * 30,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // Card number
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 64px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`#${index + 1}`, 300, 200);

  // Style label
  ctx.font = '28px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(style || mockStyle.label, 300, 450);

  // Theme label
  ctx.font = '22px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText(theme || 'Preview', 300, 500);

  // "MOCK" watermark
  ctx.font = 'bold 18px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText('MOCK - DEV MODE', 300, 850);

  return canvas.toDataURL('image/jpeg', 0.9);
}

export const mockService = {
  async analyzeImage(_file: File): Promise<string> {
    await new Promise((r) => setTimeout(r, 1200));
    return MOCK_ANCHOR;
  },

  async generateImage(prompt: string, options: GenerateImageOptions = {}): Promise<GeneratedCard> {
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1000));
    const index = options.cardIndex ?? 0;
    return {
      imageUrl: generateMockImage(index, options.style, options.theme),
      prompt,
      model: 'mock',
      description: 'Mock generated card',
    };
  },

  async generateBatch(blueprintItems: BlueprintItem[], options: GenerateBatchOptions = {}): Promise<GeneratedCard[]> {
    const results: GeneratedCard[] = [];
    for (let i = 0; i < blueprintItems.length; i++) {
      const item = blueprintItems[i];
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

      results.push({
        imageUrl: generateMockImage(i, item.style, item.theme),
        prompt: item.prompt,
        model: 'mock',
        cardIndex: item.cardIndex,
        style: item.style,
        theme: item.theme,
        composition: item.composition,
        mood: item.mood,
      });

      if (options.onProgress) {
        options.onProgress({ current: i + 1, total: blueprintItems.length });
      }
    }
    return results;
  },
};
