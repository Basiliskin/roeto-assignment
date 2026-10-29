import { BOT_USERNAME } from '@dice/contracts';
import { FormEvent, useState } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import { WinningScorePicker } from './WinningScorePicker';
import styles from './Modal.module.css';

interface NewGameDialogProps {
  open: boolean;
  inProgress: boolean;
  defaultOpponent: string;
  initialVsBot: boolean;
  initialWinningScore: number;
  pending: boolean;
  error: string | null;
  onStart: (input: { opponentUsername: string; winningScore: number }) => void;
  onClose: () => void;
}

export function NewGameDialog(props: NewGameDialogProps) {
  return (
    <Modal open={props.open} labelledBy="new-game-title" onClose={props.onClose}>
      <NewGameForm {...props} />
    </Modal>
  );
}

function NewGameForm({
  inProgress,
  defaultOpponent,
  initialVsBot,
  initialWinningScore,
  pending,
  error,
  onStart,
  onClose,
}: NewGameDialogProps) {
  const [opponentUsername, setOpponent] = useState('');
  const [vsBot, setVsBot] = useState(initialVsBot);
  const [winningScore, setWinningScore] = useState(initialWinningScore);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onStart({ opponentUsername: vsBot ? BOT_USERNAME : opponentUsername, winningScore });
  };

  return (
    <form className={styles.sheet} onSubmit={submit}>
      <h2 id="new-game-title">New game</h2>
      {inProgress && (
        <p className={styles.warning}>The current game will be abandoned — no one gets a win.</p>
      )}
      <label className={styles.field}>
        <span className={styles.label}>Opponent</span>
        <input
          className={styles.input}
          value={opponentUsername}
          onChange={(e) => setOpponent(e.target.value)}
          placeholder={vsBot ? 'Bot 🤖' : defaultOpponent}
          maxLength={20}
          autoComplete="off"
          disabled={vsBot}
        />
      </label>
      <label className={styles.check}>
        <input type="checkbox" checked={vsBot} onChange={(e) => setVsBot(e.target.checked)} />
        Play vs Bot 🤖
      </label>
      <WinningScorePicker value={winningScore} onChange={setWinningScore} />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit" disabled={pending} autoFocus>
          {pending ? 'Starting…' : 'Start game'}
        </Button>
      </div>
    </form>
  );
}
