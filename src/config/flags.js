// MVP-specific configuration
// Scoped down from full 52-card deck for proof of concept

export const MVP_CONFIG = {
  CARD_COUNT: 6,
  PREVIEW_COUNT: 2,
  MAX_STYLES: 3,
  MAX_THEMES: 3,

  // Feature flags
  SKIP_QUALITY_CHECK: true,
  SKIP_UPSCALING: true,
  SHOW_MOCKUPS: true,

  // Scaled diversity constraints (proportional to 6 cards)
  DIVERSITY: {
    COMPOSITION_TARGETS: {
      'close-up': 2,
      'mid-shot': 2,
      'full-body': 2,
    },
    MOOD_DISTRIBUTION: {
      'epic': 2,
      'funny': 2,
      'serious': 1,
      'abstract': 1,
    },
  },
};
