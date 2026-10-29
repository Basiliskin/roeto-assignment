// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BUST_LOCK_MS, useBustLock } from './useBustLock';

describe('useBustLock', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('is unlocked initially', () => {
    const { result } = renderHook(() => useBustLock());
    expect(result.current.bust).toBeNull();
  });

  it('locks with the busting Player and unlocks after 1500ms (AC9.1)', () => {
    const { result } = renderHook(() => useBustLock());
    act(() => result.current.lock('alice'));
    expect(result.current.bust).toEqual({ name: 'alice', key: 1 });

    act(() => vi.advanceTimersByTime(BUST_LOCK_MS - 1));
    expect(result.current.bust).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.bust).toBeNull();
  });

  it('a new lock restarts the timer', () => {
    const { result } = renderHook(() => useBustLock());
    act(() => result.current.lock('alice'));
    act(() => vi.advanceTimersByTime(1000));
    act(() => result.current.lock('bob'));
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.bust).toEqual({ name: 'bob', key: 2 });
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.bust).toBeNull();
  });

  it('release() unlocks immediately', () => {
    const { result } = renderHook(() => useBustLock());
    act(() => result.current.lock('alice'));
    act(() => result.current.release());
    expect(result.current.bust).toBeNull();
  });
});
