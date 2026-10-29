import { useCallback, useEffect, useRef, useState } from 'react';

export const BUST_LOCK_MS = 1500;

export interface BustLock {
  /** Who busted; `key` changes per bust so the overlay replays its countdown. */
  name: string;
  key: number;
}

/** Locks the board for BUST_LOCK_MS after a 6 & 6 the user just rolled (AC9.1). */
export function useBustLock() {
  const [bust, setBust] = useState<BustLock | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const count = useRef(0);

  const release = useCallback(() => {
    clearTimeout(timer.current);
    setBust(null);
  }, []);

  const lock = useCallback((name: string) => {
    clearTimeout(timer.current);
    count.current += 1;
    setBust({ name, key: count.current });
    timer.current = setTimeout(() => setBust(null), BUST_LOCK_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { bust, lock, release };
}
