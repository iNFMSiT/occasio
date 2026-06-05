import React, { useState } from 'react';
import { PartyPopper, X } from 'lucide-react';
import { OCCASIONS, OCCASION_PRESETS } from '../configs/occasionPresets.config.js';

export default function OccasionPicker({ value, onSelect, onClear }) {
  const [open, setOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');

  const selectedOccasion = value
    ? OCCASIONS.find((o) => o.id === value) ||
      (typeof value === 'object' ? { id: 'custom', label: value.label, emoji: '\u{270F}\u{FE0F}' } : null)
    : null;

  const handleSelect = (occasionId) => {
    if (occasionId === 'custom') {
      setShowCustomInput(true);
      setCustomText('');
      return;
    }
    const preset = OCCASION_PRESETS[occasionId] || null;
    onSelect(occasionId, preset);
    setOpen(false);
    setShowCustomInput(false);
  };

  const handleCustomSubmit = () => {
    const label = customText.trim();
    if (!label) return;
    onSelect({ type: 'custom', label }, null);
    setOpen(false);
    setShowCustomInput(false);
    setCustomText('');
  };

  const handleClose = () => {
    setOpen(false);
    setShowCustomInput(false);
    setCustomText('');
  };

  // Show selected badge when not editing
  if (selectedOccasion && !open) {
    return (
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/15 border border-brand/30 text-sm font-medium">
          <span>{selectedOccasion.emoji}</span>
          <span>{typeof value === 'object' ? value.label : selectedOccasion.label}</span>
          <button
            onClick={onClear}
            className="ml-1 p-0.5 rounded-full hover:bg-surface-lighter/50 transition-colors"
          >
            <X size={14} className="text-text-muted" />
          </button>
        </span>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-sm font-medium transition-colors"
        >
          <PartyPopper size={18} />
          Pick an Occasion!
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 animate-fade-in">
      <div className="rounded-xl border border-surface-lighter bg-surface-light/20 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">What's the occasion?</p>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-surface-lighter/50 transition-colors"
          >
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {OCCASIONS.map((occasion) => (
            <button
              key={occasion.id}
              onClick={() => handleSelect(occasion.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all text-center ${
                showCustomInput && occasion.id === 'custom'
                  ? 'border-brand bg-brand/10'
                  : 'border-surface-lighter hover:border-brand-light/50 hover:bg-brand/5'
              }`}
            >
              <span className="text-xl">{occasion.emoji}</span>
              <span className="text-xs font-medium">{occasion.label}</span>
            </button>
          ))}
        </div>

        {showCustomInput && (
          <div className="flex gap-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
              placeholder="Type your occasion..."
              className="flex-1 px-3 py-2 rounded-lg border border-surface-lighter bg-surface-light/30 text-sm focus:outline-none focus:border-brand"
              autoFocus
            />
            <button
              onClick={handleCustomSubmit}
              disabled={!customText.trim()}
              className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-sm font-medium transition-colors disabled:opacity-40"
            >
              Go
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
