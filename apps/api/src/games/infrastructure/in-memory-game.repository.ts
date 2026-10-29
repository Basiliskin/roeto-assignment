import { Injectable } from '@nestjs/common';
import { Game } from '../domain/game';
import { GameRepository } from '../domain/game.repository';

@Injectable()
export class InMemoryGameRepository implements GameRepository {
  private readonly games = new Map<string, Game>();

  async findById(id: string): Promise<Game | null> {
    return this.games.get(id) ?? null;
  }

  async findActiveByUserId(userId: string): Promise<Game | null> {
    return (
      [...this.games.values()].find((g) => g.status === 'IN_PROGRESS' && g.hasPlayer(userId)) ??
      null
    );
  }

  async save(game: Game): Promise<void> {
    this.games.set(game.id, game);
  }
}
