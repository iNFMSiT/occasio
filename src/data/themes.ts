import type { Theme, SurveyData } from '../types';

export const THEMES: Theme[] = [
  {
    id: 'celebrities',
    label: 'Celebrities',
    description: 'Transform into famous personalities',
    buildScene: (survey: SurveyData) => {
      const shows = survey.favoriteShows?.length ? `inspired by ${survey.favoriteShows[0]}` : 'on a red carpet';
      const music = survey.favoriteMusic?.length ? `, with subtle nods to ${survey.favoriteMusic[0]} fandom` : '';
      return `as a famous celebrity ${shows}${music}, surrounded by paparazzi and glamour`;
    },
  },
  {
    id: 'careers',
    label: 'Careers',
    description: 'Professional roles and jobs',
    buildScene: (survey: SurveyData) => {
      const hobbies = survey.hobbies?.length ? `, incorporating their love of ${survey.hobbies.slice(0, 2).join(' and ')}` : '';
      return `in a professional career setting as a top expert in their field${hobbies}, confident and accomplished`;
    },
  },
  {
    id: 'time-traveler',
    label: 'Time Traveler/Fantasy',
    description: 'Historical and fantasy settings',
    buildScene: (survey: SurveyData) => {
      const shows = survey.favoriteShows?.length ? `in a world reminiscent of ${survey.favoriteShows[0]}` : 'in an ancient civilization';
      return `as a time traveler ${shows}, wearing a mix of futuristic tech and period-accurate clothing`;
    },
  },
  {
    id: 'wildcard',
    label: 'Wildcard',
    description: 'Unexpected and creative scenarios',
    buildScene: (survey: SurveyData) => {
      const hobbies = survey.hobbies?.length ? survey.hobbies[Math.floor(Math.random() * survey.hobbies.length)] : 'something unexpected';
      const music = survey.favoriteMusic?.length ? `in a world inspired by ${survey.favoriteMusic[0]}` : 'in a surreal dreamscape';
      return `in a wildly creative scenario involving ${hobbies} ${music}, defying all expectations`;
    },
  },
  {
    id: 'sports',
    label: 'Sports',
    description: 'Athletic activities and sports',
    buildScene: (survey: SurveyData) => {
      const sport = survey.hobbies?.find((h) => /basketball|football|soccer|tennis|swim|run|box|surf|sport/i.test(h));
      const specific = sport ? `legendary ${sport}` : 'legendary athlete';
      return `as a ${specific} champion at the peak of an epic victory moment, stadium roaring, confetti falling`;
    },
  },
  {
    id: 'superhero',
    label: 'Superhero',
    description: 'Comic book heroes and powers',
    buildScene: (survey: SurveyData) => {
      const hobbies = survey.hobbies?.length ? `(their powers are themed around ${survey.hobbies[0]})` : 'with extraordinary powers';
      const music = survey.favoriteMusic?.length ? `, their theme song is ${survey.favoriteMusic[0]}` : '';
      return `as an original superhero ${hobbies}${music}, in a dramatic hero pose atop a skyscraper at sunset`;
    },
  },
  {
    id: 'sci-fi',
    label: 'Sci-Fi',
    description: 'Futuristic and space themes',
    buildScene: (survey: SurveyData) => {
      const shows = survey.favoriteShows?.find((s) => /star|trek|wars|mandalorian|expanse|dune|blade|cyber/i.test(s));
      const world = shows ? `in a world inspired by ${shows}` : 'in a futuristic metropolis with flying vehicles and neon holographics';
      return `as a sci-fi protagonist ${world}, wearing advanced tech armor`;
    },
  },
  {
    id: 'fantasy',
    label: 'Fantasy',
    description: 'Magic, dragons, and fantasy worlds',
    buildScene: (survey: SurveyData) => {
      const shows = survey.favoriteShows?.find((s) => /throne|ring|potter|witch|dragon|elden/i.test(s));
      const world = shows ? `in a world inspired by ${shows}` : 'in an enchanted realm with floating islands and ancient magic';
      return `as a powerful fantasy character ${world}, wielding magical energy`;
    },
  },
  {
    id: 'historical',
    label: 'Historical',
    description: 'Different time periods',
    buildScene: (survey: SurveyData) => {
      const music = survey.favoriteMusic?.length ? `, with subtle anachronistic nods to ${survey.favoriteMusic[0]}` : '';
      return `as a historical figure of great importance in a richly detailed period setting${music}`;
    },
  },
  {
    id: 'food',
    label: 'Food & Cooking',
    description: 'Culinary adventures',
    buildScene: (survey: SurveyData) => {
      const hobbies = survey.hobbies?.find((h) => /cook|bak|food|chef|eat/i.test(h));
      const specialty = hobbies || 'culinary arts';
      return `as a world-renowned master of ${specialty} in an epic kitchen battle, ingredients flying dramatically through the air`;
    },
  },
];

export const THEME_BUILDERS: Record<string, (survey: SurveyData) => string> = Object.fromEntries(
  THEMES.map((t) => [t.id, t.buildScene])
);
