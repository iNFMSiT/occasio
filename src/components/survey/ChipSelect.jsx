import React from 'react';
import { Check } from 'lucide-react';

// Multi-select chip grid capped at `max`. `value` is an array of selected ids.
// Used for style / theme / genre / vibe — pick one, or up to a few for variety.
// If items carry a `thumb` (image URL), renders image-forward preview cards;
// otherwise falls back to text cards (e.g. song genre/vibe).
export default function ChipSelect({ items, value = [], onChange, max = 3 }) {
  const hasThumbs = items.some((it) => it.thumb);

  const toggle = (id) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else if (value.length < max) {
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-2">
      {max > 1 && (
        <div className="flex justify-end">
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-light border border-surface-lighter/50 text-text-muted">
            {value.length}/{max}
          </span>
        </div>
      )}

      {hasThumbs ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {items.map((item) => {
            const isSelected = value.includes(item.id);
            const atMax = !isSelected && value.length >= max;
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                disabled={atMax}
                title={item.description || item.label}
                className={`group relative rounded-xl overflow-hidden border-2 transition-all card-hover ${
                  isSelected
                    ? 'border-brand shadow-md shadow-brand/20'
                    : atMax
                      ? 'border-surface-lighter/30 opacity-40 cursor-not-allowed'
                      : 'border-surface-lighter hover:border-brand-light/50'
                }`}
              >
                <div className="aspect-[3/4] overflow-hidden bg-surface-light/40">
                  {item.thumb ? (
                    <img
                      src={item.thumb}
                      alt={item.label}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-text-muted px-2 text-center">
                      {item.label}
                    </div>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[11px] font-semibold text-white drop-shadow leading-tight">{item.label}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand flex items-center justify-center shadow">
                    <Check size={13} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {items.map((item) => {
            const isSelected = value.includes(item.id);
            const atMax = !isSelected && value.length >= max;
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
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
                {item.description && (
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{item.description}</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
