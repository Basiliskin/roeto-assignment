import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import type { GameStateDto } from '@dice/contracts';
import { AuthUser, CurrentUser } from '../../auth/presentation/current-user.decorator';
import { JwtAuthGuard } from '../../auth/infrastructure/jwt-auth.guard';
import { GamesService } from '../application/games.service';
import { CreateGameDto } from './create-game.dto';
import { toGameStateDto } from './to-game-state-dto';

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(private readonly games: GamesService) {}

  @Post()
  async create(
    @CurrentUser() { userId }: AuthUser,
    @Body() { opponentUsername, winningScore }: CreateGameDto,
  ): Promise<GameStateDto> {
    return toGameStateDto(await this.games.create(userId, opponentUsername, winningScore));
  }

  @Get(':id')
  async get(@CurrentUser() { userId }: AuthUser, @Param('id') id: string): Promise<GameStateDto> {
    return toGameStateDto(await this.games.get(userId, id));
  }

  @Post(':id/roll')
  @HttpCode(200)
  async roll(@CurrentUser() { userId }: AuthUser, @Param('id') id: string): Promise<GameStateDto> {
    return toGameStateDto(await this.games.roll(userId, id));
  }

  @Post(':id/hold')
  @HttpCode(200)
  async hold(@CurrentUser() { userId }: AuthUser, @Param('id') id: string): Promise<GameStateDto> {
    return toGameStateDto(await this.games.hold(userId, id));
  }
}
