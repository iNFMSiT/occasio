import React from 'react';
import { ArrowRight, ArrowLeft, Palette, Sparkles } from 'lucide-react';
import { useWizard } from '../../context/WizardContext.jsx';
import { ART_STYLES, THEMES } from '../../config/constants.js';
import { MVP_CONFIG } from '../../config/mvp.config.js';

function SelectionGrid({ items, selected, onToggle, maxItems, icon: Icon, label }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-brand-light" />
          <h3 className="font-semibold">{label}</h3>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-surface-light border border-surface-lighter/50 text-text-muted">
          {selected.length}/{maxItems} selected
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {items.map((item) => {
          const isSelected = selected.includes(item.id);
          const atMax = selected.length >= maxItems && !isSelected;
          return (
            <button
              key={item.id}
              onClick={() => !atMax && onToggle(item.id)}
              disabled={atMax}
              className={`p-3 rounded-xl border-2 text-left transition-all card-hover ${
                isSelected
                  ? 'border-brand bg-brand/10 shadow-sm'
                  : atMax
                    ? 'border-surface-lighter/30 opacity-40 cursor-not-allowed'
                    : 'border-surface-lighter hover:border-brand-light/40'
              }`}
            >
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{item.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function StyleThemeStep() {
  const { selectedStyles, selectedThemes, dispatch } = useWizard();

  const toggleStyle = (id) => {
    const next = selectedStyles.includes(id)
      ? selectedStyles.filter((s) => s !== id)
      : [...selectedStyles, id];
    dispatch({ type: 'SET_STYLES', payload: next });
  };

  const toggleTheme = (id) => {
    const next = selectedThemes.includes(id)
      ? selectedThemes.filter((t) => t !== id)
      : [...selectedThemes, id];
    dispatch({ type: 'SET_THEMES', payload: next });
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Pick Your Styles & Themes</h2>
        <p className="text-text-muted">
          Optionally choose up to {MVP_CONFIG.MAX_STYLES} art styles and {MVP_CONFIG.MAX_THEMES} themes.
          {selectedStyles.length === 0 && selectedThemes.length === 0 && (
            <span className="block text-xs mt-1">Skip if you'd rather let the AI surprise you based on your survey answers.</span>
          )}
        </p>
      </div>

      <SelectionGrid
        items={ART_STYLES}
        selected={selectedStyles}
        onToggle={toggleStyle}
        maxItems={MVP_CONFIG.MAX_STYLES}
        icon={Palette}
        label="Art Styles"
      />

      <SelectionGrid
        items={THEMES}
        selected={selectedThemes}
        onToggle={toggleTheme}
        maxItems={MVP_CONFIG.MAX_THEMES}
        icon={Sparkles}
        label="Themes"
      />

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
          {selectedStyles.length === 0 && selectedThemes.length === 0 ? 'Skip' : 'Continue to Generate'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
