// One-off: generate preview thumbnails for each art style + theme option, so the
// customize step can show "what this looks like". Generic subject, NO reference
// image (these are neutral examples, not the user's friend).
//
// Run:  node --env-file=.env scripts/genOptionPreviews.mjs
//
// Styles: hold subject + scene constant, vary only the style.
// Themes: hold style constant (hyper-realistic), vary the theme.

import { mkdirSync, writeFileSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import promptEngine from '../src/services/promptEngine.js';
import { ART_STYLES, THEMES } from '../src/config/constants.js';

const API_KEY = process.env.VITE_NANOBANANA_API_KEY;
if (!API_KEY) {
  console.error('Missing VITE_NANOBANANA_API_KEY (run with: node --env-file=.env ...)');
  process.exit(1);
}

const IMAGE_MODEL = 'gemini-2.5-flash-image';
const GENERIC_ANCHOR = 'a friendly young adult with an approachable smile, medium build, short dark hair';

// Copied from promptEngine.js (not exported there). Keep in sync if styles change.
const STYLE_INSTRUCTIONS = {
  'hand-animated': 'classic 2D hand-animated style with visible brushstrokes, cel-shading outlines, and soft painted backgrounds reminiscent of Studio Ghibli. Organic, slightly imperfect linework.',
  'pixar': 'Pixar 3D CGI with smooth subsurface scattering on skin, large expressive eyes, slightly exaggerated proportions, and cinematic volumetric lighting.',
  'hyper-realistic': 'photorealistic, shot on a Canon EOS R5 with 85mm f/1.4 lens. Natural skin texture with pores, realistic soft lighting, shallow depth of field, lifelike eyes with catchlights.',
  'watercolor': 'delicate watercolor on cold-pressed paper. Soft wet-on-wet gradients, visible paint blooms, translucent layers, white paper showing through highlights.',
  'oil-painting': 'classical oil painting with rich impasto brushwork, chiaroscuro lighting inspired by Rembrandt, deep saturated colors, and visible canvas texture.',
  'digital-art': 'modern digital illustration trending on ArtStation. Clean shapes with painterly rendering, vibrant saturated colors, and strong graphic composition.',
  'sketch': 'hand-drawn pencil and charcoal sketch on ivory paper. Visible hatching, smudged shadows, confident linework, with partial unfinished edges.',
  'anime': 'Japanese anime style with sharp clean lineart, large detailed eyes with highlight reflections, dynamic hair strands, and flat color shading with precise shadow cutoffs.',
  'comic-book': 'bold comic book art with thick ink outlines, Ben-Day dot halftone shading, flat primary colors, and dramatic foreshortening.',
  'vintage-poster': 'retro 1950s-60s poster design with a limited bold color palette, screen-print halftone texture, and Art Deco typography influence.',
};

const ai = new GoogleGenAI({ apiKey: API_KEY });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generate(prompt) {
  const res = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseModalities: ['TEXT', 'IMAGE'], imageGenerationConfig: { aspectRatio: '2:3', numberOfImages: 1 } },
  });
  const parts = res.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData);
  if (!img?.inlineData?.data) throw new Error('no image (model declined?)');
  return img.inlineData.data;
}

function stylePrompt(styleId) {
  return [
    '## Subject',
    `${GENERIC_ANCHOR}. Upper-body portrait, looking at the camera, plain neutral studio background.`,
    '',
    '## Style',
    `Rendered in ${STYLE_INSTRUCTIONS[styleId]}`,
    '',
    '## Composition',
    'Medium portrait from the chest up, centered, even lighting.',
    '',
    '## Output',
    'Highly detailed, strong example of this art style. Portrait 2:3 aspect ratio.',
  ].join('\n');
}

mkdirSync('scripts/out-previews/styles', { recursive: true });
mkdirSync('scripts/out-previews/themes', { recursive: true });

console.log(`Generating ${ART_STYLES.length} style previews…`);
for (let i = 0; i < ART_STYLES.length; i++) {
  const s = ART_STYLES[i];
  process.stdout.write(`  [${i + 1}/${ART_STYLES.length}] style:${s.id}… `);
  try {
    const b64 = await generate(stylePrompt(s.id));
    writeFileSync(`scripts/out-previews/styles/${s.id}.png`, Buffer.from(b64, 'base64'));
    console.log('ok');
  } catch (e) { console.log('FAILED:', e.message); }
  await sleep(1500);
}

console.log(`\nGenerating ${THEMES.length} theme previews (style: hyper-realistic)…`);
for (let i = 0; i < THEMES.length; i++) {
  const t = THEMES[i];
  const prompt = promptEngine.buildPrompt({
    anchorDescription: GENERIC_ANCHOR,
    style: 'hyper-realistic',
    theme: t.id,
    composition: 'mid-shot',
    mood: 'epic',
    surveyData: {},
    vibeProfile: { chaos: 0.4, energy: 0.6, humor: 0.3 },
    referenceImageIncluded: false,
  });
  process.stdout.write(`  [${i + 1}/${THEMES.length}] theme:${t.id}… `);
  try {
    const b64 = await generate(prompt);
    writeFileSync(`scripts/out-previews/themes/${t.id}.png`, Buffer.from(b64, 'base64'));
    console.log('ok');
  } catch (e) { console.log('FAILED:', e.message); }
  await sleep(1500);
}

console.log('\nDone. Previews in scripts/out-previews/{styles,themes}/');
