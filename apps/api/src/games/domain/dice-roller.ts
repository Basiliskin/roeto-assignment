export type Dice = [number, number];

export const DICE_ROLLER = Symbol('DiceRoller');

/** Port: the only source of randomness. Swapped for a seeded fake in tests. */
export interface DiceRoller {
  roll(): Dice;
}
