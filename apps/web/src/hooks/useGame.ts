import type { GameStateDto } from '@dice/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { defaultOpponentFor } from '../seats/defaultOpponent';
import { seatFor } from '../seats/seatFor';
import { Session } from '../seats/session';
import { useSeats } from '../seats/SeatContext';
import { startGame } from './startGame';

export interface NewGameInput {
  opponentUsername: string;
  winningScore: number;
}

const gameKey = (id: string) => ['game', id] as const;

/** Server state for the current Game. Every mutation response replaces the cached state. */
export function useGame(session: Session) {
  const queryClient = useQueryClient();
  const { setSession } = useSeats();
  const [me] = session.seats;
  const key = gameKey(session.gameId);

  const query = useQuery({
    queryKey: key,
    queryFn: () => apiClient.getGame(me.token, session.gameId),
  });

  const cache = (state: GameStateDto) => queryClient.setQueryData(gameKey(state.id), state);

  /** Roll/Hold act with the token of whichever seat the API says is to move. */
  const useTurnAction = (action: 'roll' | 'hold') =>
    useMutation({
      mutationFn: () => {
        const current = queryClient.getQueryData<GameStateDto>(key)?.currentPlayerId ?? null;
        const seat = seatFor(session, current);
        if (!seat) throw new Error('No Player to move');
        return apiClient[action](seat.token, session.gameId);
      },
      onSuccess: cache,
    });

  const roll = useTurnAction('roll');
  const hold = useTurnAction('hold');

  const newGame = useMutation({
    mutationFn: ({ opponentUsername, winningScore }: NewGameInput) =>
      startGame(me, opponentUsername.trim() || defaultOpponentFor(me.user.username), winningScore),
    onSuccess: ({ session: next, game }) => {
      cache(game);
      setSession(next);
    },
  });

  return { game: query.data, error: query.error, roll, hold, newGame };
}
