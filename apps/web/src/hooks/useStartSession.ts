import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { defaultOpponentFor } from '../seats/defaultOpponent';
import { useSeats } from '../seats/SeatContext';
import { startGame } from './startGame';

/** Login flow (AC1.6): log in, then a default Game vs the default opponent. */
export function useStartSession() {
  const { setSession } = useSeats();

  return useMutation({
    mutationFn: async (username: string) => {
      const me = await apiClient.login({ username });
      return startGame(
        { token: me.accessToken, user: me.user },
        defaultOpponentFor(me.user.username),
      );
    },
    onSuccess: setSession,
  });
}
