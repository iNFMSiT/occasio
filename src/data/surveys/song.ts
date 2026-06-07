import { SlidersHorizontal, BookOpen, User, ListMusic, Sparkles, PenLine } from 'lucide-react';
import { Zap, Heart, Laugh } from 'lucide-react';
import { MessageCircle, Star, Calendar } from 'lucide-react';
import type { SurveySection } from '../../types';

// Genres & vibes — moved here from the old standalone SongStyleStep so the
// survey core can render them directly.
export const GENRES = [
  { id: 'pop', label: 'Pop', description: 'Catchy, radio-friendly vibes' },
  { id: 'rock', label: 'Rock', description: 'Guitar-driven energy' },
  { id: 'hip-hop', label: 'Hip-Hop', description: 'Beats and flow' },
  { id: 'country', label: 'Country', description: 'Storytelling with twang' },
  { id: 'r-and-b', label: 'R&B', description: 'Smooth and soulful' },
  { id: 'electronic', label: 'Electronic', description: 'Synths and drops' },
  { id: 'acoustic', label: 'Acoustic', description: 'Stripped-down and intimate' },
  { id: 'jazz', label: 'Jazz', description: 'Smooth and sophisticated' },
  { id: 'folk', label: 'Folk', description: 'Warm and organic' },
  { id: 'indie', label: 'Indie', description: 'Alternative and unique' },
];

export const VIBES = [
  { id: 'anthemic', label: 'Anthemic', description: 'Big, stadium-worthy moments' },
  { id: 'nostalgic', label: 'Nostalgic', description: 'Throwback to good times' },
  { id: 'silly', label: 'Silly', description: 'Fun, goofy, not taking itself seriously' },
  { id: 'heartfelt', label: 'Heartfelt', description: 'Genuine and emotional' },
  { id: 'party', label: 'Party', description: 'Get-up-and-dance energy' },
  { id: 'chill', label: 'Chill', description: 'Laid-back and relaxing' },
  { id: 'epic', label: 'Epic', description: 'Cinematic and grand' },
  { id: 'romantic', label: 'Romantic', description: 'Love and affection' },
];

export const MAX_GENRES = 3;
export const MAX_VIBES = 3;

export const SONG_SLIDERS = [
  {
    id: 'energy',
    label: 'Energy Level',
    icon: Zap,
    low: 'Soft & Gentle',
    high: 'High Energy',
  },
  {
    id: 'sentiment',
    label: 'Sentiment',
    icon: Heart,
    low: 'Heartfelt & Sincere',
    high: 'Fun & Playful',
  },
  {
    id: 'humor',
    label: 'Humor Level',
    icon: Laugh,
    low: 'Serious & Meaningful',
    high: 'Silly & Fun',
  },
];

export const LYRIC_MAD_LIBS = [
  {
    id: 'celebration-song',
    template: 'A {mood} song about {person} who always {habit} and loves {passion}',
    fields: [
      {
        id: 'mood',
        label: 'Mood',
        options: [
          { value: 'heartfelt', label: 'Heartfelt' },
          { value: 'upbeat', label: 'Upbeat' },
          { value: 'funny', label: 'Funny' },
          { value: 'epic', label: 'Epic' },
          { value: 'nostalgic', label: 'Nostalgic' },
          { value: 'groovy', label: 'Groovy' },
        ],
      },
      {
        id: 'person',
        label: 'Who is this about?',
        options: [
          { value: 'my best friend', label: 'My Best Friend' },
          { value: 'my mom', label: 'My Mom' },
          { value: 'my dad', label: 'My Dad' },
          { value: 'my partner', label: 'My Partner' },
          { value: 'my sibling', label: 'My Sibling' },
          { value: 'my coworker', label: 'My Coworker' },
        ],
      },
      {
        id: 'habit',
        label: 'Their Thing',
        options: [
          { value: 'makes everyone laugh', label: 'Makes Everyone Laugh' },
          { value: 'shows up late', label: 'Shows Up Late' },
          { value: 'brings the snacks', label: 'Brings the Snacks' },
          { value: 'tells the best stories', label: 'Tells the Best Stories' },
          { value: 'dances like nobody is watching', label: 'Dances Freely' },
          { value: 'gives the best advice', label: 'Gives Great Advice' },
        ],
      },
      {
        id: 'passion',
        label: 'Their Passion',
        options: [
          { value: 'cooking', label: 'Cooking' },
          { value: 'road trips', label: 'Road Trips' },
          { value: 'karaoke nights', label: 'Karaoke' },
          { value: 'pizza', label: 'Pizza' },
          { value: 'binge-watching shows', label: 'Binge-Watching' },
          { value: 'sports', label: 'Sports' },
        ],
      },
    ],
  },
  {
    id: 'memory-song',
    template: 'Remember when we {memory} and you said "{quote}" — that was so {feeling}',
    fields: [
      {
        id: 'memory',
        label: 'Memory',
        options: [
          { value: 'stayed up all night talking', label: 'Stayed Up All Night' },
          { value: 'went on that road trip', label: 'Went on a Road Trip' },
          { value: 'tried to cook that disaster meal', label: 'Cooked a Disaster' },
          { value: 'got lost in that city', label: 'Got Lost Exploring' },
          { value: 'sang karaoke together', label: 'Sang Karaoke' },
          { value: 'pulled that prank', label: 'Pulled That Prank' },
        ],
      },
      {
        id: 'quote',
        label: 'Their Catchphrase',
        options: [
          { value: "let's do it again", label: "Let's Do It Again" },
          { value: 'this is fine', label: 'This Is Fine' },
          { value: "that's what she said", label: "That's What She Said" },
          { value: "yolo", label: 'YOLO' },
          { value: 'hold my drink', label: 'Hold My Drink' },
          { value: 'I told you so', label: 'I Told You So' },
        ],
      },
      {
        id: 'feeling',
        label: 'Feeling',
        options: [
          { value: 'hilarious', label: 'Hilarious' },
          { value: 'legendary', label: 'Legendary' },
          { value: 'wholesome', label: 'Wholesome' },
          { value: 'chaotic', label: 'Chaotic' },
          { value: 'unforgettable', label: 'Unforgettable' },
          { value: 'perfect', label: 'Perfect' },
        ],
      },
    ],
  },
  {
    id: 'occasion-song',
    template: 'Happy {occasion}! You deserve a {adjective} song because you are {quality}',
    fields: [
      {
        id: 'occasion',
        label: 'Occasion',
        options: [
          { value: 'birthday', label: 'Birthday' },
          { value: 'anniversary', label: 'Anniversary' },
          { value: 'graduation', label: 'Graduation' },
          { value: 'retirement', label: 'Retirement' },
          { value: 'promotion', label: 'Promotion' },
          { value: 'just because', label: 'Just Because' },
        ],
      },
      {
        id: 'adjective',
        label: 'Song Vibe',
        options: [
          { value: 'banging', label: 'Banging' },
          { value: 'beautiful', label: 'Beautiful' },
          { value: 'ridiculous', label: 'Ridiculous' },
          { value: 'epic', label: 'Epic' },
          { value: 'chill', label: 'Chill' },
          { value: 'groovy', label: 'Groovy' },
        ],
      },
      {
        id: 'quality',
        label: 'Why They Rock',
        options: [
          { value: 'the most amazing person ever', label: 'Amazing Person' },
          { value: 'literally one of a kind', label: 'One of a Kind' },
          { value: "everyone's favorite human", label: "Everyone's Favorite" },
          { value: 'the life of every party', label: 'Life of the Party' },
          { value: 'the glue that holds us together', label: 'The Glue' },
          { value: 'an absolute legend', label: 'An Absolute Legend' },
        ],
      },
    ],
  },
  {
    id: 'anthem-song',
    template: 'An anthem for {name_desc} who is known for {trait} in the style of {genre}',
    fields: [
      {
        id: 'name_desc',
        label: 'Who',
        options: [
          { value: 'the birthday king', label: 'The Birthday King' },
          { value: 'the birthday queen', label: 'The Birthday Queen' },
          { value: 'the greatest friend', label: 'Greatest Friend' },
          { value: "the world's best parent", label: "World's Best Parent" },
          { value: 'the office legend', label: 'The Office Legend' },
          { value: 'the group chat hero', label: 'Group Chat Hero' },
        ],
      },
      {
        id: 'trait',
        label: 'Known For',
        options: [
          { value: 'never giving up', label: 'Never Giving Up' },
          { value: 'terrible dad jokes', label: 'Dad Jokes' },
          { value: 'always being there', label: 'Always Being There' },
          { value: 'epic dance moves', label: 'Epic Dance Moves' },
          { value: 'their infectious laugh', label: 'Infectious Laugh' },
          { value: 'being fashionably late', label: 'Being Late' },
        ],
      },
      {
        id: 'genre',
        label: 'Musical Style',
        options: [
          { value: 'a rock anthem', label: 'Rock Anthem' },
          { value: 'a pop banger', label: 'Pop Banger' },
          { value: 'a country ballad', label: 'Country Ballad' },
          { value: 'a hip-hop track', label: 'Hip-Hop Track' },
          { value: 'an acoustic serenade', label: 'Acoustic Serenade' },
          { value: 'an EDM drop', label: 'EDM Drop' },
        ],
      },
    ],
  },
];

export const SONG_DETAIL_FIELDS = [
  {
    id: 'memories',
    label: 'Shared Memories',
    icon: Star,
    placeholder: 'e.g. that camping trip, the surprise party, our first concert',
    helper: 'Special moments to reference in the song (comma-separated)',
  },
  {
    id: 'insideJokes',
    label: 'Inside Jokes',
    icon: MessageCircle,
    placeholder: 'e.g. "the spaghetti incident", they always say "bruh"',
    helper: 'Inside jokes or catchphrases to weave into lyrics (comma-separated)',
  },
  {
    id: 'milestones',
    label: 'Milestones & Achievements',
    icon: Calendar,
    placeholder: 'e.g. got promoted, ran a marathon, learned to cook',
    helper: 'Recent wins or life milestones worth celebrating (comma-separated)',
  },
];

export const SONG_SURVEY_SECTIONS: SurveySection[] = [
  // --- Core: the simple, satisfying picks shown first ---
  {
    id: 'genre',
    label: 'Genre',
    subtitle: 'Pick a sound (or up to 3 to blend)',
    icon: ListMusic,
    component: 'chips',
    placement: 'core',
    action: 'SET_SELECTED_GENRES',
    stateKey: 'selectedGenres',
    config: { items: GENRES, max: MAX_GENRES },
  },
  {
    id: 'vibe',
    label: 'Vibe',
    subtitle: 'What should it feel like?',
    icon: Sparkles,
    component: 'chips',
    placement: 'core',
    action: 'SET_SELECTED_VIBES',
    stateKey: 'selectedVibes',
    config: { items: VIBES, max: MAX_VIBES },
  },
  {
    id: 'vision',
    label: "What's this song about?",
    subtitle: "Memories, inside jokes, who it’s for — in your own words. Optional.",
    icon: PenLine,
    component: 'vision',
    placement: 'core',
    dataKey: 'freeText',
    config: {
      placeholder: "e.g. for my mom’s 50th — she loves gardening and always says “easy peasy”",
      helper: "Tell us what makes them special and we’ll weave it into the lyrics.",
    },
  },

  // --- Advanced: power tools, collapsed by default ---
  {
    id: 'sliders',
    label: 'Mood Sliders',
    subtitle: 'Set the energy, sentiment, and humor levels',
    icon: SlidersHorizontal,
    component: 'sliders',
    placement: 'advanced',
    dataKey: 'moodSliders',
    config: { sliders: SONG_SLIDERS },
  },
  {
    id: 'madlibs',
    label: 'Lyric Mad Libs',
    subtitle: 'Build custom lyric themes from templates',
    icon: BookOpen,
    component: 'madlibs',
    placement: 'advanced',
    dataKey: 'lyricMadLibs',
    config: { templates: LYRIC_MAD_LIBS },
  },
  {
    id: 'details',
    label: 'Personal Details',
    subtitle: 'Memories, inside jokes, and milestones for the lyrics',
    icon: User,
    component: 'details',
    placement: 'advanced',
    dataKey: null,
    config: { fields: SONG_DETAIL_FIELDS },
  },
];
