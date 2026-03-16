import React, { useState, useEffect } from 'react';
import { Heart, Tv, Music } from 'lucide-react';

const FIELDS = [
  {
    id: 'hobbies',
    label: 'Hobbies & Interests',
    icon: Heart,
    placeholder: 'e.g. basketball, cooking, gaming',
    helper: 'What does your friend love to do? (comma-separated)',
  },
  {
    id: 'favoriteShows',
    label: 'Favorite Shows / Movies',
    icon: Tv,
    placeholder: 'e.g. Breaking Bad, Naruto, Star Wars',
    helper: "Pop culture they're obsessed with (comma-separated)",
  },
  {
    id: 'favoriteMusic',
    label: 'Favorite Music',
    icon: Music,
    placeholder: 'e.g. hip-hop, jazz, Taylor Swift',
    helper: 'Genres, artists, or vibes (comma-separated)',
  },
];

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

export default function Details({ hobbies = [], favoriteShows = [], favoriteMusic = [], onChange }) {
  const values = { hobbies, favoriteShows, favoriteMusic };

  return (
    <div className="space-y-5 py-1">
      {FIELDS.map((field) => (
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
