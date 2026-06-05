import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

// Decides whether the expensive ambient layers (animated shader, 3D canvas) should
// run. We turn them off — falling back to a static gradient / poster — when:
//   - the user prefers reduced motion, or
//   - the browser is in data-saver mode (Save-Data), or
//   - the device reports very low memory.
// This keeps the experience smooth on low-end / battery-constrained devices and
// respects accessibility, without affecting the lightweight DOM micro-interactions
// (those are handled globally by MotionConfig reducedMotion="user").
export function useAllowMotion() {
  const prefersReduced = useReducedMotion();
  const [constrained, setConstrained] = useState(false);

  useEffect(() => {
    const conn = navigator.connection || navigator.webkitConnection;
    const saveData = !!conn?.saveData;
    const lowMem = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2;
    setConstrained(saveData || lowMem);
  }, []);

  return !prefersReduced && !constrained;
}
