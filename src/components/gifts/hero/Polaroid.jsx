import styles from './Polaroid.module.css';

/** A single instant-photo card: image (or gradient) + handwritten caption. */
export function Polaroid({ photo, style, className = '', noHover = false }) {
  const photoStyle = photo.src
    ? { backgroundImage: `url(${photo.src})` }
    : {
        backgroundImage: `linear-gradient(135deg, ${photo.from ?? '#ff9f45'}, ${
          photo.to ?? '#f25ca2'
        })`,
      };

  return (
    <div
      className={`${styles.pola} ${noHover ? styles.noHover : ''} ${className}`}
      style={style}
    >
      <div className={styles.photo} style={photoStyle} role="img" aria-label={photo.caption} />
      <div className={styles.caption}>{photo.caption}</div>
    </div>
  );
}
