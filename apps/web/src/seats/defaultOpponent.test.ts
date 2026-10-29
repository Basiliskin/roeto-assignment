import { describe, expect, it } from 'vitest';
import { defaultOpponentFor } from './defaultOpponent';

describe('defaultOpponentFor', () => {
  it('is player2 for anyone else', () => {
    expect(defaultOpponentFor('alice')).toBe('player2');
  });

  it.each(['player2', ' Player2 '])('is player1 when you are %p', (username) => {
    expect(defaultOpponentFor(username)).toBe('player1');
  });
});
