import type { PlayerStateDto } from '@dice/contracts';
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
  return (
    <section
      className={`${ui.glass} ${styles.card} ${styles[accent]} ${active ? styles.active : styles.idle}`}
      aria-label={active ? `${player.username}, your turn` : player.username}
    >
      <header className={styles.head}>
        <Avatar name={player.username} accent={accent} />
        <div>
          <div className={styles.name}>
            {player.username}
            {active && <span className={styles.badge}>YOUR TURN</span>}
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
