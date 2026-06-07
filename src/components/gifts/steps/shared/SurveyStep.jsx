import React, { useState } from 'react';
import {
  ArrowRight, ArrowLeft, Sparkles, Dice5,
  ChevronDown, ChevronUp, SlidersHorizontal,
} from 'lucide-react';
import { useGiftFlow } from '../../../../context/GiftFlowContext.jsx';
import SliderBank from '../../../../features/survey/components/SliderBank.jsx';
import MadLibBuilder from '../../../../features/survey/components/MadLibBuilder.jsx';
import FreeTextInputs from '../../../../features/survey/components/FreeTextInputs.jsx';
import ChipSelect from '../../../../features/survey/components/ChipSelect.jsx';
import VisionTextBox from '../../../../features/survey/components/VisionTextBox.jsx';
import { pickOne, randomSliders, randomMadLib } from '../../../../features/survey/randomize.js';

const COMPONENT_MAP = {
  chips: ({ config, value, onChange }) => (
    <ChipSelect items={config.items} value={value || []} onChange={onChange} max={config.max ?? 3} />
  ),
  vision: ({ config, value, onChange }) => (
    <VisionTextBox value={value} onChange={onChange} placeholder={config.placeholder} helper={config.helper} />
  ),
  sliders: ({ config, value, onChange }) => (
    <SliderBank sliders={config.sliders} value={value} onChange={onChange} />
  ),
  madlibs: ({ config, value, onChange }) => (
    <MadLibBuilder templates={config.templates} value={value} onChange={onChange} />
  ),
  details: ({ config, surveyData, onChange }) => (
    <FreeTextInputs fields={config.fields} values={surveyData} onChange={onChange} />
  ),
};

// Which component types can be randomized by the dice / Surprise Me.
const RANDOMIZABLE = new Set(['chips', 'sliders', 'madlibs']);

export default function SurveyStep({ title, subtitle, sections, startStep = null }) {
  const flow = useGiftFlow();
  const { surveyData, dispatch } = flow;

  const coreSections = sections.filter((s) => s.placement !== 'advanced');
  const advancedSections = sections.filter((s) => s.placement === 'advanced');

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);

  // --- data wiring ---------------------------------------------------------
  // Sections with an `action` write to top-level state (e.g. selectedStyles);
  // others write to surveyData via UPDATE_SURVEY.
  const getValue = (section) => {
    if (section.action) {
      return flow[section.stateKey] || [];
    }
    if (section.dataKey) return surveyData[section.dataKey];
    return surveyData; // multi-key (details)
  };

  const commit = (section, val) => {
    if (section.action) {
      dispatch({ type: section.action, payload: val });
    } else if (section.dataKey) {
      dispatch({ type: 'UPDATE_SURVEY', payload: { [section.dataKey]: val } });
    } else {
      dispatch({ type: 'UPDATE_SURVEY', payload: val });
    }
  };

  // --- randomization -------------------------------------------------------
  const randomValue = (section) => {
    switch (section.component) {
      case 'chips': {
        const item = pickOne(section.config.items);
        return item ? [item.id] : [];
      }
      case 'sliders':
        return randomSliders(section.config.sliders);
      case 'madlibs': {
        const current = (section.dataKey ? surveyData[section.dataKey] : []) || [];
        const next = randomMadLib(section.config.templates);
        return next ? [...current, next] : current;
      }
      default:
        return undefined;
    }
  };

  const randomizeSection = (section) => {
    const val = randomValue(section);
    if (val !== undefined) commit(section, val);
  };

  // Surprise Me: fill the quick picks + mood sliders for a coherent, ready-to-go
  // config. Leaves the free-text and personal details alone (those are personal).
  const surpriseMe = () => {
    sections
      .filter((s) => s.component === 'chips' || s.component === 'sliders')
      .forEach(randomizeSection);
  };

  const renderSection = (section) => {
    const Renderer = COMPONENT_MAP[section.component];
    if (!Renderer) return null;
    return (
      <Renderer
        config={section.config}
        value={getValue(section)}
        surveyData={surveyData}
        onChange={(val) => commit(section, val)}
      />
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-text-muted">{subtitle}</p>
      </div>

      {/* Surprise Me */}
      <div className="flex justify-center">
        <button
          onClick={surpriseMe}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-brand to-accent
                     text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
        >
          <Sparkles size={16} />
          Surprise Me
        </button>
      </div>

      {/* Core sections — always visible */}
      <div className="space-y-6">
        {coreSections.map((section, idx) => {
          const Icon = section.icon;
          const canRandomize = RANDOMIZABLE.has(section.component);
          const numbered = startStep != null;
          return (
            <div key={section.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {numbered ? (
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand text-white text-sm font-bold shrink-0">
                      {startStep + idx}
                    </span>
                  ) : (
                    Icon && <Icon size={18} className="text-brand-light" />
                  )}
                  <h3 className="font-semibold">{section.label}</h3>
                </div>
                {canRandomize && (
                  <button
                    onClick={() => randomizeSection(section)}
                    title="Randomize this"
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-brand-light transition-colors"
                  >
                    <Dice5 size={15} />
                  </button>
                )}
              </div>
              {section.subtitle && (
                <p className="text-xs text-text-muted -mt-1.5">{section.subtitle}</p>
              )}
              {renderSection(section)}
            </div>
          );
        })}
      </div>

      {/* Advanced options drawer */}
      {advancedSections.length > 0 && (
        <div className="rounded-xl border border-surface-lighter bg-surface-light/10">
          <button
            onClick={() => setAdvancedOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm"
          >
            <span className="flex items-center gap-2 font-medium">
              <SlidersHorizontal size={16} className="text-brand-light" />
              Advanced options
            </span>
            {advancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {advancedOpen && (
            <div className="px-3 pb-3 space-y-2 border-t border-surface-lighter/30 pt-3">
              {advancedSections.map((section) => {
                const Icon = section.icon;
                const isExpanded = expanded === section.id;
                const canRandomize = RANDOMIZABLE.has(section.component);
                return (
                  <div key={section.id} className="rounded-lg border border-surface-lighter/50 bg-surface-light/20">
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : section.id)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      >
                        {Icon && <Icon size={16} className="text-brand-light shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{section.label}</p>
                          <p className="text-[11px] text-text-muted truncate">{section.subtitle}</p>
                        </div>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                      {canRandomize && (
                        <button
                          onClick={() => randomizeSection(section)}
                          title="Randomize this"
                          className="text-text-muted hover:text-brand-light transition-colors shrink-0"
                        >
                          <Dice5 size={15} />
                        </button>
                      )}
                    </div>
                    {isExpanded && (
                      <div className="px-3 pb-3 border-t border-surface-lighter/30 pt-3">
                        {renderSection(section)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-dark rounded-lg font-medium text-sm transition-colors"
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
