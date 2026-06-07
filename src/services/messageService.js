// Front-of-card message generation — real (Gemini) with offline mock fallback.

import geminiService from './geminiService.js';
import { isApiConfigured } from '../config/gemini.js';
import { buildMessagePrompt } from './messagePromptEngine.js';
import { mockMessageOptions } from './mockMessageService.js';

/** Returns up to 3 short, on-tone front-of-card message options. */
export async function generateMessageOptions({ occasion, tone, recipient, surveyData }) {
  if (isApiConfigured()) {
    try {
      const prompt = buildMessagePrompt({ occasion, tone, recipient, surveyData });
      const opts = await geminiService.generateMessages(prompt);
      if (opts.length) return opts.slice(0, 3);
    } catch (e) {
      console.error('Message generation failed; falling back to templates:', e);
    }
  }
  return mockMessageOptions({ occasion, tone, recipient });
}
