import { describe, expect, it } from 'vitest';
import { loadMuted, saveMuted } from './mutePreference';

const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
};

describe('mute preference', () => {
  it('defaults to sound on', () => {
    expect(loadMuted(memory())).toBe(false);
  });

  it('remembers the choice', () => {
    const storage = memory();
    saveMuted(true, storage);
    expect(loadMuted(storage)).toBe(true);
    saveMuted(false, storage);
    expect(loadMuted(storage)).toBe(false);
  });

  it('falls back to sound on when storage throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(() => saveMuted(true, broken)).not.toThrow();
    expect(loadMuted(broken)).toBe(false);
  });
});
