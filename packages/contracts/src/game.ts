export const WINNING_SCORE_DEFAULT = 100;
export const WINNING_SCORE_MIN = 10;
export const WINNING_SCORE_MAX = 1000;

/** The system User that plays as the Bot opponent (R11). Nobody can log in as it. */
export const BOT_USERNAME = 'bot';

export type GameStatus = 'IN_PROGRESS' | 'WON' | 'ABANDONED';

export interface CreateGameRequest {
  opponentUsername: string;
  winningScore?: number;
}

export interface PlayerStateDto {
  userId: string;
  username: string;
  globalScore: number;
  roundScore: number;
  winCount: number;
}

export interface LastRollDto {
  dice: [number, number];
  bust: boolean;
}

/** The Bot Player's scores right after a step, so the UI can replay without computing them (D2). */
interface BotStepScores {
  roundScore: number;
  globalScore: number;
}

export type BotStepDto =
  | ({ kind: 'ROLL'; dice: [number, number]; bust: boolean } & BotStepScores)
  | ({ kind: 'HOLD'; won: boolean } & BotStepScores);

/** Full game state; returned by every game endpoint. The UI renders this and nothing else. */
export interface GameStateDto {
  id: string;
  status: GameStatus;
  winningScore: number;
  /** [creator, opponent] — creator starts. */
  players: [PlayerStateDto, PlayerStateDto];
  currentPlayerId: string | null;
  winnerId: string | null;
  /** When `botSteps` is non-empty: the last Roll before the Bot Turn (the Bot's dice are in its steps). */
  lastRoll: LastRollDto | null;
  /** The Bot Turn played inside this request, in order (ADR 0003); empty otherwise. */
  botSteps: BotStepDto[];
}
