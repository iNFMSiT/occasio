// Curated front-of-card text styles. Each bundles a web font + treatment so users
// pick a look (not a raw font). Fonts must be loaded in index.html and awaited via
// document.fonts.load() before canvas drawing (see cardExport.ensureFontsLoaded).
//
// case: 'upper' | 'title' | 'none'   effect: 'shadow' | 'outline' | 'banner' | 'none'

export const TEXT_STYLES = [
  { id: 'elegant', label: 'Elegant', family: '"Playfair Display", Georgia, serif', weight: 700, case: 'title', effect: 'shadow', defaultColor: '#ffffff' },
  { id: 'bold',    label: 'Bold',    family: '"Anton", Impact, sans-serif',        weight: 400, case: 'upper', effect: 'shadow', defaultColor: '#ffffff' },
  { id: 'playful', label: 'Playful', family: '"Caveat", "Comic Sans MS", cursive', weight: 700, case: 'none',  effect: 'shadow', defaultColor: '#ffffff' },
  { id: 'script',  label: 'Script',  family: '"Pacifico", cursive',                weight: 400, case: 'none',  effect: 'shadow', defaultColor: '#ffffff' },
  { id: 'clean',   label: 'Clean',   family: '"Space Grotesk", Arial, sans-serif', weight: 700, case: 'upper', effect: 'banner', defaultColor: '#1b1622' },
  { id: 'classic', label: 'Classic', family: '"Inter", Arial, sans-serif',         weight: 700, case: 'title', effect: 'banner', defaultColor: '#1b1622' },
];

export const getTextStyle = (id) => TEXT_STYLES.find((s) => s.id === id) || TEXT_STYLES[0];

// Swatches: { id, label, value }. `banner`-effect styles render dark text on a light
// banner, so they pair with dark colors; shadow/outline styles pair with light.
export const TEXT_COLORS = [
  { id: 'white', label: 'White', value: '#ffffff' },
  { id: 'ink', label: 'Ink', value: '#1b1622' },
  { id: 'gold', label: 'Gold', value: '#f4b740' },
  { id: 'coral', label: 'Coral', value: '#f2547d' },
  { id: 'teal', label: 'Teal', value: '#2dd4bf' },
  { id: 'brand', label: 'Brand', value: '#7c3aed' },
];

export const POSITIONS = [
  { id: 'top', label: 'Top' },
  { id: 'center', label: 'Center' },
  { id: 'bottom', label: 'Bottom' },
];

// Tones offered for AI smart-generate.
export const MESSAGE_TONES = [
  { id: 'heartfelt', label: 'Heartfelt' },
  { id: 'funny', label: 'Funny' },
  { id: 'playful', label: 'Playful' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'sincere', label: 'Sincere' },
  { id: 'witty', label: 'Witty' },
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Randomize style + color + position into a coherent look. */
export function shuffleFrontStyle() {
  const style = pick(TEXT_STYLES);
  // banner styles read best dark; shadow/outline read best light
  const pool = style.effect === 'banner' ? TEXT_COLORS.filter((c) => c.value !== '#ffffff') : TEXT_COLORS;
  return {
    styleId: style.id,
    color: pick(pool).value,
    placement: pick(POSITIONS).id,
  };
}
