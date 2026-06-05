import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Gift } from 'lucide-react';
import { useTheme } from './ThemeContext.jsx';
import { useAllowMotion } from './useAllowMotion.js';

// three.js + R3F live behind this lazy import, so they stay out of the initial bundle
// and only download when we actually mount the 3D scene.
const HeroScene = lazy(() => import('./HeroScene.jsx'));

// A pure-CSS stand-in shown while the 3D loads, and as the permanent fallback for
// reduced-motion / low-end devices (where we never load three.js at all).
function Poster() {
  const { theme } = useTheme();
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        className="absolute h-40 w-40 rounded-full blur-2xl opacity-60"
        style={{ background: `radial-gradient(circle, var(--color-brand), transparent 70%)` }}
      />
      <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-brand-light/30 bg-surface-light/40 shadow-2xl backdrop-blur">
        <Gift size={48} className="text-brand-light" />
      </div>
    </div>
  );
}

export default function HeroCenterpiece({ className = '' }) {
  const allowMotion = useAllowMotion();
  const { theme } = useTheme();
  const ref = useRef(null);
  const [active, setActive] = useState(true);

  // Pause the render loop when the canvas scrolls out of view or the tab is hidden.
  useEffect(() => {
    if (!allowMotion) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting && !document.hidden),
      { threshold: 0.1 }
    );
    io.observe(el);

    const onVisibility = () => setActive(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [allowMotion]);

  return (
    <div ref={ref} className={className}>
      {allowMotion ? (
        <Suspense fallback={<Poster />}>
          <HeroScene active={active} accent={theme.accent3d} sparkleColor={theme.sparkleColor} />
        </Suspense>
      ) : (
        <Poster />
      )}
    </div>
  );
}
