import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import styles from './SubtleConfetti.module.css';

const SOFT = ['#e8a87c', '#e0a82e', '#c98aa6', '#7fb7ae', '#d9c7a8', '#ebb9c4'];

/**
 * Ambient, low-key confetti shimmer drawn on a canvas that fills its parent.
 * The parent element must be `position: relative`.
 * Use a ref to call `sprinkleCenter()` on a celebratory moment.
 */
export const SubtleConfetti = forwardRef(function SubtleConfetti(
  { intensity = 1, cursorTrail = true, className = '' },
  ref
) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const size = useRef({ w: 0, h: 0 });
  const intensityRef = useRef(intensity);

  useEffect(() => {
    intensityRef.current = intensity;
    if (intensity === 0) particles.current = [];
  }, [intensity]);

  const pick = () => SOFT[(Math.random() * SOFT.length) | 0];

  const addFleck = (x, y, cursor) => {
    if (particles.current.length > 200) particles.current.shift();
    particles.current.push({
      x,
      y,
      vx: (Math.random() - 0.5) * (cursor ? 1.4 : 0.4),
      vy: (cursor ? -0.3 : 0.4) + Math.random() * 0.7,
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.12,
      s: 1.6 + Math.random() * 3.4,
      shape: Math.random() < 0.34 ? 2 : Math.random() < 0.5 ? 0 : 1,
      color: pick(),
      a: 0,
      maxa: cursor ? 0.55 : 0.4 + Math.random() * 0.35,
      fadingIn: true,
      life: 1,
      fade: 0.0035 + Math.random() * 0.003,
    });
  };

  const sprinkleAt = (x, y, count = 12) => {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * 6.28;
      const sp = 0.6 + Math.random() * 2.4;
      particles.current.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 0.6,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.2,
        s: 2 + Math.random() * 3.6,
        shape: Math.random() < 0.5 ? 2 : 0,
        color: pick(),
        a: 0,
        maxa: 0.7,
        fadingIn: true,
        life: 1,
        fade: 0.006,
      });
    }
  };

  useImperativeHandle(ref, () => ({
    sprinkleAt,
    sprinkleCenter: (count = 12) => sprinkleAt(size.current.w / 2, size.current.h / 2, count),
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const parent = canvas.parentElement;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      size.current = { w: r.width, h: r.height };
      canvas.width = r.width * DPR;
      canvas.height = r.height * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e) => {
      const i = intensityRef.current;
      if (!cursorTrail || i === 0) return;
      if (Math.random() < i * 0.12) {
        const r = canvas.getBoundingClientRect();
        addFleck(e.clientX - r.left, e.clientY - r.top, true);
      }
    };
    parent?.addEventListener('pointermove', onMove);

    const star = (s) => {
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const ang = (k * Math.PI) / 4;
        const rad = k % 2 === 0 ? s : s * 0.4;
        ctx[k === 0 ? 'moveTo' : 'lineTo'](Math.cos(ang) * rad, Math.sin(ang) * rad);
      }
      ctx.closePath();
      ctx.fill();
    };

    let raf = 0;
    const frame = () => {
      const { w, h } = size.current;
      ctx.clearRect(0, 0, w, h);
      const i = intensityRef.current;
      if (i > 0 && !reduce && Math.random() < i * 0.16) addFleck(Math.random() * w, -8, false);

      const ps = particles.current;
      for (let n = ps.length - 1; n >= 0; n--) {
        const p = ps[n];
        if (p.fadingIn) {
          p.a += 0.05;
          if (p.a >= p.maxa) {
            p.a = p.maxa;
            p.fadingIn = false;
          }
        }
        p.vy += 0.012;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= p.fade;
        if (!p.fadingIn && p.life < 0.4) p.a = p.maxa * (p.life / 0.4);
        if (p.y > h + 16 || p.life <= 0) {
          ps.splice(n, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(p.a, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 0) ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.6);
        else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.s * 0.4, 0, 6.28);
          ctx.fill();
        } else star(p.s * 0.9);
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      parent?.removeEventListener('pointermove', onMove);
    };
  }, [cursorTrail]);

  return <canvas ref={canvasRef} className={`${styles.canvas} ${className}`} aria-hidden="true" />;
});
