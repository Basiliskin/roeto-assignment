import { apiClient } from '../api/client';
import { Seat, Session } from '../seats/session';

/** Logs in the opponent on this page (own JWT) and creates a Game as `me`, who starts. */
export async function startGame(
  me: Seat,
  opponentUsername: string,
  winningScore?: number,
): Promise<Session> {
  const opponent = await apiClient.login({ username: opponentUsername });
  const game = await apiClient.createGame(me.token, {
    opponentUsername: opponent.user.username,
    winningScore,
  });
  return { seats: [me, { token: opponent.accessToken, user: opponent.user }], gameId: game.id };
}
