import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UsersService } from '../../users/application/users.service';
import { User } from '../../users/domain/user';
import { DICE_ROLLER, DiceRoller } from '../domain/dice-roller';
import { GameNotFoundError, NotAPlayerError } from '../domain/errors';
import { Game } from '../domain/game';
import { GAME_REPOSITORY, GameRepository } from '../domain/game.repository';

/** A Game plus its two Users (for usernames and Win Counts), in Player order. */
export interface GameView {
  game: Game;
  users: [User, User];
}

@Injectable()
export class GamesService {
  constructor(
    @Inject(GAME_REPOSITORY) private readonly games: GameRepository,
    @Inject(DICE_ROLLER) private readonly dice: DiceRoller,
    private readonly users: UsersService,
  ) {}

  /** Starts a new Game; any active Game of either User is Abandoned first. */
  async create(
    creatorId: string,
    opponentUsername: string,
    winningScore?: number,
  ): Promise<GameView> {
    const opponent = await this.users.findOrCreate(opponentUsername);
    const game = Game.create({
      id: randomUUID(),
      creatorId,
      opponentId: opponent.id,
      winningScore,
    });
    await this.abandonActiveGame(creatorId);
    await this.abandonActiveGame(opponent.id);
    await this.games.save(game);
    return this.view(game);
  }

  async get(userId: string, gameId: string): Promise<GameView> {
    const game = await this.load(gameId);
    if (!game.hasPlayer(userId)) throw new NotAPlayerError();
    return this.view(game);
  }

  async roll(userId: string, gameId: string): Promise<GameView> {
    const game = await this.load(gameId);
    game.roll(userId, this.dice.roll());
    await this.games.save(game);
    return this.view(game);
  }

  async hold(userId: string, gameId: string): Promise<GameView> {
    const game = await this.load(gameId);
    const { won } = game.hold(userId);
    await this.games.save(game);
    if (won) await this.users.recordWin(userId);
    return this.view(game);
  }

  private async abandonActiveGame(userId: string): Promise<void> {
    const active = await this.games.findActiveByUserId(userId);
    if (!active) return;
    active.abandon();
    await this.games.save(active);
  }

  private async load(gameId: string): Promise<Game> {
    const game = await this.games.findById(gameId);
    if (!game) throw new GameNotFoundError();
    return game;
  }

  private async view(game: Game): Promise<GameView> {
    const [first, second] = await Promise.all(
      game.players.map((p) => this.users.getById(p.userId)),
    );
    return { game, users: [first, second] };
  }
}
