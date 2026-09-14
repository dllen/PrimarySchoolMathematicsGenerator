import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { probabilityTemplate } from './probability.js';

function findWith(level, predicate, maxIters = 500) {
  for (let i = 0; i < maxIters; i++) {
    const rng = createRng(i * 7 + level * 13);
    const result = probabilityTemplate.generate(rng, level);
    if (predicate(result.payload)) return result;
  }
  return null;
}

describe('probabilityTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: denominator <= 100`, () => {
      const rng = createRng(band);
      const result = probabilityTemplate.generate(rng, level);
      expect(result.payload.denominator).toBeLessThanOrEqual(100);
    });
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = probabilityTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy: probability is 1/2 or 1/6', () => {
    const result = findWith(1, p => p.denominator !== undefined);
    expect([2, 6]).toContain(result.payload.denominator);
  });
  it('medium (compare): probA + probB = 1', () => {
    const result = findWith(2, p => p.probA !== undefined && p.probB !== undefined);
    const { probA, probB } = result.payload;
    expect(probA + probB).toBeCloseTo(1, 5);
  });
  it('hard: numerator=1, denominator = 2 * 6', () => {
    const result = findWith(3, p => p.coin !== undefined);
    const { numerator, denominator } = result.payload;
    expect(numerator).toBe(1);
    expect(denominator).toBe(12);
  });
});
