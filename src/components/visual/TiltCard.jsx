import React, { useRef } from 'react';
import { m, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';

// Pointer-driven 3D tilt with a soft spring + a moving sheen. No 3D engine — just
// CSS transforms, so it's ~0kb and GPU-composited. Disabled entirely under
// prefers-reduced-motion (returns a plain element).
export default function TiltCard({ children, className = '', max = 9, ...rest }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 220, damping: 18 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 220, damping: 18 });
  const sheenX = useTransform(px, [0, 1], ['0%', '100%']);

  if (reduced) {
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    );
  }

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <m.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', transformPerspective: 900 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative ${className}`}
      {...rest}
    >
      {children}
      {/* Moving sheen */}
      <m.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            sheenX,
            (x) => `radial-gradient(600px circle at ${x} 0%, rgba(255,255,255,0.10), transparent 40%)`
          ),
        }}
      />
    </m.div>
  );
}
