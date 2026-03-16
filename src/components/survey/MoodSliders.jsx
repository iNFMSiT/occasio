import React from 'react';
import { Flame, Zap, Laugh } from 'lucide-react';

const SLIDERS = [
  {
    id: 'chaos',
    label: 'Chaos Level',
    icon: Flame,
    low: 'Calm & Collected',
    high: 'Pure Chaos',
    color: 'from-blue-500 to-red-500',
  },
  {
    id: 'energy',
    label: 'Energy Level',
    icon: Zap,
    low: 'Chill Vibes',
    high: 'Maximum Energy',
    color: 'from-green-500 to-yellow-400',
  },
  {
    id: 'humor',
    label: 'Humor Level',
    icon: Laugh,
    low: 'Serious & Cool',
    high: 'Comedy Gold',
    color: 'from-purple-500 to-pink-400',
  },
];

export default function MoodSliders({ value = {}, onChange }) {
  const handleChange = (id, val) => {
    onChange({ ...value, [id]: val });
  };

  return (
    <div className="space-y-6 py-2">
      {SLIDERS.map((slider) => {
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
