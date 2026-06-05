import React, { useState } from 'react';
import { Shuffle, Plus, X, BookOpen } from 'lucide-react';

export default function MadLibBuilder({ templates, value = [], onChange }) {
  const [templateIndex, setTemplateIndex] = useState(0);
  const [selections, setSelections] = useState({});

  const template = templates[templateIndex];

  const shuffle = () => {
    setTemplateIndex((i) => (i + 1) % templates.length);
    setSelections({});
  };

  const updateField = (fieldId, fieldValue) => {
    setSelections((prev) => ({ ...prev, [fieldId]: fieldValue }));
  };

  const buildDisplayText = () => {
    let text = template.template;
    template.fields.forEach((field) => {
      const selected = selections[field.id];
      if (selected) {
        const option = field.options.find((o) => o.value === selected);
        text = text.replace(`{${field.id}}`, option?.label || selected);
      }
    });
    return text;
  };

  const canConfirm = template.fields.every((f) => selections[f.id]);

  const confirmPrompt = () => {
    if (!canConfirm) return;
    const newPrompt = {
      templateId: template.id,
      displayText: buildDisplayText(),
      selections: { ...selections },
    };
    onChange([...value, newPrompt]);
    setSelections({});
    shuffle();
  };

  const removePrompt = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      {/* Template builder */}
      <div className="bg-surface-light/50 rounded-xl p-5 space-y-4 border border-surface-lighter/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-brand-light" />
            <span className="text-sm font-medium">Template {templateIndex + 1}/{templates.length}</span>
          </div>
          <button
            onClick={shuffle}
            className="flex items-center gap-1.5 text-sm text-brand-light hover:text-brand transition-colors"
          >
            <Shuffle size={14} />
            Next template
          </button>
        </div>

        {/* Preview of the template with blanks */}
        <p className="text-sm text-text-muted italic leading-relaxed">
          "{buildDisplayText()}"
        </p>

        {/* Field selectors */}
        <div className="grid grid-cols-2 gap-3">
          {template.fields.map((field) => (
            <div key={field.id}>
              <label className="block text-xs text-text-muted mb-1">{field.label}</label>
              <select
                value={selections[field.id] || ''}
                onChange={(e) => updateField(field.id, e.target.value)}
                className="w-full bg-surface rounded-lg border border-surface-lighter px-3 py-2 text-sm text-text
                           focus:border-brand focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">Choose...</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          onClick={confirmPrompt}
          disabled={!canConfirm}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand hover:bg-brand-dark
                     disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <Plus size={14} />
          Add this prompt
        </button>
      </div>

      {/* Locked-in prompts */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted font-medium">
            Your prompts ({value.length})
          </p>
          {value.map((prompt, i) => (
            <div
              key={i}
              className="flex items-start gap-2 bg-surface-light/30 rounded-lg px-3 py-2 border border-surface-lighter/30"
            >
              <p className="text-sm flex-1 italic">"{prompt.displayText}"</p>
              <button
                onClick={() => removePrompt(i)}
                className="text-text-muted hover:text-danger shrink-0 mt-0.5"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
