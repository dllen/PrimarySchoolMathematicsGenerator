import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { advancedLogicTemplate } from './advancedLogic.js';

function findWith(level, predicate, maxIters = 500) {
  for (let i = 0; i < maxIters; i++) {
    const rng = createRng(i * 7 + level * 13);
    const result = advancedLogicTemplate.generate(rng, level);
    if (predicate(result.payload)) return result;
  }
  return null;
}

describe('advancedLogicTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = advancedLogicTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy (deduction): lower = min(x, y)', () => {
    const result = findWith(1, p => p.x !== undefined && p.y !== undefined);
    const { x, y, lower } = result.payload;
    expect(lower).toBe(Math.min(x, y));
  });
  it('medium (truth-teller): three distinct people', () => {
    const result = findWith(2, p => p.p1 !== undefined);
    const { p1, p2, p3 } = result.payload;
    expect(new Set([p1, p2, p3]).size).toBe(3);
  });
  it('medium (tournament): matches = teams * (teams-1) / 2', () => {
    const result = findWith(2, p => p.teams !== undefined);
    const { teams, matches } = result.payload;
    expect(matches).toBe(teams * (teams - 1) / 2);
  });
  it('hard (lock): total = 10^digits', () => {
    const result = findWith(3, p => p.digits !== undefined);
    const { digits, total } = result.payload;
    expect(total).toBe(Math.pow(10, digits));
  });
  it('hard (seating): arrangements = n(n-1)(n-2)', () => {
    const result = findWith(3, p => p.arrangements !== undefined);
    const { n, arrangements } = result.payload;
    expect(arrangements).toBe(n * (n - 1) * (n - 2));
  });
});
