import { Button } from './Button';
import ui from './ui.module.css';
import styles from './PlayerCard.module.css';

interface TurnActionsProps {
  disabledReason: string | null;
  onRoll: () => void;
  onHold: () => void;
}

export function TurnActions({ disabledReason, onRoll, onHold }: TurnActionsProps) {
  const disabled = disabledReason !== null;
  const title = disabledReason ?? undefined;
  return (
    <div className={styles.actions}>
      <Button variant="primary" onClick={onRoll} disabled={disabled} title={title}>
        🎲 Roll <kbd className={ui.kbd}>R</kbd>
      </Button>
      <Button onClick={onHold} disabled={disabled} title={title}>
        ✋ Hold <kbd className={ui.kbd}>H</kbd>
      </Button>
    </div>
  );
}
