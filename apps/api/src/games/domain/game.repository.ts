import { Game } from './game';

export const GAME_REPOSITORY = Symbol('GameRepository');

export interface GameRepository {
  findById(id: string): Promise<Game | null>;
  findActiveByUserId(userId: string): Promise<Game | null>;
  save(game: Game): Promise<void>;
}
