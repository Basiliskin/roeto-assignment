import type { BotStepDto, GameStateDto, PlayerStateDto } from '@dice/contracts';
import { describe, expect, it } from 'vitest';
import { STEP_MS, THINK_MAX_MS, THINK_MIN_MS, botReplayTimeline } from './botReplay';

const player = (userId: string, globalScore = 0, roundScore = 0): PlayerStateDto => ({
  userId,
  username: userId,
  globalScore,
  roundScore,
  winCount: 0,
});

const state = (over: Partial<GameStateDto>): GameStateDto => ({
  id: 'g1',
  status: 'IN_PROGRESS',
  winningScore: 100,
  players: [player('alice'), player('bot')],
  currentPlayerId: 'alice',
  winnerId: null,
  lastRoll: null,
  botSteps: [],
  ...over,
});

const steps: BotStepDto[] = [
  { kind: 'ROLL', dice: [5, 6], bust: false, roundScore: 11, globalScore: 30 },
  { kind: 'HOLD', won: true, roundScore: 0, globalScore: 41 },
];

const before = state({ players: [player('alice', 5, 5), player('bot', 30)] });
const after = state({
  status: 'WON',
  winnerId: 'bot',
  currentPlayerId: null,
  players: [player('alice', 10), player('bot', 41)],
  lastRoll: { dice: [2, 3], bust: false },
  botSteps: steps,
});

describe('botReplayTimeline (AC10.7, AC10.9)', () => {
  const timeline = botReplayTimeline(before, after, () => 0);

  it('thinks, then shows each step, then ends with no frame', () => {
    expect(timeline.map((t) => [t.frame?.thinking ?? null, t.frame?.step?.kind ?? null])).toEqual([
      [true, null],
      [false, 'ROLL'],
      [true, 'ROLL'],
      [false, 'HOLD'],
      [null, null],
    ]);
  });

  it('paces thinking between 600 and 1200 ms and holds each step for STEP_MS', () => {
    expect(timeline.map((t) => t.at)).toEqual([
      0,
      THINK_MIN_MS,
      THINK_MIN_MS + STEP_MS,
      2 * THINK_MIN_MS + STEP_MS,
      2 * THINK_MIN_MS + 2 * STEP_MS,
    ]);
    const slow = botReplayTimeline(before, after, () => 0.999);
    expect(slow[1].at).toBeLessThanOrEqual(THINK_MAX_MS);
  });

  it('shows server scores only and hides the Win until the end', () => {
    const [start, rolled, , held] = timeline.slice(0, -1).map((t) => t.frame!.state);
    expect(start.players[1]).toMatchObject({ globalScore: 30, roundScore: 0 });
    expect(start.lastRoll).toEqual({ dice: [2, 3], bust: false });
    expect(rolled.players[1]).toMatchObject({ globalScore: 30, roundScore: 11 });
    expect(rolled.lastRoll).toEqual({ dice: [5, 6], bust: false });
    expect(held.players[1]).toMatchObject({ globalScore: 41, roundScore: 0 });
    for (const frame of [start, rolled, held]) {
      expect(frame).toMatchObject({
        status: 'IN_PROGRESS',
        winnerId: null,
        currentPlayerId: 'bot',
      });
      expect(frame.players[0]).toEqual(after.players[0]);
    }
  });

  it('can start after a delay (e.g. the human Bust lock)', () => {
    expect(botReplayTimeline(before, after, () => 0, 1500)[0].at).toBe(1500);
  });
});
