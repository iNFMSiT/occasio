// Celebratory confetti burst for "gift created" moments.
//
// The tsParticles confetti engine is dynamically imported on first use, so it stays
// out of the initial bundle and only downloads when something is actually worth
// celebrating. Colors are pulled from the active theme's CSS tokens so the burst
// always matches the current look. No-ops under prefers-reduced-motion.

function themeColors() {
  const s = getComputedStyle(document.documentElement);
  const vars = ['--color-brand', '--color-accent', '--color-brand-light', '--color-accent-light'];
  const colors = vars.map((v) => s.getPropertyValue(v).trim()).filter(Boolean);
  return colors.length ? colors : ['#7c3aed', '#f59e0b', '#a78bfa'];
}

export async function fireConfetti() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const { confetti } = await import('@tsparticles/confetti');
  const colors = themeColors();
  const base = { colors, disableForReducedMotion: true, ticks: 200 };

  // Center pop...
  confetti({ ...base, particleCount: 90, spread: 85, startVelocity: 45, origin: { x: 0.5, y: 0.42 } });
  // ...followed by two side cannons.
  setTimeout(() => {
    confetti({ ...base, particleCount: 50, angle: 60, spread: 70, origin: { x: 0, y: 0.65 } });
    confetti({ ...base, particleCount: 50, angle: 120, spread: 70, origin: { x: 1, y: 0.65 } });
  }, 160);
}
