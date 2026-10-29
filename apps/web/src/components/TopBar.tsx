import { Button } from './Button';
import styles from './Board.module.css';

interface TopBarProps {
  winningScore: number;
  onNewGame: () => void;
  onLogout: () => void;
}

export function TopBar({ winningScore, onNewGame, onLogout }: TopBarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <span className={styles.mark} aria-hidden="true">
          🎲
        </span>
        Dice Table
      </div>
      <span className={styles.pill}>
        First to <b>{winningScore}</b>
      </span>
      <div className={styles.topActions}>
        <Button size="sm" onClick={onNewGame}>
          ↻ New game
        </Button>
        <Button size="sm" onClick={onLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
