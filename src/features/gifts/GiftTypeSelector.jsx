import React, { useRef } from 'react';
import { ArrowRight, Sparkles, Wand2, Share2, Clock } from 'lucide-react';
import { m } from 'motion/react';
import { GIFT_TYPES } from './registry.js';
import TiltCard from '../../components/visual/TiltCard.jsx';
import { OccasioHero } from './hero/OccasioHero.jsx';
import { getHeroVariant, COPY } from '../../data/copy';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
};

const HOW_ICONS = [Wand2, Sparkles, Share2];

export default function GiftTypeSelector({ onSelect, onInspiration }) {
  const types = Object.values(GIFT_TYPES);
  const cardsRef = useRef(null);
  const hero = getHeroVariant();

  // The hero CTA plays its confetti + "develop" reveal, then nudges the user down
  // to actually pick a gift type.
  const handleHeroCta = () => {
    cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <m.div variants={container} initial="hidden" animate="show" className="space-y-10">
      {/* Paper Keepsake hero */}
      <div>
        <m.div variants={rise}>
          <OccasioHero
            onGenerate={handleHeroCta}
            kicker={hero.kicker}
            tagline={hero.headline}
            ctaLabel={hero.cta}
          />
        </m.div>
        <m.p variants={rise} className="mx-auto mt-5 max-w-xl text-center text-text-muted">
          {hero.subhead}
        </m.p>
      </div>

      {/* How it works */}
      <m.div variants={rise} className="mx-auto grid max-w-2xl grid-cols-3 gap-3">
        {COPY.howItWorks.map((step, i) => {
          const Icon = HOW_ICONS[i];
          return (
            <div
              key={step.title}
              className="rounded-xl border border-surface-lighter/50 bg-surface-light/20 p-4 text-center backdrop-blur-sm"
            >
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand-light">
                <Icon size={18} />
              </div>
              <p className="text-sm font-semibold">
                <span className="text-brand-light">{i + 1}.</span> {step.title}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">{step.detail}</p>
            </div>
          );
        })}
      </m.div>

      {/* Coming soon tease — honest about not-yet-built outputs */}
      {COPY.comingSoon?.length > 0 && (
        <m.div variants={rise} className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted/70">Coming soon</span>
          {COPY.comingSoon.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full border border-surface-lighter/60 bg-surface-light/20 px-3 py-1 text-xs text-text-muted"
            >
              <Clock size={12} className="text-accent" />
              {item}
            </span>
          ))}
        </m.div>
      )}

      {/* Gift type cards */}
      <div ref={cardsRef} className="scroll-mt-6">
        <m.h2 variants={rise} className="font-display mb-5 text-center text-2xl font-bold">
          {COPY.selectorHeading}
        </m.h2>
        <m.div variants={container} className="mx-auto grid max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
        {types.map((type) => {
          const Icon = type.icon;
          return (
            <m.div key={type.id} variants={rise}>
              <TiltCard className="group h-full">
                <button
                  onClick={() => onSelect(type.id)}
                  className="relative flex h-full w-full flex-col rounded-2xl border border-surface-lighter/70 bg-surface-light/30 p-6 text-left backdrop-blur-sm transition-colors duration-300 hover:border-brand-light/60 hover:bg-surface-light/50"
                >
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${type.color} shadow-lg`}
                    style={{ transform: 'translateZ(40px)' }}
                  >
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="font-display text-xl font-semibold">{type.label}</h3>
                  <p className="mt-1 mb-5 text-sm text-text-muted">{type.description}</p>
                  <div className="mt-auto flex items-center gap-1.5 text-sm font-medium text-brand-light transition-colors group-hover:text-brand">
                    Get Started
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              </TiltCard>
            </m.div>
          );
        })}
        </m.div>
      </div>

      {/* Inspiration CTA */}
      {onInspiration && (
        <m.div variants={rise} className="mx-auto max-w-2xl">
          <button
            onClick={onInspiration}
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-surface-lighter/60 bg-surface-light/20 px-5 py-3.5 text-sm text-text-muted backdrop-blur-sm transition-all hover:border-brand-light/50 hover:bg-surface-light/40 hover:text-text"
          >
            <Sparkles size={16} className="text-accent" />
            {COPY.selectorInspirationCta}{' '}
            <span className="font-medium text-brand-light group-hover:text-brand">{COPY.selectorInspirationLink}</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </m.div>
      )}
    </m.div>
  );
}
