import type { BotStepDto } from '@dice/contracts';
import { BotStrategy } from './bot-strategy';
import { DiceRoller } from './dice-roller';
import { Game } from './game';

export type BotStep = BotStepDto;

/**
 * Domain service: plays the Bot's whole Turn through the Game's own roll/hold,
 * so every invariant still applies. Returns the steps for the UI to replay (ADR 0003).
 */
export function playBotTurn(
  game: Game,
  botId: string,
  strategy: BotStrategy,
  dice: DiceRoller,
): BotStep[] {
  const steps: BotStep[] = [];
  const bot = game.player(botId);
  const scores = () => ({ roundScore: bot.roundScore, globalScore: bot.globalScore });

  while (game.currentPlayerId === botId) {
    const view = { ...scores(), winningScore: game.winningScore };
    if (strategy.decide(view) === 'HOLD') {
      const { won } = game.hold(botId);
      steps.push({ kind: 'HOLD', won, ...scores() });
    } else {
      const roll = dice.roll();
      const { bust } = game.roll(botId, roll);
      steps.push({ kind: 'ROLL', dice: [roll[0], roll[1]], bust, ...scores() });
    }
  }
  return steps;
}
