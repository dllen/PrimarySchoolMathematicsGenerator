import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { numberTheoryTemplate } from './numberTheory.js';
import { gcd, lcm } from './helpers.js';

function findWith(level, predicate, maxIters = 500) {
  for (let i = 0; i < maxIters; i++) {
    const rng = createRng(i * 7 + level * 13);
    const result = numberTheoryTemplate.generate(rng, level);
    if (predicate(result.payload)) return result;
  }
  return null;
}

describe('numberTheoryTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = numberTheoryTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy (divisible): divisible flag matches n % divisor', () => {
    const result = findWith(1, p => p.divisible !== undefined);
    const { n, divisor, divisible } = result.payload;
    expect(Boolean(divisible)).toBe(n % divisor === 0);
  });
  it('easy (remainder): dividend = divisor * quotient + remainder', () => {
    const result = findWith(1, p => p.dividend !== undefined);
    const { dividend, divisor, quotient, remainder } = result.payload;
    expect(dividend).toBe(divisor * quotient + remainder);
  });
  it('medium (lcm): L = lcm(a, b)', () => {
    const result = findWith(2, p => p.L !== undefined);
    const { a, b, L } = result.payload;
    expect(L).toBe(lcm(a, b));
  });
  it('medium (gcd): G = gcd(a, b)', () => {
    const result = findWith(2, p => p.G !== undefined);
    const { a, b, G } = result.payload;
    expect(G).toBe(gcd(a, b));
  });
  it('hard (congruence): x % n === a', () => {
    const result = findWith(3, p => p.x !== undefined && p.n !== undefined && p.n1 === undefined);
    const { n, a, x } = result.payload;
    expect(x % n).toBe(a);
  });
  it('hard (puzzle): satisfies both congruences', () => {
    const result = findWith(3, p => p.n1 !== undefined);
    const { n1, n2, r1, r2, x } = result.payload;
    expect(x % n1).toBe(r1);
    expect(x % n2).toBe(r2);
  });

  it('hard (puzzle): moduli differ so a solution always exists', () => {
    // Regression: n1 and n2 could both be 5 with conflicting remainders,
    // which made the problem unsatisfiable and returned the 1000 sentinel.
    for (let i = 0; i < 500; i++) {
      const r = numberTheoryTemplate.generate(createRng(i * 31 + 3 * 977), 3);
      const p = r.payload;
      if (p.n1 === undefined) continue;
      expect(p.n1, r.question).not.toBe(p.n2);
      expect(p.x, r.question).toBeLessThan(1000);
      expect(p.x % p.n1).toBe(p.r1);
      expect(p.x % p.n2).toBe(p.r2);
    }
  });
});
