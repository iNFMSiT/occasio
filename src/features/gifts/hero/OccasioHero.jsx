import { useRef, useState } from 'react';
import { KeepsakeCarousel } from './KeepsakeCarousel.jsx';
import { SubtleConfetti } from './SubtleConfetti.jsx';
import { Polaroid } from './Polaroid.jsx';
import { Wordmark } from './Wordmark.jsx';
import { DEFAULT_PHOTOS } from './defaultPhotos.js';
import styles from './OccasioHero.module.css';

/** The Paper Keepsake hero stage: infinite polaroid carousel + subtle confetti
 *  + gradient wordmark + CTA, with a "develops" reveal moment. */
export function OccasioHero({
  photos = DEFAULT_PHOTOS,
  kicker = 'ANY OCCASION · PRINT AT HOME TONIGHT',
  tagline = 'Greeting cards that actually sing.',
  ctaLabel = 'Make their card',
  intensity = 1,
  onGenerate,
  demoReveal = true,
  className = '',
}) {
  const confetti = useRef(null);
  const [reveals, setReveals] = useState([]);
  const nextId = useRef(0);

  const handleGenerate = () => {
    onGenerate?.();
    confetti.current?.sprinkleCenter(6 + intensity * 7);
    if (demoReveal) {
      const photo = photos[(Math.random() * photos.length) | 0];
      const id = nextId.current++;
      setReveals((r) => [...r, { id, photo }]);
    }
  };

  return (
    <section
      className={`${styles.stage} ${className}`}
      aria-label="Occasio — make a personalized gift"
    >
      <KeepsakeCarousel photos={photos} />
      <SubtleConfetti ref={confetti} intensity={intensity} />

      <div className={styles.center}>
        <div className={styles.card}>
          <p className={styles.kicker}>{kicker}</p>
          <Wordmark size={54} />
          <p className={styles.tagline}>{tagline}</p>
          <button type="button" className={styles.cta} onClick={handleGenerate}>
            {ctaLabel}
          </button>
        </div>
      </div>

      {reveals.map((r) => (
        <div
          key={r.id}
          className={styles.reveal}
          onAnimationEnd={() => setReveals((cur) => cur.filter((x) => x.id !== r.id))}
        >
          <Polaroid photo={r.photo} noHover />
        </div>
      ))}
    </section>
  );
}
