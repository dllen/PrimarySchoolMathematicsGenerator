import { describe, it, expect } from 'vitest';
import { createRng } from './rng.js';

describe('createRng', () => {
  it('produces same sequence with same seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a.int(1, 100), a.int(1, 100), a.int(1, 100)])
      .toEqual([b.int(1, 100), b.int(1, 100), b.int(1, 100)]);
  });

  it('int(min, max) returns values within bounds', () => {
    const rng = createRng(1);
    for (let i = 0; i < 100; i++) {
      const v = rng.int(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('pick(arr) returns an element of the array', () => {
    const rng = createRng(7);
    const arr = ['a', 'b', 'c', 'd'];
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(rng.pick(arr));
    }
  });

  it('different seeds yield different sequences (probabilistic)', () => {
    const a = createRng(1);
    const b = createRng(2);
    const seqA = Array.from({ length: 20 }, () => a.int(0, 1000));
    const seqB = Array.from({ length: 20 }, () => b.int(0, 1000));
    expect(seqA).not.toEqual(seqB);
  });
});