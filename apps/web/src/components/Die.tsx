import styles from './DiceTable.module.css';

/** Pip cells (0–8, row-major 3×3) lit for each face. */
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function Die({ value, animate }: { value: number | null; animate: boolean }) {
  const lit = value ? PIPS[value] : [];
  const classes = [
    styles.die,
    value ? '' : styles.empty,
    value === 6 ? styles.six : '',
    animate ? styles.toss : '',
  ].join(' ');
  return (
    <div className={classes} role="img" aria-label={value ? String(value) : 'not rolled'}>
      {Array.from({ length: 9 }, (_, i) => (
        <i key={i} className={lit.includes(i) ? styles.on : undefined} />
      ))}
    </div>
  );
}
