import { BOT_USERNAME, type BotStepDto, type GameStateDto } from '@dice/contracts';

export const THINK_MIN_MS = 600;
export const THINK_MAX_MS = 1200;
/** How long each step stays on screen before the Bot thinks again. */
export const STEP_MS = 900;

export interface ReplayFrame {
  /** What the board shows: the final state with the Bot's scores as of this step. */
  state: GameStateDto;
  /** The step just shown; null before the first one. */
  step: BotStepDto | null;
  thinking: boolean;
}

/** `frame: null` is the end of the replay: show the real state again. */
export interface TimedFrame {
  at: number;
  frame: ReplayFrame | null;
}

export const botIdOf = (state: GameStateDto): string | null =>
  state.players.find((p) => p.username === BOT_USERNAME)?.userId ?? null;

/**
 * Turns the server's Bot steps into timed frames (ADR 0003). Every score shown comes from
 * a step or a server state; nothing is computed here (D2). Any Win is held back to the end.
 */
export function botReplayTimeline(
  before: GameStateDto,
  after: GameStateDto,
  random: () => number = Math.random,
  delayMs = 0,
): TimedFrame[] {
  const botId = botIdOf(after);
  if (!botId || after.botSteps.length === 0) return [];

  const startScores = before.players.find((p) => p.userId === botId)!;
  const frameAt = (
    scores: { roundScore: number; globalScore: number },
    lastRoll: GameStateDto['lastRoll'],
  ): GameStateDto => ({
    ...after,
    status: 'IN_PROGRESS',
    winnerId: null,
    currentPlayerId: botId,
    lastRoll,
    botSteps: [],
    players: after.players.map((p) =>
      p.userId === botId
        ? { ...p, roundScore: scores.roundScore, globalScore: scores.globalScore }
        : p,
    ) as GameStateDto['players'],
  });
  const think = () => THINK_MIN_MS + Math.floor(random() * (THINK_MAX_MS - THINK_MIN_MS));

  let at = delayMs;
  let lastRoll = after.lastRoll;
  let shown = frameAt(startScores, lastRoll);
  let step: BotStepDto | null = null;
  const timeline: TimedFrame[] = [];

  for (const next of after.botSteps) {
    timeline.push({ at, frame: { state: shown, step, thinking: true } });
    at += think();
    if (next.kind === 'ROLL') lastRoll = { dice: next.dice, bust: next.bust };
    step = next;
    shown = frameAt(next, lastRoll);
    timeline.push({ at, frame: { state: shown, step, thinking: false } });
    at += STEP_MS;
  }
  timeline.push({ at, frame: null });
  return timeline;
}
