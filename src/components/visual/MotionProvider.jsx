import React from 'react';
import { LazyMotion, domAnimation, MotionConfig } from 'motion/react';

// Wraps the app so we can use the lightweight `m` components everywhere (~4.6kb
// initial vs ~34kb for the full `motion` component). `domAnimation` covers
// hover/tap/variants/whileInView — enough for our micro-interactions; it does NOT
// include layout/drag (that's `domMax`), which we don't need in phase 1.
//
// reducedMotion="user" makes every motion animation honor prefers-reduced-motion
// automatically. Our WebGL/3D layers gate themselves separately via useGentleMotion.
export default function MotionProvider({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
