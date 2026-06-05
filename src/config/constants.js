// Art Styles Configuration
export const ART_STYLES = [
  { id: 'hand-animated', label: 'Hand Animated', description: 'Classic 2D animation style' },
  { id: 'pixar', label: 'Pixar 3D', description: '3D animated movie style' },
  { id: 'hyper-realistic', label: 'Hyper Realistic', description: 'Photorealistic rendering' },
  { id: 'watercolor', label: 'Watercolor', description: 'Soft, painted watercolor style' },
  { id: 'oil-painting', label: 'Oil Painting', description: 'Classic oil painting aesthetic' },
  { id: 'digital-art', label: 'Digital Art', description: 'Modern digital illustration' },
  { id: 'sketch', label: 'Hand-Drawn Sketch', description: 'Pencil/charcoal sketch style' },
  { id: 'anime', label: 'Anime', description: 'Japanese animation style' },
  { id: 'comic-book', label: 'Comic Book', description: 'Classic comic book art' },
  { id: 'vintage-poster', label: 'Vintage Poster', description: 'Retro poster design' },
];

// Theme Categories
export const THEMES = [
  { id: 'celebrities', label: 'Celebrities', description: 'Transform into famous personalities' },
  { id: 'careers', label: 'Careers', description: 'Professional roles and jobs' },
  { id: 'time-traveler', label: 'Time Traveler/Fantasy', description: 'Historical and fantasy settings' },
  { id: 'wildcard', label: 'Wildcard', description: 'Unexpected and creative scenarios' },
  { id: 'sports', label: 'Sports', description: 'Athletic activities and sports' },
  { id: 'superhero', label: 'Superhero', description: 'Comic book heroes and powers' },
  { id: 'sci-fi', label: 'Sci-Fi', description: 'Futuristic and space themes' },
  { id: 'fantasy', label: 'Fantasy', description: 'Magic, dragons, and fantasy worlds' },
  { id: 'historical', label: 'Historical', description: 'Different time periods' },
  { id: 'food', label: 'Food & Cooking', description: 'Culinary adventures' },
];

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

// Mad Libs Templates
export const MAD_LIBS_TEMPLATES = [
  {
    id: 'character-interest-style',
    template: 'I want my friend to look like a {character} who loves {interest} in the style of {style}',
    fields: [
      {
        id: 'character',
        label: 'Character',
        options: [
          { value: 'viking', label: 'Viking' },
          { value: 'wizard', label: 'Wizard' },
          { value: 'astronaut', label: 'Astronaut' },
          { value: 'samurai', label: 'Samurai' },
          { value: 'pirate', label: 'Pirate' },
          { value: 'knight', label: 'Knight' },
          { value: 'ninja', label: 'Ninja' },
          { value: 'cowboy', label: 'Cowboy' },
        ],
      },
      {
        id: 'interest',
        label: 'Interest',
        options: [
          { value: 'tacos', label: 'Tacos' },
          { value: 'pizza', label: 'Pizza' },
          { value: 'coffee', label: 'Coffee' },
          { value: 'music', label: 'Music' },
          { value: 'basketball', label: 'Basketball' },
          { value: 'gaming', label: 'Gaming' },
          { value: 'reading', label: 'Reading' },
          { value: 'traveling', label: 'Traveling' },
        ],
      },
      {
        id: 'style',
        label: 'Style',
        options: [
          { value: '1950s-comic', label: 'A 1950s Comic' },
          { value: 'anime', label: 'Anime' },
          { value: 'pixar', label: 'Pixar' },
          { value: 'watercolor', label: 'Watercolor' },
          { value: 'oil-painting', label: 'Oil Painting' },
          { value: 'sketch', label: 'Hand-Drawn Sketch' },
          { value: 'comic-book', label: 'Comic Book' },
          { value: 'vintage-poster', label: 'Vintage Poster' },
        ],
      },
    ],
  },
  {
    id: 'profession-setting-mood',
    template: 'My friend as a {profession} in a {setting} with a {mood} atmosphere',
    fields: [
      {
        id: 'profession',
        label: 'Profession',
        options: [
          { value: 'chef', label: 'Chef' },
          { value: 'scientist', label: 'Scientist' },
          { value: 'artist', label: 'Artist' },
          { value: 'detective', label: 'Detective' },
          { value: 'pilot', label: 'Pilot' },
          { value: 'doctor', label: 'Doctor' },
          { value: 'engineer', label: 'Engineer' },
          { value: 'musician', label: 'Musician' },
        ],
      },
      {
        id: 'setting',
        label: 'Setting',
        options: [
          { value: 'futuristic-city', label: 'Futuristic City' },
          { value: 'medieval-castle', label: 'Medieval Castle' },
          { value: 'tropical-beach', label: 'Tropical Beach' },
          { value: 'space-station', label: 'Space Station' },
          { value: 'underwater', label: 'Underwater' },
          { value: 'forest', label: 'Mystical Forest' },
          { value: 'desert', label: 'Desert' },
          { value: 'mountain', label: 'Mountain Peak' },
        ],
      },
      {
        id: 'mood',
        label: 'Mood',
        options: [
          { value: 'epic', label: 'Epic' },
          { value: 'mysterious', label: 'Mysterious' },
          { value: 'cheerful', label: 'Cheerful' },
          { value: 'dramatic', label: 'Dramatic' },
          { value: 'peaceful', label: 'Peaceful' },
          { value: 'energetic', label: 'Energetic' },
          { value: 'nostalgic', label: 'Nostalgic' },
          { value: 'surreal', label: 'Surreal' },
        ],
      },
    ],
  },
  {
    id: 'superhero-power-style',
    template: 'My friend as a {superhero} with {power} powers, styled like {style}',
    fields: [
      {
        id: 'superhero',
        label: 'Superhero Type',
        options: [
          { value: 'superhero', label: 'Classic Superhero' },
          { value: 'supervillain', label: 'Supervillain' },
          { value: 'anti-hero', label: 'Anti-Hero' },
          { value: 'mutant', label: 'Mutant' },
          { value: 'cyborg', label: 'Cyborg' },
          { value: 'magician', label: 'Magician' },
          { value: 'ninja-warrior', label: 'Ninja Warrior' },
          { value: 'space-ranger', label: 'Space Ranger' },
        ],
      },
      {
        id: 'power',
        label: 'Power',
        options: [
          { value: 'fire', label: 'Fire Control' },
          { value: 'ice', label: 'Ice Manipulation' },
          { value: 'teleportation', label: 'Teleportation' },
          { value: 'super-strength', label: 'Super Strength' },
          { value: 'flight', label: 'Flight' },
          { value: 'invisibility', label: 'Invisibility' },
          { value: 'time-control', label: 'Time Control' },
          { value: 'shapeshifting', label: 'Shapeshifting' },
        ],
      },
      {
        id: 'style',
        label: 'Style',
        options: [
          { value: 'comic-book', label: 'Comic Book' },
          { value: 'anime', label: 'Anime' },
          { value: 'pixar', label: 'Pixar 3D' },
          { value: 'hyper-realistic', label: 'Hyper Realistic' },
          { value: 'watercolor', label: 'Watercolor' },
          { value: 'sketch', label: 'Hand-Drawn Sketch' },
          { value: 'vintage-poster', label: 'Vintage Poster' },
          { value: 'digital-art', label: 'Digital Art' },
        ],
      },
    ],
  },
  {
    id: 'time-period-activity-style',
    template: 'My friend as a {timePeriod} {role} doing {activity} in {style} style',
    fields: [
      {
        id: 'timePeriod',
        label: 'Time Period',
        options: [
          { value: 'ancient', label: 'Ancient' },
          { value: 'medieval', label: 'Medieval' },
          { value: 'renaissance', label: 'Renaissance' },
          { value: 'victorian', label: 'Victorian' },
          { value: '1920s', label: '1920s' },
          { value: '1950s', label: '1950s' },
          { value: '1980s', label: '1980s' },
          { value: 'futuristic', label: 'Futuristic' },
        ],
      },
      {
        id: 'role',
        label: 'Role',
        options: [
          { value: 'noble', label: 'Noble' },
          { value: 'merchant', label: 'Merchant' },
          { value: 'scholar', label: 'Scholar' },
          { value: 'warrior', label: 'Warrior' },
          { value: 'explorer', label: 'Explorer' },
          { value: 'inventor', label: 'Inventor' },
          { value: 'artist', label: 'Artist' },
          { value: 'philosopher', label: 'Philosopher' },
        ],
      },
      {
        id: 'activity',
        label: 'Activity',
        options: [
          { value: 'battling', label: 'Battling' },
          { value: 'exploring', label: 'Exploring' },
          { value: 'creating', label: 'Creating' },
          { value: 'discovering', label: 'Discovering' },
          { value: 'celebrating', label: 'Celebrating' },
          { value: 'meditating', label: 'Meditating' },
          { value: 'performing', label: 'Performing' },
          { value: 'teaching', label: 'Teaching' },
        ],
      },
      {
        id: 'style',
        label: 'Style',
        options: [
          { value: 'oil-painting', label: 'Oil Painting' },
          { value: 'watercolor', label: 'Watercolor' },
          { value: 'sketch', label: 'Hand-Drawn Sketch' },
          { value: 'vintage-poster', label: 'Vintage Poster' },
          { value: 'hyper-realistic', label: 'Hyper Realistic' },
          { value: 'pixar', label: 'Pixar 3D' },
          { value: 'anime', label: 'Anime' },
          { value: 'comic-book', label: 'Comic Book' },
        ],
      },
    ],
  },
  {
    id: 'creature-element-style',
    template: 'My friend transformed into a {creature} with {element} powers, rendered in {style}',
    fields: [
      {
        id: 'creature',
        label: 'Creature',
        options: [
          { value: 'dragon', label: 'Dragon' },
          { value: 'phoenix', label: 'Phoenix' },
          { value: 'griffin', label: 'Griffin' },
          { value: 'unicorn', label: 'Unicorn' },
          { value: 'werewolf', label: 'Werewolf' },
          { value: 'vampire', label: 'Vampire' },
          { value: 'mermaid', label: 'Mermaid/Merman' },
          { value: 'elf', label: 'Elf' },
        ],
      },
      {
        id: 'element',
        label: 'Element',
        options: [
          { value: 'fire', label: 'Fire' },
          { value: 'water', label: 'Water' },
          { value: 'earth', label: 'Earth' },
          { value: 'air', label: 'Air' },
          { value: 'lightning', label: 'Lightning' },
          { value: 'ice', label: 'Ice' },
          { value: 'nature', label: 'Nature' },
          { value: 'shadow', label: 'Shadow' },
        ],
      },
      {
        id: 'style',
        label: 'Style',
        options: [
          { value: 'fantasy-art', label: 'Fantasy Art' },
          { value: 'anime', label: 'Anime' },
          { value: 'pixar', label: 'Pixar 3D' },
          { value: 'watercolor', label: 'Watercolor' },
          { value: 'oil-painting', label: 'Oil Painting' },
          { value: 'comic-book', label: 'Comic Book' },
          { value: 'digital-art', label: 'Digital Art' },
          { value: 'sketch', label: 'Hand-Drawn Sketch' },
        ],
      },
    ],
  },
  {
    id: 'sport-action-style',
    template: 'My friend as a {sport} {athlete} performing {action} in {style} style',
    fields: [
      {
        id: 'sport',
        label: 'Sport',
        options: [
          { value: 'basketball', label: 'Basketball' },
          { value: 'football', label: 'Football' },
          { value: 'soccer', label: 'Soccer' },
          { value: 'baseball', label: 'Baseball' },
          { value: 'tennis', label: 'Tennis' },
          { value: 'swimming', label: 'Swimming' },
          { value: 'boxing', label: 'Boxing' },
          { value: 'surfing', label: 'Surfing' },
        ],
      },
      {
        id: 'athlete',
        label: 'Athlete Type',
        options: [
          { value: 'player', label: 'Player' },
          { value: 'champion', label: 'Champion' },
          { value: 'legend', label: 'Legend' },
          { value: 'rookie', label: 'Rookie' },
          { value: 'coach', label: 'Coach' },
          { value: 'referee', label: 'Referee' },
          { value: 'fan', label: 'Super Fan' },
          { value: 'mascot', label: 'Mascot' },
        ],
      },
      {
        id: 'action',
        label: 'Action',
        options: [
          { value: 'scoring', label: 'Scoring' },
          { value: 'celebrating', label: 'Celebrating' },
          { value: 'training', label: 'Training' },
          { value: 'competing', label: 'Competing' },
          { value: 'winning', label: 'Winning' },
          { value: 'dunking', label: 'Dunking' },
          { value: 'jumping', label: 'Jumping' },
          { value: 'running', label: 'Running' },
        ],
      },
      {
        id: 'style',
        label: 'Style',
        options: [
          { value: 'pixar', label: 'Pixar 3D' },
          { value: 'comic-book', label: 'Comic Book' },
          { value: 'anime', label: 'Anime' },
          { value: 'hyper-realistic', label: 'Hyper Realistic' },
          { value: 'vintage-poster', label: 'Vintage Poster' },
          { value: 'digital-art', label: 'Digital Art' },
          { value: 'sketch', label: 'Hand-Drawn Sketch' },
          { value: 'watercolor', label: 'Watercolor' },
        ],
      },
    ],
  },
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
