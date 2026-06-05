// One-off: generate the Hall of Fame "Make this" example images using the real
// Gemini pipeline + the app's prompt engine, with Austin's photo as the subject.
//
// Run:  node --env-file=.env scripts/genHallOfFame.mjs
//
// Reuses src/services/promptEngine.js (pure) and calls @google/genai directly
// (mirrors src/services/geminiService.js) so output matches the live app.

import { readFileSync, writeFileSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import promptEngine from '../src/services/promptEngine.js';

const API_KEY = process.env.VITE_NANOBANANA_API_KEY;
if (!API_KEY) {
  console.error('Missing VITE_NANOBANANA_API_KEY (run with: node --env-file=.env ...)');
  process.exit(1);
}

const VISION_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'gemini-2.5-flash-image';
const SUBJECT = 'public/assets/BEST/IMG_3590.jpg';

const VISION_PROMPT = `You are creating a detailed visual reference description of this person for an AI image generator. Describe skin tone, face shape, eyes, eyebrows, nose, mouth/lips, hair (color/texture/length/style), facial hair, build, glasses/accessories, and any distinctive features. Write a single flowing paragraph. Be extremely specific. Do NOT include names.`;

// Recipes — must match HALL_OF_FAME in src/config/inspirationRecipes.js
const RECIPES = [
  { id: 'space-explorer', style: 'pixar',           theme: 'sci-fi',    mood: 'epic',   freeText: 'floating in space in a sleek astronaut suit near a glowing planet, planting a flag' },
  { id: 'epic-hero',      style: 'hyper-realistic', theme: 'superhero', mood: 'epic',   freeText: 'dramatic hero pose on a rooftop at sunset, cape flowing, neon city skyline below' },
  { id: 'arcane-wizard',  style: 'oil-painting',    theme: 'fantasy',   mood: 'serious',freeText: 'wielding glowing magical energy in an enchanted library full of floating books' },
  { id: 'anime-warrior',  style: 'anime',           theme: 'fantasy',   mood: 'epic',   freeText: 'epic anime warrior with a glowing katana, cherry blossom petals swirling in the wind' },
  { id: 'retro-rockstar', style: 'vintage-poster',  theme: 'careers',   mood: 'funny',  freeText: '1980s rockstar shredding a guitar on stage under neon spotlights' },
  { id: 'slam-dunk',      style: 'pixar',           theme: 'sports',    mood: 'epic',   freeText: 'leaping for a huge slam dunk in a packed arena, confetti and roaring crowd' },
];

const ai = new GoogleGenAI({ apiKey: API_KEY });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function analyze(base64, mime) {
  const res = await ai.models.generateContent({
    model: VISION_MODEL,
    contents: [{ role: 'user', parts: [{ text: VISION_PROMPT }, { inlineData: { mimeType: mime, data: base64 } }] }],
  });
  const text = res.candidates?.[0]?.content?.parts?.filter((p) => p.text).map((p) => p.text).join(' ');
  if (!text) throw new Error('vision analysis returned no text');
  return text.trim();
}

async function generate(prompt, refBase64) {
  const res = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: refBase64 } }] }],
    config: { responseModalities: ['TEXT', 'IMAGE'], imageGenerationConfig: { aspectRatio: '2:3', numberOfImages: 1 } },
  });
  const parts = res.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData);
  if (!img?.inlineData?.data) throw new Error('no image in response (model may have declined)');
  return img.inlineData.data;
}

const refBase64 = readFileSync(SUBJECT).toString('base64');
console.log('Analyzing subject photo…');
const anchor = await analyze(refBase64, 'image/jpeg');
console.log('Anchor:', anchor.slice(0, 120) + '…\n');

for (let i = 0; i < RECIPES.length; i++) {
  const r = RECIPES[i];
  const prompt = promptEngine.buildPrompt({
    anchorDescription: anchor,
    style: r.style,
    theme: r.theme,
    composition: 'full-body',
    mood: r.mood,
    surveyData: { freeText: r.freeText },
    vibeProfile: { chaos: 0.5, energy: 0.7, humor: r.mood === 'funny' ? 0.8 : 0.3 },
    referenceImageIncluded: true,
  });
  process.stdout.write(`[${i + 1}/${RECIPES.length}] ${r.id} (${r.style}/${r.theme})… `);
  try {
    const b64 = await generate(prompt, refBase64);
    writeFileSync(`scripts/out/${r.id}.png`, Buffer.from(b64, 'base64'));
    console.log('saved');
  } catch (e) {
    console.log('FAILED:', e.message);
  }
  if (i < RECIPES.length - 1) await sleep(1500);
}
console.log('\nDone. Images in scripts/out/');
