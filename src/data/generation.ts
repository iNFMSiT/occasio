export const COMPOSITION_TYPES = {
  CLOSE_UP: 'close-up',
  MID_SHOT: 'mid-shot',
  FULL_BODY: 'full-body',
} as const;

export const MOOD_TYPES = {
  EPIC: 'epic',
  FUNNY: 'funny',
  SERIOUS: 'serious',
  ABSTRACT: 'abstract',
} as const;

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
} as const;
