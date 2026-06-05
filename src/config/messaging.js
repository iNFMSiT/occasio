// Customer-facing marketing copy, in one place.
//
// Positioning: a playful, ANY-occasion, print-at-home greeting CARD (the hero)
// with a companion custom SONG, leading with the instant / no-shipping angle.
//
// The hero copy ships as three A/B-testable variants. Pick the active one with a
// `?v=<id>` URL param (e.g. ?v=printer) or persist via localStorage; otherwise the
// DEFAULT_VARIANT is used. Swap DEFAULT_VARIANT to change the default for everyone.

export const HERO_VARIANTS = {
  // DEFAULT — leads with our unique differentiator (the card comes with a song).
  sings: {
    id: 'sings',
    kicker: 'ANY OCCASION · PRINT AT HOME TONIGHT',
    headline: 'Greeting cards that actually sing.',
    subhead:
      'Make a one-of-a-kind card for any occasion, get a custom song to match, and print it at home tonight — no store, no shipping, no “I forgot.”',
    cta: 'Make their card',
  },
  // Relatable last-minute hook (high-intent procrastinators).
  forgot: {
    id: 'forgot',
    kicker: 'READY TONIGHT · NO SHIPPING',
    headline: 'Forgot a card again? Make a way better one.',
    subhead:
      'A custom card for any occasion — with a song to match — designed and printed at home in minutes.',
    cta: 'Save the day',
  },
  // Print-at-home flex.
  printer: {
    id: 'printer',
    kicker: 'ANY OCCASION · NO STORE, NO SHIPPING',
    headline: "The best gift they'll get — straight from your printer.",
    subhead:
      'Make a custom card for any occasion, add a song to match, then download, print, and fold at home.',
    cta: 'Start a card',
  },
};

export const DEFAULT_VARIANT = 'sings';
const STORAGE_KEY = 'occ:variant';

/** Resolve the active hero variant: ?v=<id> → localStorage → default. */
export function getHeroVariant() {
  if (typeof window !== 'undefined') {
    try {
      const param = new URLSearchParams(window.location.search).get('v');
      if (param && HERO_VARIANTS[param]) {
        window.localStorage?.setItem(STORAGE_KEY, param);
        return HERO_VARIANTS[param];
      }
      const stored = window.localStorage?.getItem(STORAGE_KEY);
      if (stored && HERO_VARIANTS[stored]) return HERO_VARIANTS[stored];
    } catch {
      /* ignore (private mode / SSR) */
    }
  }
  return HERO_VARIANTS[DEFAULT_VARIANT];
}

// Shared, static copy used across the marketing surfaces.
export const COPY = {
  shortTagline: 'Custom cards + songs, printed at home.',

  selectorHeading: 'Start with a card',
  selectorInspirationCta: 'New here?',
  selectorInspirationLink: 'See cards people made',

  // The three-step "how it works" strip on the landing.
  howItWorks: [
    { title: 'Make it', detail: 'Pick a style, add your photos & details.' },
    { title: 'Download', detail: 'Get a print-ready card in seconds.' },
    { title: 'Print & fold', detail: 'Standard card size — print at home.' },
  ],

  giftTypes: {
    image: {
      label: 'Printable Greeting Card',
      description: 'A one-of-a-kind card for any occasion — print & fold at home.',
    },
    song: {
      label: 'A Song to Match',
      description: 'A custom song made just for them. Pair it with your card.',
    },
  },

  gallery: {
    headline: 'Cards people made',
    subtitle: 'Real cards others created — start from any one and make it yours.',
    makeThis: 'Make this card',
  },
};
