import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { geometryCountTemplate } from './geometryCount.js';
import { comb } from './helpers.js';

function findWith(level, predicate, maxIters = 500) {
  for (let i = 0; i < maxIters; i++) {
    const rng = createRng(i * 7 + level * 13);
    const result = geometryCountTemplate.generate(rng, level);
    if (predicate(result.payload)) return result;
  }
  return null;
}

describe('geometryCountTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = geometryCountTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy (square grid): count = N(N+1)(2N+1)/6', () => {
    const result = findWith(1, p => p.N !== undefined);
    const { N, count } = result.payload;
    expect(count).toBe(N * (N + 1) * (2 * N + 1) / 6);
  });
  it('easy (line segment): count = n(n-1)/2', () => {
    const result = findWith(1, p => p.n !== undefined && p.N === undefined);
    const { n, count } = result.payload;
    expect(count).toBe(n * (n - 1) / 2);
  });
  it('medium (triangle): count = C(n,3)', () => {
    const result = findWith(2, p => p.n !== undefined);
    const { n, count } = result.payload;
    expect(count).toBe(comb(n, 3));
  });
  it('hard (rectangle): count = C(m+1,2) * C(n+1,2)', () => {
    const result = findWith(3, p => p.m !== undefined);
    const { m, n, count } = result.payload;
    expect(count).toBe((m * (m + 1) / 2) * (n * (n + 1) / 2));
  });
});
