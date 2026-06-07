import styles from './Wordmark.module.css';

/** The Occasio gradient wordmark (violet → magenta → gold). */
export function Wordmark({ children = 'Occasio', size = 54, className = '' }) {
  return (
    <span className={`${styles.wm} ${className}`} style={{ fontSize: size }}>
      {children}
    </span>
  );
}
