import React, { useState } from 'react';
import {
  ArrowRight, ArrowLeft, SkipForward, Swords, SlidersHorizontal,
  BookOpen, User, ChevronDown, ChevronUp, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { useWizard } from '../../context/WizardContext.jsx';
import StyleBattles from '../survey/StyleBattles.jsx';
import MoodSliders from '../survey/MoodSliders.jsx';
import MadLibs from '../survey/MadLibs.jsx';
import Details from '../survey/Details.jsx';

const SECTIONS = [
  {
    id: 'battles',
    label: 'Style Battles',
    subtitle: 'Pick visual preferences with this-or-that choices',
    icon: Swords,
    defaults: { styleBattles: {} },
  },
  {
    id: 'sliders',
    label: 'Mood Sliders',
    subtitle: 'Set the chaos, energy, and humor levels',
    icon: SlidersHorizontal,
    defaults: { moodSliders: { chaos: 0, energy: 0, humor: 0 } },
  },
  {
    id: 'madlibs',
    label: 'Mad Libs',
    subtitle: 'Build custom scene descriptions from templates',
    icon: BookOpen,
    defaults: { madLibs: [] },
  },
  {
    id: 'details',
    label: 'Personal Details',
    subtitle: 'Hobbies, shows, and music — weaved into the scene',
    icon: User,
    defaults: { hobbies: [], favoriteShows: [], favoriteMusic: [] },
  },
];

function SectionToggle({ enabled, onToggle }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="flex-shrink-0"
      title={enabled ? 'Disable this section' : 'Enable this section'}
    >
      {enabled ? (
        <ToggleRight size={24} className="text-brand" />
      ) : (
        <ToggleLeft size={24} className="text-surface-lighter" />
      )}
    </button>
  );
}

export default function SurveyStep() {
  const { surveyData, dispatch } = useWizard();

  // Track which sections are enabled — default all on
  const [enabled, setEnabled] = useState(() => {
    const saved = surveyData._enabledSections;
    if (saved) return saved;
    return { battles: true, sliders: true, madlibs: true, details: true };
  });

  // Track which section is currently expanded
  const [expanded, setExpanded] = useState('details');

  const update = (partial) => {
    dispatch({ type: 'UPDATE_SURVEY', payload: partial });
  };

  const toggleSection = (sectionId) => {
    const newEnabled = { ...enabled, [sectionId]: !enabled[sectionId] };
    setEnabled(newEnabled);

    // Save toggle state into surveyData so promptEngine can read it
    update({ _enabledSections: newEnabled });

    // If disabling, reset that section's data to defaults
    if (enabled[sectionId]) {
      const section = SECTIONS.find((s) => s.id === sectionId);
      if (section) {
        update(section.defaults);
      }
    }
  };

  const toggleExpand = (sectionId) => {
    setExpanded(expanded === sectionId ? null : sectionId);
  };

  const enabledCount = Object.values(enabled).filter(Boolean).length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Tell Us About Your Friend</h2>
        <p className="text-text-muted">
          Toggle on the sections you want to use. More detail = more personalized results.
        </p>
        <p className="text-xs text-text-muted">
          {enabledCount}/4 sections active
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isEnabled = enabled[section.id];
          const isExpanded = expanded === section.id && isEnabled;

          return (
            <div
              key={section.id}
              className={`rounded-xl border transition-all ${
                isEnabled
                  ? 'border-surface-lighter bg-surface-light/20'
                  : 'border-surface-lighter/30 bg-surface-light/5 opacity-60'
              }`}
            >
              {/* Section header */}
              <div
                onClick={() => isEnabled && toggleExpand(section.id)}
                className={`flex items-center gap-3 px-4 py-3 ${isEnabled ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <SectionToggle enabled={isEnabled} onToggle={() => toggleSection(section.id)} />

                <Icon size={18} className={isEnabled ? 'text-brand-light' : 'text-text-muted/50'} />

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isEnabled ? 'text-text' : 'text-text-muted'}`}>
                    {section.label}
                  </p>
                  <p className="text-[11px] text-text-muted truncate">{section.subtitle}</p>
                </div>

                {isEnabled && (
                  <div className="text-text-muted">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                )}
              </div>

              {/* Section content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-surface-lighter/30">
                  <div className="pt-3">
                    {section.id === 'battles' && (
                      <StyleBattles
                        value={surveyData.styleBattles}
                        onChange={(battles) => update({ styleBattles: battles })}
                      />
                    )}
                    {section.id === 'sliders' && (
                      <MoodSliders
                        value={surveyData.moodSliders}
                        onChange={(sliders) => update({ moodSliders: sliders })}
                      />
                    )}
                    {section.id === 'madlibs' && (
                      <MadLibs
                        value={surveyData.madLibs}
                        onChange={(madLibs) => update({ madLibs })}
                      />
                    )}
                    {section.id === 'details' && (
                      <Details
                        hobbies={surveyData.hobbies}
                        favoriteShows={surveyData.favoriteShows}
                        favoriteMusic={surveyData.favoriteMusic}
                        onChange={(partial) => update(partial)}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => dispatch({ type: 'NEXT_STEP' })}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-text-muted hover:text-text transition-colors"
          >
            <SkipForward size={16} />
            Skip
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
    </div>
  );
}
