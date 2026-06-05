import React, { useState, useEffect } from 'react';

function DetailField({ field, items, onChange }) {
  const Icon = field.icon;

  // Keep raw string as local state so spaces aren't stripped while typing
  const [raw, setRaw] = useState(items.join(', '));

  // Sync from parent if items change externally (e.g. section toggle reset)
  useEffect(() => {
    setRaw(items.join(', '));
  }, [items.length === 0]); // only reset when cleared

  const handleInput = (e) => {
    setRaw(e.target.value);
  };

  // Parse into array only on blur — preserves spaces while typing
  const handleBlur = () => {
    const parsed = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onChange({ [field.id]: parsed });
  };

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Icon size={16} className="text-brand-light" />
        {field.label}
      </label>
      <input
        type="text"
        placeholder={field.placeholder}
        value={raw}
        onChange={handleInput}
        onBlur={handleBlur}
        className="w-full bg-surface-light/50 border border-surface-lighter rounded-lg px-4 py-2.5 text-sm
                   placeholder:text-text-muted/50 focus:border-brand focus:outline-none transition-colors"
      />
      <p className="text-xs text-text-muted">{field.helper}</p>
    </div>
  );
}

export default function FreeTextInputs({ fields, values = {}, onChange }) {
  return (
    <div className="space-y-5 py-1">
      {fields.map((field) => (
        <DetailField
          key={field.id}
          field={field}
          items={values[field.id] || []}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
