import type { LastRollDto } from '@dice/contracts';
import { Die } from './Die';
import styles from './DiceTable.module.css';

interface DiceTableProps {
  lastRoll: LastRollDto | null;
  /** Changes on every roll so the dice re-mount and replay the toss animation. */
  rollKey: number;
  hint: string;
}

export function DiceTable({ lastRoll, rollKey, hint }: DiceTableProps) {
  const [a, b] = lastRoll?.dice ?? [null, null];
  const animate = rollKey > 0;
  return (
    <div className={styles.table}>
      <div>
        <div className={styles.dice} key={rollKey}>
          <Die value={a} animate={animate} />
          <Die value={b} animate={animate} />
        </div>
        <div className={styles.result}>
          {lastRoll && !lastRoll.bust && rollKey > 0 ? (
            <span className={styles.delta} key={rollKey}>
              +{lastRoll.dice[0] + lastRoll.dice[1]}
            </span>
          ) : (
            <span className={styles.hint}>{hint}</span>
          )}
        </div>
      </div>
    </div>
  );
}
