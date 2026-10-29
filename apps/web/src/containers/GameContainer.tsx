import type { GameStateDto, PlayerStateDto } from '@dice/contracts';
import { useCallback, useState } from 'react';
import { announce } from '../a11y/announce';
import { DiceTable } from '../components/DiceTable';
import { LiveRegion } from '../components/LiveRegion';
import { NewGameDialog } from '../components/NewGameDialog';
import { PlayerCard, Waiting } from '../components/PlayerCard';
import { TopBar } from '../components/TopBar';
import { TurnActions } from '../components/TurnActions';
import { WinOverlay } from '../components/WinOverlay';
import styles from '../components/Board.module.css';
import { NewGameInput, useGame } from '../hooks/useGame';
import { useTurnKeys } from '../hooks/useTurnKeys';
import { defaultOpponentFor } from '../seats/defaultOpponent';
import { Session } from '../seats/session';
import { useSeats } from '../seats/SeatContext';

/** Owns server state and interaction state; renders the board from GameStateDto only. */
export function GameContainer({ session }: { session: Session }) {
  const { logout } = useSeats();
  const { game, error, roll, hold, newGame } = useGame(session);
  const [rollKey, setRollKey] = useState(0);
  const [message, setMessage] = useState('');
  const [newGameOpen, setNewGameOpen] = useState(false);

  const busy = roll.isPending || hold.isPending || newGame.isPending;
  const canAct = game?.status === 'IN_PROGRESS' && !busy;
  const current = game?.players.find((p) => p.userId === game.currentPlayerId);

  const act = useCallback(
    (action: 'roll' | 'hold') => {
      if (!canAct || !current) return;
      const mutation = action === 'roll' ? roll : hold;
      mutation.mutate(undefined, {
        onSuccess: (state: GameStateDto) => {
          if (action === 'roll') setRollKey((k) => k + 1);
          setMessage(announce(action, current.username, state));
        },
      });
    },
    [canAct, current, roll, hold],
  );
  const onRoll = useCallback(() => act('roll'), [act]);
  const onHold = useCallback(() => act('hold'), [act]);
  useTurnKeys(canAct, onRoll, onHold);

  const startNewGame = (input: NewGameInput) =>
    newGame.mutate(input, {
      onSuccess: () => {
        setNewGameOpen(false);
        setRollKey(0);
        setMessage('New game started.');
      },
    });

  if (!game) {
    return (
      <main className={styles.board}>
        <p className={error ? styles.error : undefined} role={error ? 'alert' : undefined}>
          {error ? error.message : 'Loading game…'}
        </p>
      </main>
    );
  }

  const me = session.seats[0].user;
  const bottom = game.players.find((p) => p.userId === me.id) ?? game.players[0];
  const top = game.players.find((p) => p !== bottom) ?? game.players[1];
  const winner = game.players.find((p) => p.userId === game.winnerId) ?? null;
  const actionError = roll.error ?? hold.error;

  const card = (player: PlayerStateDto, accent: 'p1' | 'p2') => {
    const active = player.userId === game.currentPlayerId;
    return (
      <PlayerCard
        player={player}
        accent={accent}
        active={active}
        winningScore={game.winningScore}
        footer={
          active ? (
            <TurnActions
              disabledReason={busy ? 'Waiting for the server…' : null}
              onRoll={onRoll}
              onHold={onHold}
            />
          ) : (
            current && <Waiting name={current.username} />
          )
        }
      />
    );
  };

  return (
    <main className={styles.board}>
      <TopBar
        winningScore={game.winningScore}
        onNewGame={() => setNewGameOpen(true)}
        onLogout={logout}
      />
      {card(top, 'p2')}
      <DiceTable
        lastRoll={game.lastRoll}
        rollKey={rollKey}
        hint={current ? `${current.username}, roll the dice` : ''}
      />
      {card(bottom, 'p1')}
      {actionError && (
        <p className={styles.error} role="alert">
          {actionError.message}
        </p>
      )}

      <NewGameDialog
        open={newGameOpen}
        inProgress={game.status === 'IN_PROGRESS'}
        defaultOpponent={defaultOpponentFor(me.username)}
        initialWinningScore={game.winningScore}
        pending={newGame.isPending}
        error={newGame.error?.message ?? null}
        onStart={startNewGame}
        onClose={() => {
          newGame.reset();
          setNewGameOpen(false);
        }}
      />
      <WinOverlay
        winner={newGameOpen ? null : winner}
        pending={newGame.isPending}
        onPlayAgain={() =>
          startNewGame({ opponentUsername: top.username, winningScore: game.winningScore })
        }
      />
      <LiveRegion message={message} />
    </main>
  );
}
