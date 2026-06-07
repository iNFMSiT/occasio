import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ThumbsUp } from 'lucide-react';

/*
 * Expandable vertical rating slider.
 *
 * Collapsed: a single thumbs-up circle button.
 * On click: two track arms "grow" outward from the button —
 *   the positive arm extends upward (+1 to +5),
 *   the negative arm extends downward (-1 to -5).
 * The button itself stays fixed in the center and represents 0.
 *
 * The grow animation uses CSS max-height transition so the arms
 * appear to physically extend from the button rather than fading in.
 */

const ARM_HEIGHT = 80; // px height of each arm (top and bottom)

export default function RatingSlider({ value = null, onChange, compact = false }) {
  const [expanded, setExpanded] = useState(false);
  const [appeared, setAppeared] = useState(false); // drives the grow animation
  const [dragging, setDragging] = useState(false);
  const topArmRef = useRef(null);
  const bottomArmRef = useRef(null);
  const containerRef = useRef(null);

  const rating = value;

  // When expanding, flip `appeared` after a frame so CSS transitions kick in
  useEffect(() => {
    if (expanded) {
      const raf = requestAnimationFrame(() => setAppeared(true));
      return () => cancelAnimationFrame(raf);
    }
    setAppeared(false);
  }, [expanded]);

  const handleExpand = () => {
    setExpanded(true);
    if (value === null) onChange?.(0);
  };

  const handleCollapse = () => {
    setAppeared(false);
    // Wait for the shrink animation before actually unmounting
    setTimeout(() => setExpanded(false), 250);
  };

  // Close on outside click
  useEffect(() => {
    if (!expanded) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        handleCollapse();
      }
    };
    const timer = setTimeout(() => document.addEventListener('pointerdown', handler), 80);
    return () => { clearTimeout(timer); document.removeEventListener('pointerdown', handler); };
  }, [expanded]);

  // Convert clientY on either arm to a rating
  const calcRating = useCallback((clientY) => {
    const topEl = topArmRef.current;
    const bottomEl = bottomArmRef.current;
    if (!topEl || !bottomEl) return 0;

    const topRect = topEl.getBoundingClientRect();
    const bottomRect = bottomEl.getBoundingClientRect();

    // Above top arm → clamp +5
    if (clientY <= topRect.top) return 5;
    // Below bottom arm → clamp -5
    if (clientY >= bottomRect.bottom) return -5;

    // Inside top arm: map top→+5, bottom→0
    if (clientY <= topRect.bottom) {
      const pct = (clientY - topRect.top) / topRect.height;
      return Math.round(5 - pct * 5);
    }
    // Inside bottom arm: map top→0, bottom→-5
    if (clientY >= bottomRect.top) {
      const pct = (clientY - bottomRect.top) / bottomRect.height;
      return Math.round(-pct * 5);
    }

    return 0; // in the button gap
  }, []);

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    onChange?.(calcRating(e.clientY));
  };

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    onChange?.(calcRating(e.clientY));
  }, [dragging, calcRating, onChange]);

  const handlePointerUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [dragging, handlePointerMove, handlePointerUp]);

  // --- Helpers ---
  const getRatingColor = (val) => {
    if (val === null || val === 0) return 'text-text-muted';
    if (val >= 4) return 'text-emerald-400';
    if (val > 0) return 'text-emerald-500/80';
    if (val <= -4) return 'text-red-400';
    return 'text-red-400/80';
  };

  const getButtonBg = (val) => {
    if (val === null || val === 0) return 'bg-surface-light border-surface-lighter hover:border-brand/50';
    if (val > 0) return 'bg-emerald-500/20 border-emerald-500/50';
    return 'bg-red-400/20 border-red-400/50';
  };

  const getLabel = (val) => {
    if (val === null || val === 0) return '';
    if (val >= 4) return 'Nailed it!';
    if (val >= 2) return 'Pretty good';
    if (val === 1) return 'Decent';
    if (val <= -4) return 'Way off';
    if (val <= -2) return 'Not great';
    if (val === -1) return 'Meh';
    return '';
  };

  // Render a single arm (top = positive, bottom = negative)
  const renderArm = (direction) => {
    const isTop = direction === 'top';
    const ref = isTop ? topArmRef : bottomArmRef;
    const labels = isTop ? [5, 4, 3, 2, 1] : [1, 2, 3, 4, 5];
    const sign = isTop ? 1 : -1;

    // Which tick is "active" (the rating falls on this arm)?
    const activeVal = rating !== null ? rating : null;

    return (
      <div
        style={{
          maxHeight: appeared ? ARM_HEIGHT : 0,
          opacity: appeared ? 1 : 0,
          transition: 'max-height 250ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease',
          overflow: 'visible',
        }}
        className="flex flex-col items-center"
      >
        {/* The interactive track bar */}
        <div
          ref={ref}
          onPointerDown={handlePointerDown}
          className="relative cursor-pointer touch-none"
          style={{ width: 8, height: ARM_HEIGHT }}
        >
          {/* Track bg */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: isTop
                ? 'linear-gradient(to top, rgba(120,120,120,0.15), rgba(52,211,153,0.25))'
                : 'linear-gradient(to bottom, rgba(120,120,120,0.15), rgba(248,113,113,0.25))',
            }}
          />

          {/* Filled portion showing current rating */}
          {activeVal !== null && ((isTop && activeVal > 0) || (!isTop && activeVal < 0)) && (() => {
            const magnitude = Math.abs(activeVal);
            const fillPct = (magnitude / 5) * 100;
            return (
              <div
                className={`absolute left-0 w-full rounded-full transition-all duration-100 ${
                  isTop ? 'bg-emerald-500/50 bottom-0' : 'bg-red-400/50 top-0'
                }`}
                style={{ height: `${fillPct}%` }}
              />
            );
          })()}

          {/* Tick marks */}
          {labels.map((num, i) => {
            const val = num * sign;
            const pct = isTop
              ? ((5 - num) / 5) * 100  // +5 at top (0%), +1 at bottom (80%)
              : (num / 5) * 100;        // -1 at top (20%), -5 at bottom (100%)
            const isActive = activeVal === val;

            return (
              <div
                key={num}
                className="absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-none"
                style={{ top: `${pct}%`, transform: 'translate(-50%, -50%)' }}
              >
                {/* Tick dot */}
                <div className={`rounded-full transition-all duration-100 ${
                  isActive
                    ? `w-2.5 h-2.5 ${isTop ? 'bg-emerald-400' : 'bg-red-400'} shadow-md`
                    : 'w-1 h-1 bg-text-muted/30'
                }`} />

                {/* Number label to the right */}
                <span
                  className={`absolute left-5 text-[9px] tabular-nums transition-all duration-100 whitespace-nowrap ${
                    isActive
                      ? `font-bold ${isTop ? 'text-emerald-400' : 'text-red-400'}`
                      : 'text-text-muted/40 font-normal'
                  }`}
                >
                  {isTop ? `+${num}` : `-${num}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* End label */}
        <span
          className={`text-[9px] font-bold transition-opacity duration-200 ${
            appeared ? 'opacity-100' : 'opacity-0'
          } ${isTop ? 'text-emerald-500/70 order-first mb-0.5' : 'text-red-400/70 mt-0.5'}`}
        >
          {isTop ? '+5' : '-5'}
        </span>
      </div>
    );
  };

  // --- Collapsed state ---
  if (!expanded) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <button
          onClick={handleExpand}
          className={`relative flex items-center justify-center w-7 h-7 rounded-full border transition-all group ${getButtonBg(value)}`}
          title="Rate this image"
        >
          <ThumbsUp
            size={compact ? 12 : 14}
            className={`transition-transform group-hover:scale-110 ${
              value !== null && value < 0 ? 'rotate-180' : ''
            } ${value !== null ? (value > 0 ? 'text-emerald-400' : value < 0 ? 'text-red-400' : 'text-text-muted') : 'text-text-muted group-hover:text-brand'}`}
          />
        </button>
        {value !== null && (
          <div className="flex items-center gap-1">
            <span className={`text-[11px] font-semibold tabular-nums ${getRatingColor(value)}`}>
              {value > 0 ? `+${value}` : value}
            </span>
            {getLabel(value) && (
              <span className="text-[9px] text-text-muted">{getLabel(value)}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- Expanded state ---
  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center select-none"
      style={{ zIndex: 30 }}
    >
      {/* Top arm (positive ratings) — grows upward from button */}
      {renderArm('top')}

      {/* Center button — the anchor, always in flow */}
      <button
        onClick={handleCollapse}
        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all my-0.5 ${
          rating > 0
            ? 'bg-emerald-500/30 border-emerald-400 shadow-lg shadow-emerald-500/20'
            : rating < 0
            ? 'bg-red-400/30 border-red-400 shadow-lg shadow-red-400/20'
            : 'bg-surface-light border-surface-lighter'
        }`}
        title="Close rating"
      >
        <ThumbsUp
          size={compact ? 12 : 14}
          className={`transition-transform duration-200 ${
            rating !== null && rating < 0 ? 'rotate-180' : ''
          } ${rating !== null ? (rating > 0 ? 'text-emerald-400' : rating < 0 ? 'text-red-400' : 'text-text-muted') : 'text-text-muted'}`}
        />
      </button>

      {/* Rating value badge floats to the right of the button */}
      {rating !== null && rating !== 0 && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none flex items-center gap-1">
          <span className={`text-xs font-bold tabular-nums ${getRatingColor(rating)}`}>
            {rating > 0 ? `+${rating}` : rating}
          </span>
          {getLabel(rating) && (
            <span className="text-[9px] text-text-muted">{getLabel(rating)}</span>
          )}
        </div>
      )}

      {/* Bottom arm (negative ratings) — grows downward from button */}
      {renderArm('bottom')}
    </div>
  );
}
