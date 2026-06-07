import geminiService from '../geminiService.js';
import { mockService } from '../mockService';
import type { ImageProvider } from './types';

export const geminiImageProvider: ImageProvider = {
  usesReferenceImage: true,
  analyzeImage: (file) => geminiService.analyzeImage(file),
  fileToBase64: (file) => geminiService.fileToBase64(file),
  generateBatch: (items, options) => geminiService.generateBatch(items, options),
  generateImage: (prompt, options) => geminiService.generateImage(prompt, options),
};

export const mockImageProvider: ImageProvider = {
  usesReferenceImage: false,
  // mockService.analyzeImage exists and returns a mock anchor string.
  analyzeImage: (file) => mockService.analyzeImage(file),
  // mockService has no fileToBase64; stub returns null (no reference image in mock mode).
  fileToBase64: async (_file) => null,
  generateBatch: (items, options) => mockService.generateBatch(items, options),
  generateImage: (prompt, options) => mockService.generateImage(prompt, options),
};
