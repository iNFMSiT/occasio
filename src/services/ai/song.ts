// Song service abstraction — swap mock for real Suno when API access is available

import { mockSunoService } from '../mockSunoService.js';

// Set to true when real Suno API is available
const USE_REAL_SUNO = false;

function getSunoService() {
  if (USE_REAL_SUNO) {
    // TODO: import and return real Suno service
    // return realSunoService;
  }
  return mockSunoService;
}

export async function generateSong(prompt: any, options: any = {}) {
  const service = getSunoService();
  return service.generateSong(prompt, options);
}

export async function generateSongBatch(prompts: any, options: any = {}) {
  const service = getSunoService();
  return service.generateSongBatch(prompts, options);
}

export default { generateSong, generateSongBatch };
