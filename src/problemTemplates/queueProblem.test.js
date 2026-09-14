import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { queueProblemTemplate } from './queueProblem.js';

describe('queueProblemTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = queueProblemTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy: total = front + 1 + behind', () => {
    const rng = createRng(1);
    const result = queueProblemTemplate.generate(rng, 1);
    const { front, behind, total } = result.payload;
    expect(front + 1 + behind).toBe(total);
  });
  it('medium: swap = |posA - posB|', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = queueProblemTemplate.generate(rng, 2);
      if (result.payload.swap !== undefined) break;
    }
    const { posA, posB, swap } = result.payload;
    expect(swap).toBe(Math.abs(posA - posB));
  });
  it('hard: wait = (total - pos) * skip', () => {
    const rng = createRng(3);
    let result;
    for (let i = 0; i < 50; i++) {
      result = queueProblemTemplate.generate(rng, 3);
      if (result.payload.wait !== undefined) break;
    }
    const { total, pos, skip, wait } = result.payload;
    expect(wait).toBe((total - pos) * skip);
  });
});
