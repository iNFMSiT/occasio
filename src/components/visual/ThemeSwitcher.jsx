import React from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from './ThemeContext.jsx';
import { THEMES, DIRECTION_IDS } from './themes.js';

// TEMPORARY preview control — lets you flip between the candidate visual directions
// live on the real screens. Removed once a direction is locked in (see plan step 6).
export default function ThemeSwitcher() {
  const { themeId, setTheme } = useTheme();
  const options = ['default', ...DIRECTION_IDS];

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <div className="flex items-center gap-1.5 rounded-full border border-surface-lighter/60 bg-surface/90 px-2 py-2 shadow-xl backdrop-blur">
        <Palette size={14} className="ml-1 mr-0.5 text-brand-light shrink-0" />
        {options.map((id) => {
          const active = themeId === id;
          return (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                active
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-text-muted hover:text-text hover:bg-surface-light'
              }`}
              title={`Preview: ${THEMES[id].label}`}
            >
              {THEMES[id].label}
            </button>
          );
        })}
      </div>
      <span className="rounded-full bg-surface/80 px-2 py-0.5 text-[10px] text-text-muted/70">
        preview only
      </span>
    </div>
  );
}
