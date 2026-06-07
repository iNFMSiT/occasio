import React from 'react';

// Free-text "describe your vision" box. The friendly catch-all that absorbs
// the personal magic without forcing structured fields.
export default function VisionTextBox({ value = '', onChange, placeholder, helper }) {
  return (
    <div className="space-y-1.5">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-surface-light/50 border border-surface-lighter rounded-lg px-4 py-3 text-sm
                   placeholder:text-text-muted/50 focus:border-brand focus:outline-none transition-colors resize-none"
      />
      {helper && <p className="text-xs text-text-muted">{helper}</p>}
    </div>
  );
}
