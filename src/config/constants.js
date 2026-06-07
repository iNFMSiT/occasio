// Style Battle Options
export const STYLE_BATTLES = [
  { id: 'action-vs-cozy', left: 'High-Octane Action', right: 'Cozy/Whimsical' },
  { id: 'neon-vs-vintage', left: 'Vibrant Neon', right: 'Vintage Sepia' },
  { id: '3d-vs-handdrawn', left: '3D Pixar Style', right: 'Hand-Drawn Sketch' },
  { id: 'realistic-vs-stylized', left: 'Photorealistic', right: 'Stylized/Cartoon' },
  { id: 'dark-vs-light', left: 'Dark/Moody', right: 'Bright/Cheerful' },
];

// Mystery Box Themes
export const MYSTERY_BOXES = [
  { id: '80s', label: 'The 80s Box', description: 'Retro 80s vibes' },
  { id: 'galactic', label: 'The Galactic Box', description: 'Space and sci-fi' },
  { id: 'nightmare', label: 'The Nightmare Box', description: 'Spooky and dark' },
  { id: 'royal', label: 'The Royal Box', description: 'Kings, queens, and nobility' },
  { id: 'adventure', label: 'The Adventure Box', description: 'Explorers and quests' },
  { id: 'random', label: 'The Random Box', description: 'A mix of all themes - surprise me!' },
];

// Card Composition Types
export const COMPOSITION_TYPES = {
  CLOSE_UP: 'close-up',
  MID_SHOT: 'mid-shot',
  FULL_BODY: 'full-body',
};

// Mood Types
export const MOOD_TYPES = {
  EPIC: 'epic',
  FUNNY: 'funny',
  SERIOUS: 'serious',
  ABSTRACT: 'abstract',
};

// Diversity Constraints
export const DIVERSITY_CONSTRAINTS = {
  MAX_COLOR_DOMINANCE: 10, // Max cards with same dominant color
  COMPOSITION_TARGETS: {
    [COMPOSITION_TYPES.CLOSE_UP]: 15,
    [COMPOSITION_TYPES.MID_SHOT]: 20,
    [COMPOSITION_TYPES.FULL_BODY]: 17,
  },
  MOOD_DISTRIBUTION: {
    [MOOD_TYPES.EPIC]: 13,
    [MOOD_TYPES.FUNNY]: 13,
    [MOOD_TYPES.SERIOUS]: 13,
    [MOOD_TYPES.ABSTRACT]: 13,
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  VISION_ANALYSIS: '/api/vision/analyze',
  IMAGE_GENERATE: '/api/images/generate',
  IMAGE_UPSCALE: '/api/images/upscale',
  JOB_STATUS: '/api/jobs/status',
  QUALITY_CHECK: '/api/quality/check',
};

// Print Specifications
export const PRINT_SPECS = {
  DPI: 300,
  CARD_SIZE: { width: 2.5, height: 3.5 }, // inches (legacy playing-card)
  BLEED: 0.125, // inches
  MIN_RESOLUTION: { width: 3000, height: 4500 }, // pixels at 300 DPI
};

// Printable greeting-card export. All sizes in inches; rendered at PRINT_SPECS.DPI.
export const CARD_EXPORT = {
  DPI: 300,
  panelMargin: 0.2, // safe inner margin so home printers don't clip artwork
  guide: { color: '#c8c8c8', dash: [6, 6], width: 1 }, // fold/cut guide styling (px @ DPI)

  paper: {
    letter: { id: 'letter', label: 'US Letter', width: 8.5, height: 11 },
    a4: { id: 'a4', label: 'A4', width: 8.27, height: 11.69 },
  },

  formats: {
    // ONE sheet, single-sided, fold twice → 4.25 × 5.5 portrait card.
    quarterFold: {
      id: 'quarterFold',
      label: 'Quarter-fold (print at home)',
      pages: 1,
      finished: { width: 4.25, height: 5.5 },
      usesPaper: true, // page = chosen paper size
    },
    // 2-page spread (outside / inside), double-sided → folds to 5 × 7 portrait card.
    halfFold5x7: {
      id: 'halfFold5x7',
      label: '5×7 (print shop / double-sided)',
      pages: 2,
      finished: { width: 5, height: 7 },
      spread: { width: 10, height: 7 }, // flat page size for each side
      usesPaper: false,
    },
  },
};
