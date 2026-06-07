import React from 'react';
import SurveyStep from '../shared/SurveyStep.jsx';
import OccasionCombobox from '../../../../components/survey/OccasionCombobox.jsx';
import { IMAGE_SURVEY_SECTIONS } from '../../../../data/surveys/image';
import { useGiftFlow } from '../../../../context/GiftFlowContext.jsx';

export default function ImageSurveyStep() {
  const { surveyData, dispatch } = useGiftFlow();

  // Images just capture the occasion (and weave it into the prompt); unlike songs
  // there's no genre/vibe preset to auto-fill.
  const handleOccasionSelect = (occasion) => {
    dispatch({ type: 'UPDATE_SURVEY', payload: { occasion } });
  };

  const handleOccasionClear = () => {
    dispatch({ type: 'UPDATE_SURVEY', payload: { occasion: null } });
  };

  return (
    <>
      <OccasionCombobox
        value={surveyData.occasion}
        onSelect={handleOccasionSelect}
        onClear={handleOccasionClear}
        stepNumber={1}
        title="Pick an occasion"
      />
      <SurveyStep
        title="Make It Theirs"
        subtitle="Pick a style and theme, or hit Surprise Me. Add detail in Advanced if you want."
        sections={IMAGE_SURVEY_SECTIONS}
        startStep={2}
      />
    </>
  );
}
