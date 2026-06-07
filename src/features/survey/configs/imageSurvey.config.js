import { SlidersHorizontal, BookOpen, User, Palette, Sparkles, PenLine } from 'lucide-react';
import { Flame, Zap, Laugh } from 'lucide-react';
import { Heart, Tv, Music } from 'lucide-react';
import { ART_STYLES } from '../../../data/artStyles';
import { THEMES } from '../../../data/themes';
import { MAD_LIBS_TEMPLATES } from '../../../data/madlibs';
import { MVP_CONFIG } from '../../../config/mvp.config.js';

export const IMAGE_SLIDERS = [
  {
    id: 'chaos',
    label: 'Chaos Level',
    icon: Flame,
    low: 'Calm & Collected',
    high: 'Pure Chaos',
  },
  {
    id: 'energy',
    label: 'Energy Level',
    icon: Zap,
    low: 'Chill Vibes',
    high: 'Maximum Energy',
  },
  {
    id: 'humor',
    label: 'Humor Level',
    icon: Laugh,
    low: 'Serious & Cool',
    high: 'Comedy Gold',
  },
];

export const IMAGE_DETAIL_FIELDS = [
  {
    id: 'hobbies',
    label: 'Hobbies & Interests',
    icon: Heart,
    placeholder: 'e.g. basketball, cooking, gaming',
    helper: 'What does your friend love to do? (comma-separated)',
  },
  {
    id: 'favoriteShows',
    label: 'Favorite Shows / Movies',
    icon: Tv,
    placeholder: 'e.g. Breaking Bad, Naruto, Star Wars',
    helper: "Pop culture they're obsessed with (comma-separated)",
  },
  {
    id: 'favoriteMusic',
    label: 'Favorite Music',
    icon: Music,
    placeholder: 'e.g. hip-hop, jazz, Taylor Swift',
    helper: 'Genres, artists, or vibes (comma-separated)',
  },
];

export const IMAGE_SURVEY_SECTIONS = [
  // --- Core: the simple, satisfying picks shown first ---
  {
    id: 'style',
    label: 'Art Style',
    subtitle: 'Pick a look (or up to 3 for variety)',
    icon: Palette,
    component: 'chips',
    placement: 'core',
    action: 'SET_STYLES',
    stateKey: 'selectedStyles',
    config: { items: ART_STYLES, max: MVP_CONFIG.MAX_STYLES },
  },
  {
    id: 'theme',
    label: 'Theme',
    subtitle: 'What should the scene be about?',
    icon: Sparkles,
    component: 'chips',
    placement: 'core',
    action: 'SET_THEMES',
    stateKey: 'selectedThemes',
    config: { items: THEMES, max: MVP_CONFIG.MAX_THEMES },
  },
  {
    id: 'vision',
    label: 'Anything else?',
    subtitle: 'Describe your vision in your own words — optional',
    icon: PenLine,
    component: 'vision',
    placement: 'core',
    dataKey: 'freeText',
    config: {
      placeholder: 'e.g. riding a giant rubber duck through a neon city, holding their dog',
      helper: 'Anything specific you want to see? We’ll work it in.',
    },
  },

  // --- Advanced: power tools, collapsed by default ---
  {
    id: 'sliders',
    label: 'Mood Sliders',
    subtitle: 'Set the chaos, energy, and humor levels',
    icon: SlidersHorizontal,
    component: 'sliders',
    placement: 'advanced',
    dataKey: 'moodSliders',
    config: { sliders: IMAGE_SLIDERS },
  },
  {
    id: 'madlibs',
    label: 'Mad Libs',
    subtitle: 'Build custom scene descriptions from templates',
    icon: BookOpen,
    component: 'madlibs',
    placement: 'advanced',
    dataKey: 'madLibs',
    config: { templates: MAD_LIBS_TEMPLATES },
  },
  {
    id: 'details',
    label: 'Personal Details',
    subtitle: 'Hobbies, shows, and music — weaved into the scene',
    icon: User,
    component: 'details',
    placement: 'advanced',
    dataKey: null, // multiple keys
    config: { fields: IMAGE_DETAIL_FIELDS },
  },
];
