import { HoldAtTwentyStrategy } from './bot-strategy';

describe('HoldAtTwentyStrategy (R12)', () => {
  const strategy = new HoldAtTwentyStrategy();
  const at = (roundScore: number, globalScore = 0, winningScore = 100) =>
    strategy.decide({ roundScore, globalScore, winningScore });

  it('rolls below a Round Score of 20', () => {
    expect(at(0)).toBe('ROLL');
    expect(at(19)).toBe('ROLL');
  });

  it('holds at a Round Score of 20 or more', () => {
    expect(at(20)).toBe('HOLD');
    expect(at(27)).toBe('HOLD');
  });

  it('holds as soon as Holding would Win', () => {
    expect(at(5, 95)).toBe('HOLD');
    expect(at(4, 95)).toBe('ROLL');
  });
});
