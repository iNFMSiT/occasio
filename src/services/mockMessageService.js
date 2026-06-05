// Offline fallback for message generation (no API key). Tone-aware templates that
// use the recipient's name. Intentionally simple but not cheesy.

import { occasionLabel } from './messagePromptEngine.js';

const withName = (name, withN, without) => (name ? withN(name) : without);

const TEMPLATES = {
  heartfelt: (n) => [
    withName(n, (x) => `So glad it's you, ${x}.`, 'So glad it’s you.'),
    'Grateful for you, every day.',
    withName(n, (x) => `Here's to you, ${x}.`, 'Here’s to you.'),
  ],
  funny: (n) => [
    withName(n, (x) => `Older, wiser, still ridiculous, ${x}.`, 'Older, wiser, still ridiculous.'),
    'Aging like fine box wine.',
    withName(n, (x) => `Congrats, ${x}. You survived.`, 'Congrats. You survived.'),
  ],
  playful: (n) => [
    withName(n, (x) => `Let’s cause some trouble, ${x}.`, 'Let’s cause some trouble.'),
    'Officially your day to overdo it.',
    'Cake first. Rules later.',
  ],
  romantic: (n) => [
    withName(n, (x) => `Still you. Still everything, ${x}.`, 'Still you. Still everything.'),
    'My favorite person, full stop.',
    'Lucky doesn’t cover it.',
  ],
  sincere: (n) => [
    withName(n, (x) => `Thinking the world of you, ${x}.`, 'Thinking the world of you.'),
    'You make it look easy.',
    'Proud of you — truly.',
  ],
  witty: (n) => [
    withName(n, (x) => `Statistically, your best year yet, ${x}.`, 'Statistically, your best year yet.'),
    'Peaked? Hardly. Carry on.',
    'Excellent taste in cards, clearly.',
  ],
};

export function mockMessageOptions({ occasion, tone, recipient }) {
  const name = recipient?.name?.trim();
  const fn = TEMPLATES[tone] || TEMPLATES.heartfelt;
  const opts = fn(name);
  // Lightly weave the occasion into the first option when it's not a birthday.
  const occ = occasionLabel(occasion);
  if (occ && !/birthday/i.test(occ) && name) {
    opts[0] = `Happy ${occ}, ${name}.`;
  }
  return opts.slice(0, 3);
}
