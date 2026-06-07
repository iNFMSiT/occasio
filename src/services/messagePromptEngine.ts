// Builds the prompt for AI front-of-card message generation.
// Goal: short, specific, on-tone lines that sound human — NOT Hallmark clichés.

import { OCCASIONS } from '../data/occasions';
import type { SurveyData } from '../types';

/** Occasion value accepted by the engine — mirrors MessageRequest in ai/message.ts. */
type OccasionValue = string | { label: string } | null | undefined;

/** Survey data as seen by the message engine (superset of base SurveyData). */
type MessageSurveyData = SurveyData & {
  insideJokes?: string[];
};

/** Parameters for buildMessagePrompt — mirrors MessageRequest in ai/message.ts. */
interface MessagePromptParams {
  occasion?: OccasionValue;
  tone?: string;
  recipient?: { name: string; relationship: string };
  surveyData?: MessageSurveyData;
}

export function occasionLabel(occasion: OccasionValue): string | null {
  if (!occasion) return null;
  if (typeof occasion === 'object') return occasion.label || null;
  const match = OCCASIONS.find((o) => o.id === occasion);
  return match ? match.label : occasion;
}

const TONE_GUIDE: Record<string, string> = {
  heartfelt: 'warm and genuine; emotionally sincere without being saccharine',
  funny: 'actually funny — a clever joke or gentle roast, not corny puns',
  playful: 'light, fun, a little cheeky',
  romantic: 'affectionate and intimate; sweet but never cheesy',
  sincere: 'plain-spoken and honest; understated warmth',
  witty: 'dry, smart, a touch of irony',
};

export function buildMessagePrompt({ occasion, tone, recipient, surveyData }: MessagePromptParams): string {
  const occ = occasionLabel(occasion) || 'a special occasion';
  const toneDesc = TONE_GUIDE[tone ?? ''] || TONE_GUIDE.heartfelt;
  const name = recipient?.name?.trim();
  const rel = recipient?.relationship?.trim();

  const details: string[] = [];
  if (surveyData?.hobbies?.length) details.push(`they love ${surveyData.hobbies.slice(0, 2).join(' and ')}`);
  if (surveyData?.favoriteShows?.length) details.push(`into ${surveyData.favoriteShows[0]}`);
  if (surveyData?.insideJokes?.length) details.push(`inside joke: ${surveyData.insideJokes[0]}`);
  if (surveyData?.freeText?.trim()) details.push(`extra note: ${surveyData.freeText.trim()}`);

  const playful = tone === 'playful' || tone === 'funny';

  return [
    'You are a sharp, warm greeting-card writer who despises clichés.',
    '',
    '## Card',
    `Occasion: ${occ}`,
    `Recipient: ${name || 'the recipient'}${rel ? ` (your ${rel})` : ''}`,
    details.length ? `About them: ${details.join('; ')}` : '',
    `Tone: ${tone} — ${toneDesc}`,
    '',
    '## Task',
    'Write 3 DISTINCT short messages for the FRONT (cover) of the card.',
    '',
    '## Rules',
    '- Each ≤ 8 words. Punchy — it must look great large on a cover.',
    '- Specific to THIS person and occasion; use the name naturally when it helps.',
    '- Match the tone exactly; make the three options genuinely different from each other.',
    '- BANNED clichés (never use): "another year older", "thinking of you", "best wishes",',
    '  "hbd", "happy happy", "to the moon and back", "wishing you", "may all your dreams".',
    `- At most ONE exclamation mark across all three. No hashtags.${playful ? ' At most one tasteful emoji total.' : ' No emojis.'}`,
    '- Sound like a real person talking to them, not a card company.',
    '',
    '## Output',
    'Return ONLY a JSON array of exactly 3 strings. No commentary, no keys.',
  ]
    .filter((l) => l !== '')
    .join('\n');
}
