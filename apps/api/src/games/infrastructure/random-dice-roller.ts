import { Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { Dice, DiceRoller } from '../domain/dice-roller';

@Injectable()
export class RandomDiceRoller implements DiceRoller {
  roll(): Dice {
    return [randomInt(1, 7), randomInt(1, 7)];
  }
}
