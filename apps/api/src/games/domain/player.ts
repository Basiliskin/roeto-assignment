/** A User's participation in one Game. Mutated only through the Game aggregate. */
export class Player {
  private global = 0;
  private round = 0;

  constructor(readonly userId: string) {}

  get globalScore(): number {
    return this.global;
  }

  get roundScore(): number {
    return this.round;
  }

  addToRound(points: number): void {
    this.round += points;
  }

  loseRound(): void {
    this.round = 0;
  }

  bankRound(): void {
    this.global += this.round;
    this.round = 0;
  }
}
