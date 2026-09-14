import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { inequalityTemplate } from './inequality.js';

function findWith(level, predicate, maxIters = 500) {
  for (let i = 0; i < maxIters; i++) {
    const rng = createRng(i * 7 + level * 13);
    const result = inequalityTemplate.generate(rng, level);
    if (predicate(result.payload)) return result;
  }
  return null;
}

describe('inequalityTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = inequalityTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('sum-product: maxProduct = floor(S/2) * ceil(S/2)', () => {
    for (const level of [1, 3]) {
      const result = findWith(level, p => p.maxProduct !== undefined && p.minProduct === undefined);
      const { S, maxProduct } = result.payload;
      const a = Math.floor(S / 2);
      const b = S - a;
      expect(maxProduct).toBe(a * b);
    }
  });
  it('product-sum: a * b = P', () => {
    for (const level of [2, 3]) {
      const result = findWith(level, p => p.P !== undefined);
      const { P, a, b } = result.payload;
      expect(a * b).toBe(P);
    }
  });
  it('integer: diff = maxProduct - minProduct', () => {
    const result = findWith(3, p => p.diff !== undefined);
    const { maxProduct, minProduct, diff } = result.payload;
    expect(diff).toBe(maxProduct - minProduct);
  });
});
