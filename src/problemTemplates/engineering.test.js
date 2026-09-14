import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { engineeringTemplate } from './engineering.js';

function findWith(level, predicate, maxIters = 500) {
  for (let i = 0; i < maxIters; i++) {
    const rng = createRng(i * 7 + level * 13);
    const result = engineeringTemplate.generate(rng, level);
    if (predicate(result.payload)) return result;
  }
  return null;
}

describe('engineeringTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = engineeringTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy: total = rate * hours', () => {
    const rng = createRng(1);
    const result = engineeringTemplate.generate(rng, 1);
    const { rate, hours, total } = result.payload;
    expect(total).toBe(rate * hours);
  });
  it('medium (together): solves for hours, total = (r1 + r2) * hours', () => {
    const result = findWith(2, p => p.r2 !== undefined && p.hours !== undefined);
    const { r1, r2, hours, total } = result.payload;
    expect(total).toBe((r1 + r2) * hours);
    // The question must ask for time, not total.
    expect(result.question).toMatch(/需要多少小时/);
  });
  it('medium (complete): solves for rate, total = rate * hours', () => {
    const result = findWith(2, p => p.rate !== undefined && p.hours !== undefined);
    const { rate, hours, total } = result.payload;
    expect(total).toBe(rate * hours);
    expect(result.question).toMatch(/平均每小时做多少个/);
  });
  it('hard (three): total = (r1+r2+r3)*hours', () => {
    const rng = createRng(3);
    let result;
    for (let i = 0; i < 50; i++) {
      result = engineeringTemplate.generate(rng, 3);
      if (result.payload.r3 !== undefined) break;
    }
    const { r1, r2, r3, hours, total } = result.payload;
    expect(total).toBe((r1 + r2 + r3) * hours);
  });
});
