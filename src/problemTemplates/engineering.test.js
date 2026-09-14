import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { engineeringTemplate } from './engineering.js';

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
  it('medium (together): total = (r1 + r2) * hours', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = engineeringTemplate.generate(rng, 2);
      if (result.payload.r2 !== undefined && result.payload.hours !== undefined) break;
    }
    const { r1, r2, hours, total } = result.payload;
    expect(total).toBe((r1 + r2) * hours);
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
