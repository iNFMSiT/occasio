import React, { createContext, useContext, useReducer, useCallback } from 'react';

const WizardContext = createContext(null);

const STEPS = ['upload', 'survey', 'styleTheme', 'generate', 'gallery'];

const initialState = {
  // Step 1: Upload
  images: [],
  anchorDescription: null,

  // Step 2: Survey
  surveyData: {
    styleBattles: {},
    moodSliders: { chaos: 0.5, energy: 0.5, humor: 0.5 },
    hobbies: [],
    favoriteShows: [],
    favoriteMusic: [],
    madLibs: [],
    mysteryBox: null,
  },

  // Step 3: Style/Theme
  selectedStyles: [],
  selectedThemes: [],

  // Step 4: Generation
  blueprint: [],
  cards: [],
  generationProgress: { current: 0, total: 0 },

  // Settings
  settings: {
    modelTier: 'nanoBanana', // or 'nanoBananaPro'
    devMode: false,
    cardCount: 6, // user-selectable: 1, 2, 4, 6, 8
  },

  // UI
  currentStep: 'upload',
  loading: false,
  error: null,
};

function wizardReducer(state, action) {
  switch (action.type) {
    case 'SET_IMAGES':
      return { ...state, images: action.payload };

    case 'SET_ANCHOR':
      return { ...state, anchorDescription: action.payload };

    case 'UPDATE_SURVEY':
      return { ...state, surveyData: { ...state.surveyData, ...action.payload } };

    case 'SET_STYLES':
      return { ...state, selectedStyles: action.payload };

    case 'SET_THEMES':
      return { ...state, selectedThemes: action.payload };

    case 'SET_BLUEPRINT':
      return { ...state, blueprint: action.payload };

    case 'ADD_CARD':
      return { ...state, cards: [...state.cards, action.payload] };

    case 'SET_CARDS':
      return { ...state, cards: action.payload };

    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map((c, i) => (i === action.payload.index ? action.payload.card : c)),
      };

    case 'RATE_CARD':
      return {
        ...state,
        cards: state.cards.map((c, i) =>
          i === action.payload.index ? { ...c, rating: action.payload.rating } : c
        ),
      };

    case 'UPDATE_PROGRESS':
      return { ...state, generationProgress: action.payload };

    case 'SET_MODEL_TIER':
      return { ...state, settings: { ...state.settings, modelTier: action.payload } };

    case 'SET_DEV_MODE':
      return { ...state, settings: { ...state.settings, devMode: action.payload } };

    case 'SET_CARD_COUNT':
      return { ...state, settings: { ...state.settings, cardCount: action.payload } };

    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'NEXT_STEP': {
      const idx = STEPS.indexOf(state.currentStep);
      if (idx < STEPS.length - 1) {
        return { ...state, currentStep: STEPS[idx + 1] };
      }
      return state;
    }

    case 'PREV_STEP': {
      const idx = STEPS.indexOf(state.currentStep);
      if (idx > 0) {
        return { ...state, currentStep: STEPS[idx - 1] };
      }
      return state;
    }

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

export function WizardProvider({ children }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const value = {
    ...state,
    dispatch,
    steps: STEPS,
    stepIndex: STEPS.indexOf(state.currentStep),
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) throw new Error('useWizard must be used within WizardProvider');
  return context;
}

export { STEPS };
