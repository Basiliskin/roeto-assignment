import { BOT_USERNAME, type GameStateDto, type PlayerStateDto } from '@dice/contracts';
import { useCallback, useEffect, useState } from 'react';
import { announce, announceBotTurn } from '../a11y/announce';
import { DiceTable } from '../components/DiceTable';
import { LiveRegion } from '../components/LiveRegion';
import { NewGameDialog } from '../components/NewGameDialog';
import { BotActivity, PlayerCard, Waiting } from '../components/PlayerCard';
import { TopBar } from '../components/TopBar';
import { TurnActions } from '../components/TurnActions';
import { WinOverlay } from '../components/WinOverlay';
import styles from '../components/Board.module.css';
import { BUST_LOCK_MS, useBustLock } from '../hooks/useBustLock';
import { useBotReplay } from '../hooks/useBotReplay';
import { NewGameInput, useGame } from '../hooks/useGame';
import { useTurnKeys } from '../hooks/useTurnKeys';
import { defaultOpponentFor } from '../seats/defaultOpponent';
import { Session } from '../seats/session';
import { useSeats } from '../seats/SeatContext';

/**
 * Owns server state and interaction state; renders the board from GameStateDto only.
 * During a Bot Turn replay the board shows replay frames instead of the final state (ADR 0003).
 */
export function GameContainer({ session }: { session: Session }) {
  const { logout } = useSeats();
  const { game: serverGame, error, roll, hold, newGame, refresh } = useGame(session);
  const [rollKey, setRollKey] = useState(0);
  const [message, setMessage] = useState('');
  const [newGameOpen, setNewGameOpen] = useState(false);
  const { bust, lock, release } = useBustLock();
  const replay = useBotReplay((final) => {
    setMessage(announceBotTurn(final, BOT_USERNAME));
    refresh();
  });
  const game = replay.frame?.state ?? serverGame;

  const busy = roll.isPending || hold.isPending || newGame.isPending;
  const canAct = game?.status === 'IN_PROGRESS' && !busy && !bust && !replay.frame;
  const current = game?.players.find((p) => p.userId === game.currentPlayerId);

  // Each Bot step animates like a human one: dice toss on a Roll, Bust banner on 6 & 6.
  const { frame, start: startReplay, cancel: cancelReplay } = replay;
  useEffect(() => {
    if (!frame || frame.thinking || frame.step?.kind !== 'ROLL') return;
    setRollKey((k) => k + 1);
    if (frame.step.bust) lock(BOT_USERNAME);
  }, [frame, lock]);

  const act = useCallback(
    (action: 'roll' | 'hold') => {
      if (!canAct || !current) return;
      const mutation = action === 'roll' ? roll : hold;
      mutation.mutate(undefined, {
        onSuccess: (state: GameStateDto) => {
          const humanBust = action === 'roll' && !!state.lastRoll?.bust;
          if (action === 'roll') setRollKey((k) => k + 1);
          if (humanBust) lock(current.username);
          setMessage(announce(action, current.username, state));
          if (game) startReplay(game, state, humanBust ? BUST_LOCK_MS : 0);
        },
      });
    },
    [canAct, current, roll, hold, lock, game, startReplay],
  );
  const onRoll = useCallback(() => act('roll'), [act]);
  const onHold = useCallback(() => act('hold'), [act]);
  useTurnKeys(canAct, onRoll, onHold);

  const startNewGame = (input: NewGameInput) =>
    newGame.mutate(input, {
      onSuccess: () => {
        cancelReplay();
        setNewGameOpen(false);
        setRollKey(0);
        release();
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
    const isBot = player.username === BOT_USERNAME;
    return (
      <PlayerCard
        player={player}
        accent={accent}
        active={active}
        winningScore={game.winningScore}
        footer={
          active && isBot ? (
            <BotActivity thinking={replay.frame?.thinking ?? true} />
          ) : active ? (
            <TurnActions
              disabledReason={bust ? 'Locked — bust!' : busy ? 'Waiting for the server…' : null}
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
        hint={
          replay.frame?.step?.kind === 'HOLD' && !replay.frame.thinking
            ? `🤖 ${BOT_USERNAME} holds and banks the round`
            : replay.frame
              ? `🤖 ${BOT_USERNAME} is playing… (Space to skip)`
              : current
                ? `${current.username}, roll the dice`
                : ''
        }
        bust={bust}
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
        initialVsBot={top.username === BOT_USERNAME}
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
