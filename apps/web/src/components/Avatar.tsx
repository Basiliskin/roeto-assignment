import styles from './PlayerCard.module.css';

export type Accent = 'p1' | 'p2';

export function Avatar({ name, accent }: { name: string; accent: Accent }) {
  return (
    <span className={`${styles.avatar} ${styles[accent]}`} aria-hidden="true">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
