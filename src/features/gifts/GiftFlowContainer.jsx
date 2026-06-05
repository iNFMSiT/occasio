import React from 'react';
import { useGiftFlow } from './GiftFlowContext.jsx';
import ModelToggle from '../../components/settings/ModelToggle.jsx';

function StepIndicator() {
  const { steps, currentStep, stepIndex, config } = useGiftFlow();

  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {steps.map((step, i) => {
        const meta = config.stepMeta[step];
        if (!meta) return null;
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
  const { currentStep, config } = useGiftFlow();
  const StepComponent = config.stepComponents[currentStep];

  if (!StepComponent) {
    return <div className="text-center text-text-muted">Unknown step: {currentStep}</div>;
  }

  return <StepComponent />;
}

export default function GiftFlowContainer() {
  const { giftType } = useGiftFlow();

  return (
    <div>
      {giftType === 'image' && (
        <div className="flex justify-end mb-2">
          <ModelToggle />
        </div>
      )}
      <StepIndicator />
      <StepContent />
    </div>
  );
}
