import { BOT_USERNAME, type GameStateDto } from '@dice/contracts';
import { apiClient } from '../api/client';
import { Seat, Session } from '../seats/session';

/** Logs in a human opponent on this page (own JWT) and creates a Game as `me`, who starts. The Bot needs no seat. */
export async function startGame(
  me: Seat,
  opponentUsername: string,
  winningScore?: number,
): Promise<{ session: Session; game: GameStateDto }> {
  if (opponentUsername.toLowerCase() === BOT_USERNAME) {
    const game = await apiClient.createGame(me.token, {
      opponentUsername: BOT_USERNAME,
      winningScore,
    });
    return { session: { seats: [me], gameId: game.id }, game };
  }
  const opponent = await apiClient.login({ username: opponentUsername });
  const game = await apiClient.createGame(me.token, {
    opponentUsername: opponent.user.username,
    winningScore,
  });
  const session: Session = {
    seats: [me, { token: opponent.accessToken, user: opponent.user }],
    gameId: game.id,
  };
  return { session, game };
}
