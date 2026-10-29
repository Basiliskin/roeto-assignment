import { Dice, DiceRoller } from '../domain/dice-roller';

/** Deterministic DiceRoller for tests: returns the queued rolls in order. */
export class FakeDiceRoller implements DiceRoller {
  constructor(private readonly queue: Dice[] = []) {}

  push(...rolls: Dice[]): void {
    this.queue.push(...rolls);
  }

  roll(): Dice {
    const next = this.queue.shift();
    if (!next) throw new Error('FakeDiceRoller: no rolls queued');
    return next;
  }
}
