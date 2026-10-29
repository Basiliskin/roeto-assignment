import { Button } from './Button';
import styles from './Board.module.css';

interface TopBarProps {
  winningScore: number;
  onNewGame: () => void;
  onLogout: () => void;
  muted: boolean;
  onToggleMuted: () => void;
}

export function TopBar({ winningScore, onNewGame, onLogout, muted, onToggleMuted }: TopBarProps) {
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
        <Button
          size="sm"
          onClick={onToggleMuted}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          title={muted ? 'Unmute sound' : 'Mute sound'}
        >
          {muted ? '🔇' : '🔊'}
        </Button>
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
