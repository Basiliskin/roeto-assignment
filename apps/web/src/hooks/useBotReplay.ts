import type { GameStateDto } from '@dice/contracts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { botReplayTimeline, ReplayFrame } from './botReplay';

/** Plays a Bot Turn step by step (AC10.7); Space or a click skips to the end (AC10.8). */
export function useBotReplay(onDone: (final: GameStateDto) => void) {
  const [frame, setFrame] = useState<ReplayFrame | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const final = useRef<GameStateDto | null>(null);
  const done = useRef(onDone);
  done.current = onDone;

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const finish = useCallback(() => {
    clear();
    setFrame(null);
    if (final.current) done.current(final.current);
    final.current = null;
  }, []);

  /** Stops without reporting (e.g. a New Game replaced this one). */
  const cancel = useCallback(() => {
    clear();
    final.current = null;
    setFrame(null);
  }, []);

  const start = useCallback(
    (before: GameStateDto, after: GameStateDto, delayMs = 0) => {
      const timeline = botReplayTimeline(before, after, Math.random, delayMs);
      if (timeline.length === 0) return;
      clear();
      final.current = after;
      setFrame(timeline[0].frame);
      timers.current = timeline
        .slice(1)
        .map(({ at, frame: next }) => setTimeout(() => (next ? setFrame(next) : finish()), at));
    },
    [finish],
  );

  const replaying = frame !== null;
  useEffect(() => {
    if (!replaying) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ') return;
      event.preventDefault();
      finish();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', finish);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', finish);
    };
  }, [replaying, finish]);

  useEffect(() => clear, []);

  return { frame, start, skip: finish, cancel };
}
