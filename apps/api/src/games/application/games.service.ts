import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UsersService } from '../../users/application/users.service';
import { User } from '../../users/domain/user';
import { BotStep, playBotTurn } from '../domain/bot-player';
import { BOT_STRATEGY, BotStrategy } from '../domain/bot-strategy';
import { DICE_ROLLER, DiceRoller } from '../domain/dice-roller';
import { GameNotFoundError, NotAPlayerError } from '../domain/errors';
import { Game } from '../domain/game';
import { GAME_REPOSITORY, GameRepository } from '../domain/game.repository';

/** A Game plus its two Users (for usernames and Win Counts), in Player order, and any Bot Turn just played. */
export interface GameView {
  game: Game;
  users: [User, User];
  botSteps: BotStep[];
  /** The last Roll before `botSteps`, so the human's own Bust is still reported. */
  lastRoll: Game['lastRoll'];
}

@Injectable()
export class GamesService {
  constructor(
    @Inject(GAME_REPOSITORY) private readonly games: GameRepository,
    @Inject(DICE_ROLLER) private readonly dice: DiceRoller,
    @Inject(BOT_STRATEGY) private readonly strategy: BotStrategy,
    private readonly users: UsersService,
  ) {}

  /** Starts a new Game; any active Game of either User is Abandoned first (the Bot is exempt, R11). */
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
    if (!this.isBot(opponent)) await this.abandonActiveGame(opponent.id);
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
    return this.saveAfterHumanTurn(game);
  }

  async hold(userId: string, gameId: string): Promise<GameView> {
    const game = await this.load(gameId);
    const { won } = game.hold(userId);
    if (won) await this.users.recordWin(userId);
    return this.saveAfterHumanTurn(game);
  }

  /** If the Turn passed to the Bot, it plays its whole Turn now (ADR 0003); then saves once. */
  private async saveAfterHumanTurn(game: Game): Promise<GameView> {
    const bot = (await this.view(game)).users.find((u) => this.isBot(u));
    const lastRoll = game.lastRoll;
    const botSteps =
      bot && game.currentPlayerId === bot.id
        ? playBotTurn(game, bot.id, this.strategy, this.dice)
        : [];
    if (bot && game.winnerId === bot.id) await this.users.recordWin(bot.id);
    await this.games.save(game);
    return { ...(await this.view(game, botSteps)), lastRoll };
  }

  private isBot(user: User): boolean {
    return user.username.isBot;
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

  private async view(game: Game, botSteps: BotStep[] = []): Promise<GameView> {
    const [first, second] = await Promise.all(
      game.players.map((p) => this.users.getById(p.userId)),
    );
    return { game, users: [first, second], botSteps, lastRoll: game.lastRoll };
  }
}
