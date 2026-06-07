import { isApiConfigured } from '../../config/gemini.js';
import { geminiImageProvider, mockImageProvider } from './imageProvider';
import type { ImageProvider } from './types';

/** Pick the image provider. Mock when dev mode is on or no API key is configured. */
export function getImageProvider({ devMode }: { devMode: boolean }): ImageProvider {
  return devMode || !isApiConfigured() ? mockImageProvider : geminiImageProvider;
}

export type { ImageProvider } from './types';
