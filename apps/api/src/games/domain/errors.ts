import { WINNING_SCORE_MAX, WINNING_SCORE_MIN } from '@dice/contracts';
import { DomainError } from '../../shared/domain-error';

export class InvalidWinningScoreError extends DomainError {
  readonly code = 'INVALID_WINNING_SCORE';

  constructor() {
    super(`Winning Score must be an integer from ${WINNING_SCORE_MIN} to ${WINNING_SCORE_MAX}`);
  }
}

export class SelfPlayError extends DomainError {
  readonly code = 'SELF_PLAY';

  constructor() {
    super('You cannot play against yourself');
  }
}

export class NotAPlayerError extends DomainError {
  readonly code = 'NOT_A_PLAYER';

  constructor() {
    super('You are not a Player in this Game');
  }
}

export class NotYourTurnError extends DomainError {
  readonly code = 'NOT_YOUR_TURN';

  constructor() {
    super('It is not your Turn');
  }
}

export class GameNotInProgressError extends DomainError {
  readonly code = 'GAME_NOT_IN_PROGRESS';

  constructor() {
    super('The Game is not in progress');
  }
}

export class GameNotFoundError extends DomainError {
  readonly code = 'GAME_NOT_FOUND';

  constructor() {
    super('Game not found');
  }
}
