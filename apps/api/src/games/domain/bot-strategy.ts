export const BOT_STRATEGY = Symbol('BotStrategy');

export interface BotView {
  roundScore: number;
  globalScore: number;
  winningScore: number;
}

/** Port: how a Bot chooses between Roll and Hold during its Turn. */
export interface BotStrategy {
  decide(view: BotView): 'ROLL' | 'HOLD';
}

const HOLD_AT = 20;

/** R12: Hold at a Round Score of 20, or as soon as Holding would Win. */
export class HoldAtTwentyStrategy implements BotStrategy {
  decide({ roundScore, globalScore, winningScore }: BotView): 'ROLL' | 'HOLD' {
    if (roundScore >= HOLD_AT || globalScore + roundScore >= winningScore) return 'HOLD';
    return 'ROLL';
  }
}
