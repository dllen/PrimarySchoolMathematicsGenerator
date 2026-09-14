import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { ratioTemplate } from './ratio.js';

function findWith(level, predicate, maxIters = 500) {
  for (let i = 0; i < maxIters; i++) {
    const rng = createRng(i * 7 + level * 13);
    const result = ratioTemplate.generate(rng, level);
    if (predicate(result.payload)) return result;
  }
  return null;
}

describe('ratioTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = ratioTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy (distribute): partA + partB = total', () => {
    const result = findWith(1, p => p.partA !== undefined && p.partB !== undefined);
    const { partA, partB, total } = result.payload;
    expect(partA + partB).toBe(total);
  });
  it('medium (combine): combined ratio has gcd 1', () => {
    const result = findWith(2, p => p.totalA !== undefined && p.a1 !== undefined);
    const { totalA, totalB, gcd: g } = result.payload;
    // template returns simplified form `${totalA/g}:${totalB/g}`
    expect(g).toBeGreaterThan(0);
    expect(totalA % g).toBe(0);
    expect(totalB % g).toBe(0);
  });
  it('hard (partnership): share1 + share2 = profit', () => {
    const result = findWith(3, p => p.profit !== undefined && p.share1 !== undefined);
    const { share1, share2, profit } = result.payload;
    expect(share1 + share2).toBe(profit);
  });

  it('ratio-distribute splits exactly in the stated ratio', () => {
    // Regression: total was drawn independently of the ratio sum, so
    // partA:partB != a:b whenever total % sum !== 0 (9 candies at 1:1 -> 4/5).
    for (let i = 0; i < 500; i++) {
      const result = ratioTemplate.generate(createRng(i), 1);
      const { a, b, partA, partB } = result.payload;
      if (partA === undefined) continue;
      expect(partA * b, `seed=${i} ${a}:${b} split ${partA}:${partB}`).toBe(partB * a);
    }
  });
});
