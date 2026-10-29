import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { GamesService } from './application/games.service';
import { BOT_STRATEGY, HoldAtTwentyStrategy } from './domain/bot-strategy';
import { DICE_ROLLER } from './domain/dice-roller';
import { GAME_REPOSITORY } from './domain/game.repository';
import { InMemoryGameRepository } from './infrastructure/in-memory-game.repository';
import { RandomDiceRoller } from './infrastructure/random-dice-roller';
import { GamesController } from './presentation/games.controller';

@Module({
  imports: [UsersModule],
  controllers: [GamesController],
  providers: [
    GamesService,
    { provide: GAME_REPOSITORY, useClass: InMemoryGameRepository },
    { provide: DICE_ROLLER, useClass: RandomDiceRoller },
    { provide: BOT_STRATEGY, useClass: HoldAtTwentyStrategy },
  ],
})
export class GamesModule {}
