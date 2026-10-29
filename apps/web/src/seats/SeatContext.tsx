import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { loadSession, saveSession, Session } from './session';

interface SeatContextValue {
  session: Session | null;
  setSession: (session: Session) => void;
  logout: () => void;
}

const SeatContext = createContext<SeatContextValue | null>(null);

export function SeatProvider({ children }: { children: ReactNode }) {
  const [session, setState] = useState<Session | null>(loadSession);

  const update = useCallback((next: Session | null) => {
    saveSession(next);
    setState(next);
  }, []);

  const value = useMemo<SeatContextValue>(
    () => ({ session, setSession: update, logout: () => update(null) }),
    [session, update],
  );

  return <SeatContext.Provider value={value}>{children}</SeatContext.Provider>;
}

export function useSeats(): SeatContextValue {
  const ctx = useContext(SeatContext);
  if (!ctx) throw new Error('useSeats must be used inside SeatProvider');
  return ctx;
}
