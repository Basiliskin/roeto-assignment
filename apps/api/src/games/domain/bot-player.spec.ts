import { FakeDiceRoller } from '../../../test/fake-dice-roller';
import { HoldAtTwentyStrategy } from './bot-strategy';
import { playBotTurn } from './bot-player';
import { Game } from './game';

const HUMAN = 'alice';
const BOT = 'bot-id';

/** A Game where the human has just Held with nothing, so it's the Bot's Turn. */
const botToMove = (winningScore = 100) => {
  const game = Game.create({ id: 'g1', creatorId: HUMAN, opponentId: BOT, winningScore });
  game.hold(HUMAN);
  return game;
};

const play = (game: Game, ...rolls: [number, number][]) =>
  playBotTurn(game, BOT, new HoldAtTwentyStrategy(), new FakeDiceRoller(rolls));

describe('playBotTurn (AC10.4)', () => {
  it('rolls until the Round Score reaches 20, then holds and passes the Turn', () => {
    const game = botToMove();
    const steps = play(game, [5, 5], [4, 4], [3, 2]);

    expect(steps).toEqual([
      { kind: 'ROLL', dice: [5, 5], bust: false, roundScore: 10, globalScore: 0 },
      { kind: 'ROLL', dice: [4, 4], bust: false, roundScore: 18, globalScore: 0 },
      { kind: 'ROLL', dice: [3, 2], bust: false, roundScore: 23, globalScore: 0 },
      { kind: 'HOLD', won: false, roundScore: 0, globalScore: 23 },
    ]);
    expect(game.currentPlayerId).toBe(HUMAN);
    expect(game.player(BOT).globalScore).toBe(23);
  });

  it('stops on 6 & 6: Round Score lost, Turn passes', () => {
    const game = botToMove();
    const steps = play(game, [3, 4], [6, 6]);

    expect(steps).toEqual([
      { kind: 'ROLL', dice: [3, 4], bust: false, roundScore: 7, globalScore: 0 },
      { kind: 'ROLL', dice: [6, 6], bust: true, roundScore: 0, globalScore: 0 },
    ]);
    expect(game.currentPlayerId).toBe(HUMAN);
  });

  it('holds early when Holding would Win, and the Game is Won', () => {
    const game = botToMove(10);
    const steps = play(game, [5, 6]);

    expect(steps.at(-1)).toEqual({ kind: 'HOLD', won: true, roundScore: 0, globalScore: 11 });
    expect(game.status).toBe('WON');
    expect(game.winnerId).toBe(BOT);
  });

  it("does nothing when it is not the Bot's Turn", () => {
    const game = Game.create({ id: 'g1', creatorId: HUMAN, opponentId: BOT });
    expect(play(game)).toEqual([]);
  });
});
