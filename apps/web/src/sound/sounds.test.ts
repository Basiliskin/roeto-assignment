import { describe, expect, it } from 'vitest';
import { soundFor } from './sounds';

describe('soundFor', () => {
  it('plays roll for a plain Roll and bust for 6 & 6', () => {
    expect(soundFor({ kind: 'ROLL', bust: false })).toBe('roll');
    expect(soundFor({ kind: 'ROLL', bust: true })).toBe('bust');
  });

  it('plays hold for a Hold, nothing for a winning Hold (the Win sound covers it)', () => {
    expect(soundFor({ kind: 'HOLD', won: false })).toBe('hold');
    expect(soundFor({ kind: 'HOLD', won: true })).toBeNull();
  });
});
