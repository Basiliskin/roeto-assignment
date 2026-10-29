import type { GameStateDto, PlayerStateDto } from '@dice/contracts';
import { GameView } from '../application/games.service';

export const toGameStateDto = ({ game, users, botSteps, lastRoll }: GameView): GameStateDto => {
  const [first, second] = game.players.map((player, i): PlayerStateDto => ({
    userId: player.userId,
    username: users[i].username.value,
    globalScore: player.globalScore,
    roundScore: player.roundScore,
    winCount: users[i].winCount,
  }));
  return {
    id: game.id,
    status: game.status,
    winningScore: game.winningScore,
    players: [first, second],
    currentPlayerId: game.currentPlayerId,
    winnerId: game.winnerId,
    lastRoll: lastRoll && { dice: [...lastRoll.dice], bust: lastRoll.bust },
    botSteps,
  };
};
