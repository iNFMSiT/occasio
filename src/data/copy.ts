// Customer-facing marketing copy, in one place.
//
// Positioning: DESIGN-FIRST. The AI-generated design is the hero asset; the card,
// song, and (soon) merch are ways to use it. Playful voice, any occasion. Today
// you can share, print, or download; a hosted singing-card link + merch are soon.
//
// The hero copy ships as three A/B-testable variants. Pick the active one with a
// `?v=<id>` URL param (e.g. ?v=reimagined) or persist via localStorage; otherwise
// the DEFAULT_VARIANT is used. Swap DEFAULT_VARIANT to change the default.

export const HERO_VARIANTS = {
  // DEFAULT — design-first, keeps the loved "it sings" differentiator.
  sings: {
    id: 'sings',
    kicker: 'ANY OCCASION · ONE DESIGN, MANY WAYS',
    headline: 'Custom designs that actually sing.',
    subhead:
      'Turn your photos into a one-of-a-kind design for any occasion — with a song to match. Share, print, or download it today; a singing-card link and merch are coming soon.',
    cta: 'Make yours',
  },
  // Brand-forward, design-as-hero.
  reimagined: {
    id: 'reimagined',
    kicker: 'PHOTOS IN · MASTERPIECE OUT',
    headline: 'Anyone, reimagined.',
    subhead:
      'Turn a photo into a custom design with a matching song, then share, print, or download it — merch on the way.',
    cta: 'Make a design',
  },
  // Versatility / merch tease.
  anything: {
    id: 'anything',
    kicker: 'YOUR DESIGN · ON ANYTHING',
    headline: 'Make it once. Use it everywhere.',
    subhead:
      'One custom design — share it as a singing card, print it, and soon put it on a mug, tee, or keychain. Any occasion, from your photos.',
    cta: 'Start designing',
  },
};

export const DEFAULT_VARIANT = 'sings';
const STORAGE_KEY = 'occ:variant';

type HeroVariantKey = keyof typeof HERO_VARIANTS;

/** Resolve the active hero variant: ?v=<id> → localStorage → default. */
export function getHeroVariant() {
  if (typeof window !== 'undefined') {
    try {
      const param = new URLSearchParams(window.location.search).get('v');
      if (param && (HERO_VARIANTS as Record<string, typeof HERO_VARIANTS[HeroVariantKey]>)[param]) {
        window.localStorage?.setItem(STORAGE_KEY, param);
        return (HERO_VARIANTS as Record<string, typeof HERO_VARIANTS[HeroVariantKey]>)[param];
      }
      const stored = window.localStorage?.getItem(STORAGE_KEY);
      if (stored && (HERO_VARIANTS as Record<string, typeof HERO_VARIANTS[HeroVariantKey]>)[stored])
        return (HERO_VARIANTS as Record<string, typeof HERO_VARIANTS[HeroVariantKey]>)[stored];
    } catch {
      /* ignore (private mode / SSR) */
    }
  }
  return HERO_VARIANTS[DEFAULT_VARIANT];
}

// Shared, static copy used across the marketing surfaces.
export const COPY = {
  shortTagline: 'Custom designs + songs, for any occasion.',

  selectorHeading: 'Start with a design',
  selectorInspirationCta: 'New here?',
  selectorInspirationLink: 'See designs people made',

  // The three-step "how it works" strip on the landing.
  howItWorks: [
    { title: 'Create', detail: 'Turn your photos into a custom design.' },
    { title: 'Personalize', detail: 'Add a song and a message.' },
    { title: 'Use it', detail: 'Share, print, or download — merch coming soon.' },
  ],

  giftTypes: {
    image: {
      label: 'Custom Design',
      description: 'A one-of-a-kind design from your photos — for cards, prints, and (soon) merch.',
    },
    song: {
      label: 'A Song to Match',
      description: 'A custom song made just for them — pairs with any design.',
    },
  },

  gallery: {
    headline: 'Designs people made',
    subtitle: 'Real designs others created — start from any one and make it yours.',
    makeThis: 'Make this design',
  },

  // Honest "coming soon" tease for not-yet-built outputs.
  comingSoon: [
    'A singing-card link (the song plays)',
    'Order prints & merch',
  ],
};
