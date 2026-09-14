import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { redPacketTemplate } from './redPacket.js';

describe('redPacketTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = redPacketTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy: total = r1 + r2', () => {
    const rng = createRng(1);
    const result = redPacketTemplate.generate(rng, 1);
    const { r1, r2, total } = result.payload;
    expect(total).toBe(r1 + r2);
  });
  it('medium: remain = income - spend', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = redPacketTemplate.generate(rng, 2);
      if (result.payload.remain !== undefined && result.payload.income !== undefined) break;
    }
    const { income, spend, remain } = result.payload;
    expect(remain).toBe(income - spend);
  });
  it('hard: final = i1 + i2 - s1 - s2', () => {
    const rng = createRng(3);
    const result = redPacketTemplate.generate(rng, 3);
    const { i1, i2, s1, s2, final } = result.payload;
    expect(final).toBe(i1 + i2 - s1 - s2);
  });
});
