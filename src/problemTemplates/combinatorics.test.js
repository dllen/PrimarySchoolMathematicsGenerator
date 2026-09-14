import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { combinatoricsTemplate } from './combinatorics.js';
import { perm, comb } from './helpers.js';

function findWith(level, predicate, maxIters = 500) {
  for (let i = 0; i < maxIters; i++) {
    const rng = createRng(i * 7 + level * 13);
    const result = combinatoricsTemplate.generate(rng, level);
    if (predicate(result.payload)) return result;
  }
  return null;
}

describe('combinatoricsTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = combinatoricsTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy (multiplication): total = a * b * c', () => {
    const result = findWith(1, p => p.a !== undefined && p.c !== undefined);
    const { a, b, c, total } = result.payload;
    expect(total).toBe(a * b * c);
  });
  it('easy (addition): total = a + b', () => {
    const result = findWith(1, p => p.a !== undefined && p.c === undefined);
    const { a, b, total } = result.payload;
    expect(total).toBe(a + b);
  });
  it('medium: total matches either perm(n,r) or comb(n,r)', () => {
    // Both medium subtemplates share the same payload shape, so assert the
    // generated total equals one of the two legitimate formulas.
    const result = findWith(2, p => p.n !== undefined && p.r !== undefined);
    const { n, r, total } = result.payload;
    expect([perm(n, r), comb(n, r)]).toContain(total);
  });
  it('hard: all payload values <= 1000 where applicable', () => {
    const rng = createRng(3);
    for (let i = 0; i < 30; i++) {
      const result = combinatoricsTemplate.generate(rng, 3);
      for (const [k, v] of Object.entries(result.payload)) {
        if (typeof v === 'number') {
          expect(v, `${k}=${v}`).toBeLessThanOrEqual(1000);
        }
      }
    }
  });
});
