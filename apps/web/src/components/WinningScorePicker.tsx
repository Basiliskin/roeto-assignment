import { WINNING_SCORE_MAX, WINNING_SCORE_MIN } from '@dice/contracts';
import styles from './Modal.module.css';

const PRESETS = [50, 100, 250];

interface WinningScorePickerProps {
  value: number;
  onChange: (value: number) => void;
}

export function WinningScorePicker({ value, onChange }: WinningScorePickerProps) {
  const custom = !PRESETS.includes(value);
  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>First to</legend>
      <div className={styles.chips}>
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={styles.chip}
            aria-pressed={value === preset}
            onClick={() => onChange(preset)}
          >
            {preset}
          </button>
        ))}
        <input
          className={styles.chipInput}
          type="number"
          inputMode="numeric"
          min={WINNING_SCORE_MIN}
          max={WINNING_SCORE_MAX}
          step={1}
          placeholder="Custom"
          aria-label="Custom Winning Score"
          value={custom ? value : ''}
          onChange={(e) => onChange(e.target.valueAsNumber)}
        />
      </div>
    </fieldset>
  );
}
