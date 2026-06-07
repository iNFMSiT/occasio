// Front-of-card message generation — real (Gemini) with offline mock fallback.

import geminiService from '../geminiService';
import { isApiConfigured } from '../../config/gemini.js';
import { buildMessagePrompt } from '../messagePromptEngine';
import { mockMessageOptions } from '../mockMessageService';
import type { SurveyData } from '../../types';

interface MessageRequest {
  /** Occasion id string or object with a label; null/undefined = generic. */
  occasion?: string | { label: string } | null;
  /** Tone key: 'heartfelt' | 'funny' | 'playful' | 'romantic' | 'sincere' | 'witty' */
  tone?: string;
  /** Card recipient — name and relationship used for personalisation. */
  recipient?: { name: string; relationship: string };
  /** Full survey answers forwarded to the prompt engine for extra detail. */
  surveyData?: SurveyData;
}

/** Returns up to 3 short, on-tone front-of-card message options. */
export async function generateMessageOptions({ occasion, tone, recipient, surveyData }: MessageRequest): Promise<string[]> {
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
