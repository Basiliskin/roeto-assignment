import {
  type GameStatus,
  WINNING_SCORE_DEFAULT,
  WINNING_SCORE_MAX,
  WINNING_SCORE_MIN,
} from '@dice/contracts';
import { Dice } from './dice-roller';
import {
  GameNotInProgressError,
  InvalidWinningScoreError,
  NotAPlayerError,
  NotYourTurnError,
  SelfPlayError,
} from './errors';
import { Player } from './player';

const BUST: Dice = [6, 6];

export interface CreateGameProps {
  id: string;
  creatorId: string;
  opponentId: string;
  winningScore?: number;
}

export interface LastRoll {
  dice: Dice;
  bust: boolean;
}

/** Aggregate root: owns every rule of a match. No I/O; callers persist it. */
export class Game {
  private gameStatus: GameStatus = 'IN_PROGRESS';
  private currentIndex = 0;
  private winner: string | null = null;
  private last: LastRoll | null = null;

  private constructor(
    readonly id: string,
    readonly players: readonly [Player, Player],
    readonly winningScore: number,
  ) {}

  static create({
    id,
    creatorId,
    opponentId,
    winningScore = WINNING_SCORE_DEFAULT,
  }: CreateGameProps): Game {
    if (creatorId === opponentId) throw new SelfPlayError();
    if (
      !Number.isInteger(winningScore) ||
      winningScore < WINNING_SCORE_MIN ||
      winningScore > WINNING_SCORE_MAX
    ) {
      throw new InvalidWinningScoreError();
    }
    return new Game(id, [new Player(creatorId), new Player(opponentId)], winningScore);
  }

  get status(): GameStatus {
    return this.gameStatus;
  }

  get currentPlayerId(): string | null {
    return this.gameStatus === 'IN_PROGRESS' ? this.players[this.currentIndex].userId : null;
  }

  get winnerId(): string | null {
    return this.winner;
  }

  get lastRoll(): LastRoll | null {
    return this.last;
  }

  hasPlayer(userId: string): boolean {
    return this.players.some((p) => p.userId === userId);
  }

  player(userId: string): Player {
    const found = this.players.find((p) => p.userId === userId);
    if (!found) throw new NotAPlayerError();
    return found;
  }

  roll(userId: string, dice: Dice): { bust: boolean } {
    const player = this.assertCanAct(userId);
    const bust = dice[0] === BUST[0] && dice[1] === BUST[1];
    this.last = { dice: [dice[0], dice[1]], bust };
    if (bust) {
      player.loseRound();
      this.passTurn();
    } else {
      player.addToRound(dice[0] + dice[1]);
    }
    return { bust };
  }

  hold(userId: string): { won: boolean } {
    const player = this.assertCanAct(userId);
    player.bankRound();
    if (player.globalScore >= this.winningScore) {
      this.gameStatus = 'WON';
      this.winner = userId;
      return { won: true };
    }
    this.passTurn();
    return { won: false };
  }

  abandon(): void {
    if (this.gameStatus === 'IN_PROGRESS') this.gameStatus = 'ABANDONED';
  }

  private assertCanAct(userId: string): Player {
    const player = this.player(userId);
    if (this.gameStatus !== 'IN_PROGRESS') throw new GameNotInProgressError();
    if (this.currentPlayerId !== userId) throw new NotYourTurnError();
    return player;
  }

  private passTurn(): void {
    this.currentIndex = 1 - this.currentIndex;
  }
}
