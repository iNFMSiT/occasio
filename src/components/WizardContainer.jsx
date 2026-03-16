import React from 'react';
import { useWizard, STEPS } from '../context/WizardContext.jsx';
import UploadStep from './steps/UploadStep.jsx';
import SurveyStep from './steps/SurveyStep.jsx';
import StyleThemeStep from './steps/StyleThemeStep.jsx';
import GenerateStep from './steps/GenerateStep.jsx';
import GalleryStep from './steps/GalleryStep.jsx';
import ModelToggle from './settings/ModelToggle.jsx';
import {
  Upload, ClipboardList, Palette, Sparkles, LayoutGrid,
} from 'lucide-react';

const STEP_META = {
  upload: { label: 'Upload', icon: Upload },
  survey: { label: 'Survey', icon: ClipboardList },
  styleTheme: { label: 'Style', icon: Palette },
  generate: { label: 'Generate', icon: Sparkles },
  gallery: { label: 'Gallery', icon: LayoutGrid },
};

function StepIndicator() {
  const { currentStep, stepIndex } = useWizard();

  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((step, i) => {
        const meta = STEP_META[step];
        const Icon = meta.icon;
        const isActive = i === stepIndex;
        const isComplete = i < stepIndex;

        return (
          <React.Fragment key={step}>
            {i > 0 && (
              <div
                className={`h-0.5 w-6 sm:w-10 rounded-full transition-colors ${
                  isComplete ? 'bg-brand' : 'bg-surface-lighter'
                }`}
              />
            )}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand/20 text-brand-light border border-brand/30'
                  : isComplete
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'text-text-muted border border-transparent'
              }`}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{meta.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StepContent() {
  const { currentStep } = useWizard();

  switch (currentStep) {
    case 'upload':
      return <UploadStep />;
    case 'survey':
      return <SurveyStep />;
    case 'styleTheme':
      return <StyleThemeStep />;
    case 'generate':
      return <GenerateStep />;
    case 'gallery':
      return <GalleryStep />;
    default:
      return <UploadStep />;
  }
}

export default function WizardContainer() {
  return (
    <div>
      <div className="flex justify-end mb-2">
        <ModelToggle />
      </div>
      <StepIndicator />
      <StepContent />
    </div>
  );
}
