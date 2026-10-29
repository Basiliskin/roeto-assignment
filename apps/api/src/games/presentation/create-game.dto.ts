import { WINNING_SCORE_MAX, WINNING_SCORE_MIN, type CreateGameRequest } from '@dice/contracts';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateGameDto implements CreateGameRequest {
  @IsString()
  opponentUsername: string;

  @IsOptional()
  @IsInt()
  @Min(WINNING_SCORE_MIN)
  @Max(WINNING_SCORE_MAX)
  winningScore?: number;
}
