import { BOT_USERNAME, type PlayerStateDto } from '@dice/contracts';
import { ReactNode } from 'react';
import { Accent, Avatar } from './Avatar';
import { ProgressBar } from './ProgressBar';
import { winsLabel } from './winsLabel';
import ui from './ui.module.css';
import styles from './PlayerCard.module.css';

interface PlayerCardProps {
  player: PlayerStateDto;
  accent: Accent;
  active: boolean;
  winningScore: number;
  /** Turn actions for the active card, "Waiting for…" otherwise. */
  footer: ReactNode;
}

export function PlayerCard({ player, accent, active, winningScore, footer }: PlayerCardProps) {
  const toGo = Math.max(0, winningScore - player.globalScore);
  const turnLabel = player.username === BOT_USERNAME ? "Bot's turn" : 'Your turn';
  return (
    <section
      className={`${ui.glass} ${styles.card} ${styles[accent]} ${active ? styles.active : styles.idle}`}
      aria-label={active ? `${player.username}, ${turnLabel.toLowerCase()}` : player.username}
    >
      <header className={styles.head}>
        <Avatar name={player.username} accent={accent} />
        <div>
          <div className={styles.name}>
            {player.username}
            {active && <span className={styles.badge}>{turnLabel.toUpperCase()}</span>}
          </div>
          <div className={styles.sub}>
            🏆 {winsLabel(player.winCount)} · {toGo} to go
          </div>
        </div>
        <div className={styles.score}>
          <div className={styles.global}>{player.globalScore}</div>
          <div className={styles.roundLabel}>
            round <b>+{player.roundScore}</b>
          </div>
        </div>
      </header>
      <ProgressBar
        label={`${player.username} progress`}
        banked={player.globalScore}
        round={player.roundScore}
        max={winningScore}
      />
      {footer}
    </section>
  );
}

export function Waiting({ name }: { name: string }) {
  return <p className={styles.waiting}>Waiting for {name}…</p>;
}

/** Footer of the Bot's card while it plays (AC10.7). */
export function BotActivity({ thinking }: { thinking: boolean }) {
  return (
    <p className={styles.waiting} aria-hidden>
      🤖 {thinking ? <span className={styles.thinking}>Bot is thinking</span> : 'Bot plays…'}
    </p>
  );
}
