import { describe, expect, it } from 'vitest';
import { winsLabel } from './winsLabel';

describe('winsLabel', () => {
  it.each([
    [0, '0 wins'],
    [1, '1 win'],
    [2, '2 wins'],
  ])('%i → %s', (n, label) => {
    expect(winsLabel(n)).toBe(label);
  });
});
