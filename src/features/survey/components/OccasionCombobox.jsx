import React, { useState, useRef, useEffect } from 'react';
import { PartyPopper, X, Search } from 'lucide-react';
import { OCCASIONS, OCCASION_PRESETS } from '../configs/occasionPresets.config.js';

// Single smart field: pick a common occasion or type your own.
// Contract preserved from the old OccasionPicker:
//   onSelect(occasionId, preset)            // preset choice
//   onSelect({ type:'custom', label }, null) // free text
const PICKABLE = OCCASIONS.filter((o) => o.id !== 'custom');

export default function OccasionCombobox({ value, onSelect, onClear, stepNumber = null, title = 'Pick an occasion' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);

  // When a step number is supplied, render a larger, titled "step" card.
  const numbered = stepNumber != null;
  const header = numbered ? (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand text-white text-sm font-bold shrink-0">
        {stepNumber}
      </span>
      <h3 className="text-lg font-bold">{title}</h3>
    </div>
  ) : null;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const selected = value
    ? typeof value === 'object'
      ? { label: value.label, emoji: '\u{270F}\u{FE0F}' }
      : PICKABLE.find((o) => o.id === value) || { label: value, emoji: '\u{1F389}' }
    : null;

  const matches = PICKABLE.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  const choosePreset = (id) => {
    onSelect(id, OCCASION_PRESETS[id] || null);
    setOpen(false);
    setQuery('');
  };

  const chooseCustom = () => {
    const label = query.trim();
    if (!label) return;
    // If the typed text exactly matches a preset label, treat it as that preset.
    const exact = PICKABLE.find((o) => o.label.toLowerCase() === label.toLowerCase());
    if (exact) return choosePreset(exact.id);
    onSelect({ type: 'custom', label }, null);
    setOpen(false);
    setQuery('');
  };

  // Selected, not editing → show a chip
  if (selected && !open) {
    return (
      <div className={numbered ? 'max-w-md mx-auto mb-6' : 'flex flex-col items-center mb-4'}>
        {header}
        <div className={numbered ? '' : 'flex items-center justify-center'}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/15 border border-brand/30 text-sm font-medium">
            <span>{selected.emoji}</span>
            <span>{selected.label}</span>
            <button
              onClick={onClear}
              className="ml-1 p-0.5 rounded-full hover:bg-surface-lighter/50 transition-colors"
              title="Change occasion"
            >
              <X size={14} className="text-text-muted" />
            </button>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="max-w-md mx-auto mb-6 relative">
      {header}
      <div className={`flex items-center gap-2 rounded-xl border border-surface-lighter bg-surface-light/30 focus-within:border-brand transition-colors ${numbered ? 'px-4 py-3.5' : 'px-3 py-2.5'}`}>
        <PartyPopper size={numbered ? 22 : 18} className="text-brand-light shrink-0" />
        <input
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={(e) => { if (e.key === 'Enter') chooseCustom(); if (e.key === 'Escape') setOpen(false); }}
          placeholder="What's the occasion? (pick one or type your own)"
          className={`flex-1 bg-transparent focus:outline-none placeholder:text-text-muted/60 ${numbered ? 'text-base' : 'text-sm'}`}
        />
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-surface-lighter bg-surface shadow-xl overflow-hidden animate-fade-in">
          <div className="max-h-64 overflow-y-auto py-1">
            {matches.map((o) => (
              <button
                key={o.id}
                onClick={() => choosePreset(o.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-brand/10 transition-colors"
              >
                <span className="text-lg">{o.emoji}</span>
                <span>{o.label}</span>
              </button>
            ))}
            {query.trim() && !matches.some((o) => o.label.toLowerCase() === query.trim().toLowerCase()) && (
              <button
                onClick={chooseCustom}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-brand/10 transition-colors border-t border-surface-lighter/40"
              >
                <Search size={16} className="text-text-muted" />
                <span>Use “<span className="font-medium">{query.trim()}</span>”</span>
              </button>
            )}
            {!matches.length && !query.trim() && (
              <p className="px-3 py-2 text-xs text-text-muted">Start typing for a custom occasion…</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
