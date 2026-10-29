import type { GameStateDto } from '@dice/contracts';

const nameOf = (state: GameStateDto, userId: string | null) =>
  state.players.find((p) => p.userId === userId)?.username ?? '';

/** Screen-reader text for the result of an action, read straight from the returned state. */
export function announce(action: 'roll' | 'hold', actor: string, state: GameStateDto): string {
  const actorPlayer = state.players.find((p) => p.username === actor);
  if (state.status === 'WON') return `${actor} wins with ${actorPlayer?.globalScore ?? 0}!`;

  const next = `${nameOf(state, state.currentPlayerId)} to roll.`;
  if (action === 'hold') return `${actor} held at ${actorPlayer?.globalScore ?? 0}. ${next}`;

  const roll = state.lastRoll;
  if (!roll) return '';
  const [a, b] = roll.dice;
  return roll.bust
    ? `${actor} rolled ${a} and ${b} — bust! Round lost. ${next}`
    : `${actor} rolled ${a} and ${b}, plus ${a + b}.`;
}
