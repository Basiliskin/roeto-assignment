import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { defaultOpponentFor } from '../seats/defaultOpponent';
import { useSeats } from '../seats/SeatContext';

/** Login flow (AC1.6): log in, log in the default opponent, create the default Game. */
export function useStartSession() {
  const { setSession } = useSeats();

  return useMutation({
    mutationFn: async (username: string) => {
      const me = await apiClient.login({ username });
      const opponent = await apiClient.login({ username: defaultOpponentFor(me.user.username) });
      const game = await apiClient.createGame(me.accessToken, {
        opponentUsername: opponent.user.username,
      });
      return {
        seats: [
          { token: me.accessToken, user: me.user },
          { token: opponent.accessToken, user: opponent.user },
        ] as const,
        gameId: game.id,
      };
    },
    onSuccess: ({ seats, gameId }) => setSession({ seats: [seats[0], seats[1]], gameId }),
  });
}
