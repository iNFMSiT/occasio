import React, { createContext, useContext, useReducer } from 'react';

const GiftFlowContext = createContext(null);

function giftFlowReducer(state, action) {
  switch (action.type) {
    // Shared actions
    case 'UPDATE_SURVEY':
      return { ...state, surveyData: { ...state.surveyData, ...action.payload } };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'NEXT_STEP': {
      const idx = state.steps.indexOf(state.currentStep);
      if (idx < state.steps.length - 1) {
        return { ...state, currentStep: state.steps[idx + 1] };
      }
      return state;
    }
    case 'PREV_STEP': {
      const idx = state.steps.indexOf(state.currentStep);
      if (idx > 0) {
        return { ...state, currentStep: state.steps[idx - 1] };
      }
      return state;
    }
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return { ...state._initialState };

    // Image-specific actions
    case 'SET_IMAGES':
      return { ...state, images: action.payload };
    case 'SET_ANCHOR':
      return { ...state, anchorDescription: action.payload };
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

    // Song-specific actions
    case 'SET_SELECTED_GENRES':
      return { ...state, selectedGenres: action.payload };
    case 'SET_SELECTED_VIBES':
      return { ...state, selectedVibes: action.payload };
    case 'SET_SONGS':
      return { ...state, songs: action.payload };
    case 'ADD_SONG':
      return { ...state, songs: [...state.songs, action.payload] };
    case 'RATE_SONG':
      return {
        ...state,
        songs: state.songs.map((s, i) =>
          i === action.payload.index ? { ...s, rating: action.payload.rating } : s
        ),
      };
    case 'SET_SONG_PROMPT':
      return { ...state, songPrompt: action.payload };
    case 'SET_SONG_COUNT':
      return { ...state, settings: { ...state.settings, songCount: action.payload } };

    default:
      return state;
  }
}

export function GiftFlowProvider({ giftType, config, seed, children }) {
  const initialState = {
    giftType,
    steps: config.steps,
    currentStep: config.steps[0],
    // seed.surveyData (freeText, moodSliders, ...) pre-fills the customize step
    surveyData: { ...(config.initialSurveyData || {}), ...(seed?.surveyData || {}) },
    settings: config.initialSettings || {},
    loading: false,
    error: null,
    ...config.initialState,
    // seed.state (selectedStyles, selectedThemes, ...) overrides top-level state
    ...(seed?.state || {}),
    _initialState: null, // will be set below
  };
  // Store initial state for reset
  initialState._initialState = { ...initialState };

  const [state, dispatch] = useReducer(giftFlowReducer, initialState);

  const value = {
    ...state,
    dispatch,
    stepIndex: state.steps.indexOf(state.currentStep),
    giftType,
    config,
  };

  return <GiftFlowContext.Provider value={value}>{children}</GiftFlowContext.Provider>;
}

export function useGiftFlow() {
  const context = useContext(GiftFlowContext);
  if (!context) throw new Error('useGiftFlow must be used within GiftFlowProvider');
  return context;
}
