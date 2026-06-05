import React from 'react';
import SurveyStep from '../shared/SurveyStep.jsx';
import OccasionCombobox from '../../../survey/components/OccasionCombobox.jsx';
import { SONG_SURVEY_SECTIONS } from '../../../survey/configs/songSurvey.config.js';
import { useGiftFlow } from '../../GiftFlowContext.jsx';

export default function SongSurveyStep() {
  const { surveyData, dispatch } = useGiftFlow();

  const handleOccasionSelect = (occasion, preset) => {
    const update = { occasion };
    if (preset) {
      if (preset.moodSliders) update.moodSliders = preset.moodSliders;
    }
    dispatch({ type: 'UPDATE_SURVEY', payload: update });

    if (preset?.suggestedGenres?.length > 0) {
      dispatch({ type: 'SET_SELECTED_GENRES', payload: preset.suggestedGenres });
    }
    if (preset?.suggestedVibes?.length > 0) {
      dispatch({ type: 'SET_SELECTED_VIBES', payload: preset.suggestedVibes });
    }
  };

  const handleOccasionClear = () => {
    dispatch({
      type: 'UPDATE_SURVEY',
      payload: {
        occasion: null,
        moodSliders: { energy: 0.5, sentiment: 0.5, humor: 0.5 },
      },
    });
    dispatch({ type: 'SET_SELECTED_GENRES', payload: [] });
    dispatch({ type: 'SET_SELECTED_VIBES', payload: [] });
  };

  return (
    <>
      <OccasionCombobox
        value={surveyData.occasion}
        onSelect={handleOccasionSelect}
        onClear={handleOccasionClear}
      />
      <SurveyStep
        title="Shape the Song"
        subtitle="Pick a genre and vibe, or hit Surprise Me. Add detail in Advanced if you want."
        sections={SONG_SURVEY_SECTIONS}
      />
    </>
  );
}
