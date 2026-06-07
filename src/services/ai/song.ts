// Song service abstraction — swap mock for real Suno when API access is available

import { mockSunoService } from '../mockSunoService';

// Set to true when real Suno API is available
const USE_REAL_SUNO = false;

/** Shape produced by songPromptEngine.buildPrompt / createBlueprint. */
export interface SongPrompt {
  fullPrompt: string;
  genres: string[];
  vibes: string[];
  tempo: string;
  index?: number;
  label?: string;
}

/** Callbacks/context forwarded to the underlying Suno service. */
export interface SongOptions {
  onProgress?: (progress: { current: number; total: number; phase: string }) => void;
  surveyData?: Record<string, unknown>;
}

function getSunoService() {
  if (USE_REAL_SUNO) {
    // TODO: import and return real Suno service
    // return realSunoService;
  }
  return mockSunoService;
}

export async function generateSong(prompt: SongPrompt, options: SongOptions = {}) {
  const service = getSunoService();
  return service.generateSong(prompt, options);
}

export async function generateSongBatch(prompts: SongPrompt[], options: SongOptions = {}) {
  const service = getSunoService();
  return service.generateSongBatch(prompts, options);
}

export default { generateSong, generateSongBatch };
