import { BOT_USERNAME } from '@dice/contracts';
import { DomainError } from '../../shared/domain-error';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export class InvalidUsernameError extends DomainError {
  readonly code = 'INVALID_USERNAME';

  constructor() {
    super('Username must be 3–20 characters: letters, digits or underscore');
  }
}

export class ReservedUsernameError extends DomainError {
  readonly code = 'RESERVED_USERNAME';

  constructor() {
    super('That username is reserved');
  }
}

/** Value object: trimmed, lowercase, 3–20 chars [a-z0-9_]. Equality is case-insensitive by construction. */
export class Username {
  private constructor(readonly value: string) {}

  static of(raw: string): Username {
    const value = raw.trim().toLowerCase();
    if (!USERNAME_PATTERN.test(value)) throw new InvalidUsernameError();
    return new Username(value);
  }

  /** The system Bot User (R11). */
  get isBot(): boolean {
    return this.value === BOT_USERNAME;
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }
}
