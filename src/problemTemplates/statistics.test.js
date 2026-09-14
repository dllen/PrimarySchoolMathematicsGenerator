import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { statisticsTemplate } from './statistics.js';

function findWith(level, predicate, maxIters = 500) {
  for (let i = 0; i < maxIters; i++) {
    const rng = createRng(i * 7 + level * 13);
    const result = statisticsTemplate.generate(rng, level);
    if (predicate(result.payload)) return result;
  }
  return null;
}

describe('statisticsTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = statisticsTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy (mean): mean = total / n', () => {
    const result = findWith(1, p => p.total !== undefined && p.n !== undefined && p.mean !== undefined);
    const { total, n, mean } = result.payload;
    expect(mean).toBeCloseTo(total / n, 1);
  });
  it('medium (mean-reverse): total = n * mean', () => {
    const result = findWith(2, p => p.mean !== undefined && p.total !== undefined);
    const { n, mean, total } = result.payload;
    expect(total).toBe(n * mean);
  });
  it('medium (range): range = max - min', () => {
    const result = findWith(2, p => p.range !== undefined);
    const { max, min, range } = result.payload;
    expect(range).toBe(max - min);
  });
  it('hard (compare): diff = |m1 - m2|', () => {
    const result = findWith(3, p => p.m1 !== undefined && p.m2 !== undefined);
    const { m1, m2, diff } = result.payload;
    expect(diff).toBe(Math.round(Math.abs(m1 - m2) * 10) / 10);
  });
});
