import type { GameStateDto } from '@dice/contracts';

const nameOf = (state: GameStateDto, userId: string | null) =>
  state.players.find((p) => p.userId === userId)?.username ?? '';

/** Screen-reader text once a Bot Turn has been replayed, read from the final state. */
export function announceBotTurn(state: GameStateDto, botName: string): string {
  const bot = state.players.find((p) => p.username === botName);
  if (state.status === 'WON') return `${botName} wins with ${bot?.globalScore ?? 0}!`;
  return `${botName} is at ${bot?.globalScore ?? 0}. ${nameOf(state, state.currentPlayerId)} to roll.`;
}

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
