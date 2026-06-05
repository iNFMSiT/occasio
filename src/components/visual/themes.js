// Visual theme registry.
//
// Each theme has two halves that must stay in sync:
//   1. CSS color tokens + background + display font, defined in src/index.css under
//      [data-theme="<id>"]. These drive every Tailwind `bg-brand` / `text-text` etc.
//   2. The JS values below (shader gradient colors, 3D accent, mood), which can't live
//      in CSS because they're passed as props to the WebGL canvas / R3F scene.
//
// The ThemeProvider sets document.documentElement.dataset.theme = id so the CSS half
// activates, and exposes the matching object below so the visual half stays aligned.

export const THEMES = {
  // The original look — keeps the app unchanged until a direction is chosen.
  default: {
    id: 'default',
    label: 'Original',
    isLight: false,
    // Soft indigo/amber drift over the near-black base.
    shaderColors: ['#0f0c1a', '#3b1d6e', '#7c3aed', '#f59e0b'],
    distortion: 0.8,
    swirl: 0.6,
    // 3D centerpiece material accent (hex number for three.js).
    accent3d: 0x7c3aed,
    sparkleColor: '#a78bfa',
  },

  // A — warm, festive, light. Greeting-card / joyful gifting energy.
  confetti: {
    id: 'confetti',
    label: 'Confetti',
    isLight: true,
    shaderColors: ['#FBF7F0', '#F2547D', '#F4B740', '#2DD4BF'],
    distortion: 0.9,
    swirl: 0.5,
    accent3d: 0xf2547d,
    sparkleColor: '#F4B740',
  },

  // B — premium, refined dark. Champagne + soft rose on near-black plum.
  velvet: {
    id: 'velvet',
    label: 'Velvet Studio',
    isLight: false,
    shaderColors: ['#15121C', '#3A2E4A', '#E5C07B', '#E8A0A8'],
    distortion: 0.7,
    swirl: 0.45,
    accent3d: 0xe5c07b,
    sparkleColor: '#E8A0A8',
  },

  // C — vibrant, bold, playful. Electric indigo + hot pink + lime pops.
  pop: {
    id: 'pop',
    label: 'Pop Party',
    isLight: false,
    shaderColors: ['#0E0B2A', '#6C5BFF', '#FF4DA6', '#C4F042'],
    distortion: 1.0,
    swirl: 0.75,
    accent3d: 0x6c5bff,
    sparkleColor: '#FF4DA6',
  },
};

// The directions offered in the temporary switcher (excludes the original).
export const DIRECTION_IDS = ['confetti', 'velvet', 'pop'];

export const getTheme = (id) => THEMES[id] || THEMES.default;
