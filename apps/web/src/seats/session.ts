import type { UserDto } from '@dice/contracts';

export interface Seat {
  token: string;
  user: UserDto;
}

/** The Users logged in on this page (one when playing the Bot) plus the Game they are playing. */
export interface Session {
  seats: [Seat] | [Seat, Seat];
  gameId: string;
}

const KEY = 'dice.session';

export function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null): void {
  try {
    if (session) sessionStorage.setItem(KEY, JSON.stringify(session));
    else sessionStorage.removeItem(KEY);
  } catch {
    // Storage unavailable (private mode): the session just won't survive a refresh.
  }
}
