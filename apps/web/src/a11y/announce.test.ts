import type { GameStateDto, PlayerStateDto } from '@dice/contracts';
import { describe, expect, it } from 'vitest';
import { announce, announceBotTurn } from './announce';

const player = (userId: string, globalScore = 0): PlayerStateDto => ({
  userId,
  username: userId,
  globalScore,
  roundScore: 0,
  winCount: 0,
});
const state = (over: Partial<GameStateDto>): GameStateDto => ({
  id: 'g1',
  status: 'IN_PROGRESS',
  winningScore: 100,
  players: [player('alice', 42), player('bob')],
  currentPlayerId: 'alice',
  winnerId: null,
  lastRoll: null,
  botSteps: [],
  ...over,
});

describe('announce', () => {
  it('describes a scoring roll', () => {
    const s = state({ lastRoll: { dice: [3, 4], bust: false } });
    expect(announce('roll', 'alice', s)).toBe('alice rolled 3 and 4, plus 7.');
  });

  it('describes a bust', () => {
    const s = state({ lastRoll: { dice: [6, 6], bust: true }, currentPlayerId: 'bob' });
    expect(announce('roll', 'alice', s)).toBe(
      'alice rolled 6 and 6 — bust! Round lost. bob to roll.',
    );
  });

  it('describes a hold', () => {
    const s = state({ currentPlayerId: 'bob' });
    expect(announce('hold', 'alice', s)).toBe('alice held at 42. bob to roll.');
  });

  it('describes a win', () => {
    const s = state({ status: 'WON', winnerId: 'alice', currentPlayerId: null });
    expect(announce('hold', 'alice', s)).toBe('alice wins with 42!');
  });

  it('describes the end of a Bot Turn', () => {
    const s = state({ players: [player('alice', 42), player('bot', 23)] });
    expect(announceBotTurn(s, 'bot')).toBe('bot is at 23. alice to roll.');
    const won = state({ status: 'WON', players: [player('alice'), player('bot', 100)] });
    expect(announceBotTurn(won, 'bot')).toBe('bot wins with 100!');
  });
});
