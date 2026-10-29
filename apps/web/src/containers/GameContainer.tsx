import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Session } from '../seats/session';
import { useSeats } from '../seats/SeatContext';

/** S4 placeholder: proves the session + game fetch work. The board arrives in S5. */
export function GameContainer({ session }: { session: Session }) {
  const { logout } = useSeats();
  const [me] = session.seats;
  const game = useQuery({
    queryKey: ['game', session.gameId],
    queryFn: () => apiClient.getGame(me.token, session.gameId),
  });

  return (
    <main style={{ padding: 'var(--space)' }}>
      <h1>🎲 Dice Table</h1>
      {game.isPending && <p>Loading game…</p>}
      {game.error && <p role="alert">{game.error.message}</p>}
      {game.data && (
        <p>
          {game.data.players.map((p) => p.username).join(' vs ')} — first to{' '}
          {game.data.winningScore}
        </p>
      )}
      <button type="button" onClick={logout}>
        Log out
      </button>
    </main>
  );
}
