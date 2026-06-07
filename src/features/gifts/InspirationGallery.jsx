import React, { useMemo, useState } from 'react';
import { ArrowLeft, Sparkles, Wand2 } from 'lucide-react';
import { m } from 'motion/react';
import { HALL_OF_FAME, SHOWCASE } from '../../data/inspiration';
import { COPY } from '../../data/copy';

const ALL = 'All';

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const tile = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 130, damping: 18 } },
};

export default function InspirationGallery({ onMakeThis, onBack }) {
  const occasions = useMemo(() => {
    const set = new Set(HALL_OF_FAME.map((r) => r.occasion).filter(Boolean));
    return [ALL, ...set];
  }, []);

  const [filter, setFilter] = useState(ALL);

  const featured = filter === ALL
    ? HALL_OF_FAME
    : HALL_OF_FAME.filter((r) => r.occasion === filter);

  return (
    <div className="animate-fade-in space-y-10">
      <div className="text-center space-y-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-brand-light to-accent bg-clip-text text-transparent">
          {COPY.gallery.headline}
        </h1>
        <p className="text-text-muted max-w-md mx-auto">
          {COPY.gallery.subtitle}
        </p>
      </div>

      {/* Make-this tier */}
      {featured.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Wand2 size={18} className="text-brand-light" />
            <h2 className="text-lg font-semibold">Start from one of these</h2>
          </div>

          {occasions.length > 2 && (
            <div className="flex flex-wrap gap-2">
              {occasions.map((occ) => (
                <button
                  key={occ}
                  onClick={() => setFilter(occ)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    filter === occ
                      ? 'border-brand bg-brand/15 text-brand-light'
                      : 'border-surface-lighter text-text-muted hover:border-brand-light/40'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          )}

          <m.div
            variants={grid}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {featured.map((item) => (
              <m.div
                key={item.id}
                variants={tile}
                className="group relative rounded-2xl overflow-hidden border border-surface-lighter bg-surface-light/20 card-hover"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <p className="text-sm font-semibold text-white drop-shadow">{item.title}</p>
                  {item.occasion && (
                    <p className="text-[11px] text-white/70">{item.occasion}</p>
                  )}
                  <button
                    onClick={() => onMakeThis(item.recipe, item.giftType)}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand hover:bg-brand-dark text-xs font-semibold text-white transition-colors"
                  >
                    <Sparkles size={13} />
                    {COPY.gallery.makeThis}
                  </button>
                </div>
              </m.div>
            ))}
          </m.div>
        </section>
      )}

      {/* Showcase tier — pure eye-candy */}
      {SHOWCASE.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-text-muted">More from the gallery</h2>
          <m.div
            variants={grid}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-8%' }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            {SHOWCASE.map((item) => (
              <m.div
                key={item.id}
                variants={tile}
                className="relative rounded-xl overflow-hidden border border-surface-lighter/50 bg-surface-light/10"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 px-2.5 py-1.5 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-[11px] font-medium text-white/90 drop-shadow">{item.title}</p>
                </div>
              </m.div>
            ))}
          </m.div>
        </section>
      )}
    </div>
  );
}
