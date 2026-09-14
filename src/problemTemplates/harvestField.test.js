import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { harvestFieldTemplate } from './harvestField.js';

describe('harvestFieldTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = harvestFieldTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy: total = yield * area', () => {
    const rng = createRng(1);
    const result = harvestFieldTemplate.generate(rng, 1);
    const { yield_, area, total } = result.payload;
    expect(total).toBe(yield_ * area);
  });
  it('medium: total = yield * area (reverse direction)', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = harvestFieldTemplate.generate(rng, 2);
      if (result.payload.area !== undefined && result.payload.total !== undefined) break;
    }
    const { yield_, area, total } = result.payload;
    expect(total).toBe(yield_ * area);
  });
  it('hard: diff = |t1 - t2|', () => {
    const rng = createRng(3);
    const result = harvestFieldTemplate.generate(rng, 3);
    const { t1, t2, diff } = result.payload;
    expect(diff).toBe(Math.abs(t1 - t2));
  });
});
