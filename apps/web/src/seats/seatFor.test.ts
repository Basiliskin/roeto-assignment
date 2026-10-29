import type { UserDto } from '@dice/contracts';
import { describe, expect, it } from 'vitest';
import { seatFor } from './seatFor';
import { Session } from './session';

const user = (id: string): UserDto => ({ id, username: id, winCount: 0 });
const session: Session = {
  seats: [
    { token: 'ta', user: user('a') },
    { token: 'tb', user: user('b') },
  ],
  gameId: 'g1',
};

describe('seatFor', () => {
  it('returns the seat of the given user', () => {
    expect(seatFor(session, 'b')?.token).toBe('tb');
  });

  it.each([null, 'stranger'])('returns undefined for %p', (userId) => {
    expect(seatFor(session, userId)).toBeUndefined();
  });
});
