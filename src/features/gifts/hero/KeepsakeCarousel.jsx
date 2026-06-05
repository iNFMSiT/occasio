import { useEffect, useRef } from 'react';
import { Polaroid } from './Polaroid.jsx';
import styles from './KeepsakeCarousel.module.css';

const ROTATIONS = [-2, 1, -1, 2, 0, -2, 1];

/** Two rows of polaroids on a seamless infinite loop, scrolling in opposite
 *  directions, with cursor parallax and hover-lift. */
export function KeepsakeCarousel({ photos, speed = 0.4, parallax = 26, className = '' }) {
  const rootRef = useRef(null);
  const rowARef = useRef(null);
  const rowBRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });

  const setA = photos.filter((_, i) => i % 2 === 0);
  const setB = photos.filter((_, i) => i % 2 === 1);

  useEffect(() => {
    const rowA = rowARef.current;
    const rowB = rowBRef.current;
    const root = rootRef.current;
    if (!rowA || !rowB || !root) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const measure = (el, len, dir) => {
      if (len === 0 || el.children.length <= len) return { el, dir, off: 0, loop: 0, len };
      const loop = el.children[len].offsetLeft - el.children[0].offsetLeft;
      return { el, dir, off: dir < 0 ? 0 : -loop, loop, len };
    };

    let rows = [measure(rowA, setA.length, -1), measure(rowB, setB.length, 1)];

    const onMove = (e) => {
      const r = root.getBoundingClientRect();
      pointer.current = {
        x: ((e.clientX - r.left) / r.width - 0.5) * parallax,
        y: ((e.clientY - r.top) / r.height - 0.5) * (parallax * 0.38),
      };
    };
    root.addEventListener('pointermove', onMove);

    let raf = 0;
    const tick = () => {
      const { x: px, y: py } = pointer.current;
      for (const row of rows) {
        if (!reduce && row.loop > 0) {
          if (row.dir < 0) {
            row.off -= speed;
            if (row.off <= -row.loop) row.off += row.loop;
          } else {
            row.off += speed;
            if (row.off >= 0) row.off -= row.loop;
          }
        }
        const shift = px * (row.dir < 0 ? 1 : -1);
        row.el.style.transform = `translateX(${row.off + shift}px) translateY(${py}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      rows = [measure(rowA, setA.length, -1), measure(rowB, setB.length, 1)];
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, [setA.length, setB.length, speed, parallax]);

  const renderRow = (set) =>
    [...set, ...set].map((photo, i) => (
      <Polaroid
        key={i}
        photo={photo}
        style={{ transform: `rotate(${ROTATIONS[(i % set.length) % ROTATIONS.length]}deg)` }}
      />
    ));

  return (
    <div ref={rootRef} className={`${styles.root} ${className}`}>
      <div ref={rowARef} className={styles.row} style={{ top: 18 }}>
        {renderRow(setA)}
      </div>
      <div ref={rowBRef} className={styles.row} style={{ bottom: 16 }}>
        {renderRow(setB)}
      </div>
    </div>
  );
}
