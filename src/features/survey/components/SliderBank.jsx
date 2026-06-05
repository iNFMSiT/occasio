import React from 'react';

export default function SliderBank({ sliders, value = {}, onChange }) {
  const handleChange = (id, val) => {
    onChange({ ...value, [id]: val });
  };

  return (
    <div className="space-y-6 py-2">
      {sliders.map((slider) => {
        const Icon = slider.icon;
        const val = value[slider.id] ?? 0.5;
        const pct = Math.round(val * 100);

        return (
          <div key={slider.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={18} className="text-brand-light" />
                <span className="font-medium text-sm">{slider.label}</span>
              </div>
              <span className="text-sm font-mono text-accent">{pct}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={val}
              onChange={(e) => handleChange(slider.id, parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-surface-lighter
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                         [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow-lg
                         [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
            />

            <div className="flex justify-between text-xs text-text-muted">
              <span>{slider.low}</span>
              <span>{slider.high}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
