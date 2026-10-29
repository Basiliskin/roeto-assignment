import styles from './PlayerCard.module.css';

interface ProgressBarProps {
  label: string;
  banked: number;
  round: number;
  max: number;
}

const pct = (value: number, max: number) => `${Math.min(100, (value / max) * 100)}%`;

/** Green = Global Score, striped = Round Score at stake. */
export function ProgressBar({ label, banked, round, max }: ProgressBarProps) {
  return (
    <div
      className={styles.progress}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(banked, max)}
    >
      <span className={styles.banked} style={{ width: pct(banked, max) }} />
      <span className={styles.round} style={{ width: pct(round, max) }} />
    </div>
  );
}
