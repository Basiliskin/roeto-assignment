import { Username } from './username';

export class User {
  private constructor(
    readonly id: string,
    readonly username: Username,
    private wins: number,
  ) {}

  static create(id: string, username: Username): User {
    return new User(id, username, 0);
  }

  get winCount(): number {
    return this.wins;
  }

  recordWin(): void {
    this.wins += 1;
  }
}
