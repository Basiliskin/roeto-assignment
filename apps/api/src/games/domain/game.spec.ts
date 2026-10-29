import { Game } from './game';
import {
  GameNotInProgressError,
  InvalidWinningScoreError,
  NotAPlayerError,
  NotYourTurnError,
  SelfPlayError,
} from './errors';
import { Dice } from './dice-roller';
import { FakeDiceRoller } from '../../../test/fake-dice-roller';

const A = 'alice';
const B = 'bob';
const newGame = (winningScore?: number) =>
  Game.create({ id: 'g1', creatorId: A, opponentId: B, winningScore });

/** Plays one Turn for `userId`: rolls each pair, then holds. */
const turn = (game: Game, userId: string, rolls: Dice[]) => {
  rolls.forEach((dice) => game.roll(userId, dice));
  return game.hold(userId);
};

describe('Game', () => {
  describe('create', () => {
    it('starts in progress, scores 0, creator to move, Winning Score 100 by default (AC2.1)', () => {
      const game = newGame();
      expect(game.status).toBe('IN_PROGRESS');
      expect(game.winningScore).toBe(100);
      expect(game.currentPlayerId).toBe(A);
      expect(game.players.map((p) => [p.userId, p.globalScore, p.roundScore])).toEqual([
        [A, 0, 0],
        [B, 0, 0],
      ]);
      expect(game.winnerId).toBeNull();
      expect(game.lastRoll).toBeNull();
    });

    it('accepts a custom Winning Score (AC2.2)', () => {
      expect(newGame(50).winningScore).toBe(50);
    });

    it.each([9, 1001, 50.5, NaN])('rejects Winning Score %p (AC2.3)', (score) => {
      expect(() => newGame(score)).toThrow(InvalidWinningScoreError);
    });

    it.each([10, 1000])('accepts boundary Winning Score %p', (score) => {
      expect(newGame(score).winningScore).toBe(score);
    });

    it('rejects playing against yourself (AC2.4)', () => {
      expect(() => Game.create({ id: 'g', creatorId: A, opponentId: A })).toThrow(SelfPlayError);
    });
  });

  describe('roll', () => {
    it('adds the dice sum to the Round Score and keeps the Turn (AC3.1, AC4.2)', () => {
      const game = newGame();
      expect(game.roll(A, [3, 4])).toEqual({ bust: false });
      expect(game.player(A).roundScore).toBe(7);
      expect(game.currentPlayerId).toBe(A);
      expect(game.lastRoll).toEqual({ dice: [3, 4], bust: false });
    });

    it('rejects a roll out of Turn and leaves state unchanged (AC3.2)', () => {
      const game = newGame();
      expect(() => game.roll(B, [3, 4])).toThrow(NotYourTurnError);
      expect(game.player(B).roundScore).toBe(0);
      expect(game.lastRoll).toBeNull();
    });

    it('rejects a non-Player (AC3.3)', () => {
      expect(() => newGame().roll('carol', [1, 2])).toThrow(NotAPlayerError);
    });

    it('6 & 6 busts: Round Score 0, Global unchanged, Turn passes (AC4.1)', () => {
      const game = newGame();
      turn(game, A, [[5, 5]]);
      turn(game, B, []);
      game.roll(A, [6, 5]);
      game.roll(A, [2, 2]);
      expect(game.player(A).roundScore).toBe(15);

      expect(game.roll(A, [6, 6])).toEqual({ bust: true });
      expect(game.player(A).roundScore).toBe(0);
      expect(game.player(A).globalScore).toBe(10);
      expect(game.currentPlayerId).toBe(B);
      expect(game.lastRoll).toEqual({ dice: [6, 6], bust: true });
    });

    it('accepts dice from a DiceRoller', () => {
      const game = newGame();
      game.roll(A, new FakeDiceRoller([[2, 5]]).roll());
      expect(game.player(A).roundScore).toBe(7);
    });
  });

  describe('hold', () => {
    it('banks the Round Score and passes the Turn (AC5.1)', () => {
      const game = newGame();
      turn(game, A, [
        [5, 5],
        [5, 5],
        [5, 5],
      ]);
      turn(game, B, []);
      expect(game.player(A).globalScore).toBe(30);
      game.roll(A, [5, 1]);
      game.roll(A, [3, 3]);

      expect(game.hold(A)).toEqual({ won: false });
      expect(game.player(A).globalScore).toBe(42);
      expect(game.player(A).roundScore).toBe(0);
      expect(game.currentPlayerId).toBe(B);
    });

    it('rejects a Hold out of Turn (AC5.2)', () => {
      expect(() => newGame().hold(B)).toThrow(NotYourTurnError);
    });

    it('allows a Hold with Round Score 0 and passes the Turn (AC5.4)', () => {
      const game = newGame();
      expect(game.hold(A)).toEqual({ won: false });
      expect(game.currentPlayerId).toBe(B);
    });
  });

  describe('win', () => {
    const wonGame = () => {
      const game = newGame(100);
      turn(
        game,
        A,
        Array.from({ length: 10 }, () => [5, 4] as Dice),
      );
      turn(game, B, []);
      game.roll(A, [5, 5]);
      return game;
    };

    it('wins on Hold when Global Score reaches Winning Score; no Turn pass (AC6.1)', () => {
      const game = wonGame();
      expect(game.hold(A)).toEqual({ won: true });
      expect(game.status).toBe('WON');
      expect(game.winnerId).toBe(A);
      expect(game.player(A).globalScore).toBe(100);
      expect(game.currentPlayerId).toBeNull();
    });

    it('does not win without a Hold (AC6.2)', () => {
      const game = wonGame();
      expect(game.status).toBe('IN_PROGRESS');
      expect(game.winnerId).toBeNull();
    });

    it('rejects Roll and Hold after a Win (AC3.4, AC5.3, AC6.3)', () => {
      const game = wonGame();
      game.hold(A);
      expect(() => game.roll(A, [1, 2])).toThrow(GameNotInProgressError);
      expect(() => game.hold(B)).toThrow(GameNotInProgressError);
    });
  });

  describe('abandon', () => {
    it('ends an in-progress Game with no winner; further Rolls are rejected (AC7.1, AC7.3)', () => {
      const game = newGame();
      game.abandon();
      expect(game.status).toBe('ABANDONED');
      expect(game.winnerId).toBeNull();
      expect(() => game.roll(A, [1, 2])).toThrow(GameNotInProgressError);
    });

    it('leaves a Won Game as Won', () => {
      const game = newGame(10);
      turn(game, A, [[5, 5]]);
      game.abandon();
      expect(game.status).toBe('WON');
      expect(game.winnerId).toBe(A);
    });
  });
});
