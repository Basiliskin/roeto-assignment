export const WINNING_SCORE_DEFAULT = 100;
export const WINNING_SCORE_MIN = 10;
export const WINNING_SCORE_MAX = 1000;

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

/** Full game state; returned by every game endpoint. The UI renders this and nothing else. */
export interface GameStateDto {
  id: string;
  status: GameStatus;
  winningScore: number;
  /** [creator, opponent] — creator starts. */
  players: [PlayerStateDto, PlayerStateDto];
  currentPlayerId: string | null;
  winnerId: string | null;
  lastRoll: LastRollDto | null;
}
