import { Button } from './Button';
import { Modal } from './Modal';
import styles from './Modal.module.css';

interface WinOverlayProps {
  winner: { username: string; globalScore: number } | null;
  pending: boolean;
  onPlayAgain: () => void;
}

export function WinOverlay({ winner, pending, onPlayAgain }: WinOverlayProps) {
  return (
    <Modal open={winner !== null} labelledBy="win-title">
      {winner && (
        <div className={`${styles.sheet} ${styles.win}`}>
          <div className={styles.trophy} aria-hidden="true">
            🏆
          </div>
          <h2 id="win-title">{winner.username} wins!</h2>
          <p>Final score {winner.globalScore}</p>
          <Button variant="primary" onClick={onPlayAgain} disabled={pending} autoFocus>
            {pending ? 'Starting…' : 'Play again'}
          </Button>
        </div>
      )}
    </Modal>
  );
}
