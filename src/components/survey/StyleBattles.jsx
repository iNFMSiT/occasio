import React, { useState } from 'react';
import { Swords } from 'lucide-react';
import { STYLE_BATTLES } from '../../config/constants.js';

export default function StyleBattles({ value = {}, onChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const battle = STYLE_BATTLES[currentIndex];
  const total = STYLE_BATTLES.length;
  const completed = Object.keys(value).length;

  if (!battle) {
    return (
      <div className="text-center py-8 space-y-2">
        <Swords size={32} className="mx-auto text-success" />
        <p className="font-medium text-success">All battles complete!</p>
        <p className="text-sm text-text-muted">{completed}/{total} decisions made</p>
      </div>
    );
  }

  const pick = (side) => {
    onChange({ ...value, [battle.id]: side });
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-text-muted">
          Battle {currentIndex + 1} of {total}
        </p>
        <div className="flex gap-1 justify-center mt-2">
          {STYLE_BATTLES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full ${
                i < completed ? 'bg-brand' : i === currentIndex ? 'bg-brand/50' : 'bg-surface-lighter'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-4 items-stretch">
        <button
          onClick={() => pick('left')}
          className={`flex-1 p-6 rounded-xl border-2 transition-all card-hover text-center ${
            value[battle.id] === 'left'
              ? 'border-brand bg-brand/10'
              : 'border-surface-lighter hover:border-brand-light/50'
          }`}
        >
          <span className="text-lg font-semibold">{battle.left}</span>
        </button>

        <div className="flex items-center">
          <span className="text-xs text-text-muted font-bold px-2">VS</span>
        </div>

        <button
          onClick={() => pick('right')}
          className={`flex-1 p-6 rounded-xl border-2 transition-all card-hover text-center ${
            value[battle.id] === 'right'
              ? 'border-brand bg-brand/10'
              : 'border-surface-lighter hover:border-brand-light/50'
          }`}
        >
          <span className="text-lg font-semibold">{battle.right}</span>
        </button>
      </div>
    </div>
  );
}
