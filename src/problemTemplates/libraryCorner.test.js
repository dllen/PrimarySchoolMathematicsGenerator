import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { libraryCornerTemplate } from './libraryCorner.js';

describe('libraryCornerTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = libraryCornerTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy: remain = total - borrow + back', () => {
    const rng = createRng(1);
    const result = libraryCornerTemplate.generate(rng, 1);
    const { total, borrow, back, remain } = result.payload;
    expect(remain).toBe(total - borrow + back);
  });
  it('medium: fine = borrow * daysLate * finePerDay', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = libraryCornerTemplate.generate(rng, 2);
      if (result.payload.fine !== undefined) break;
    }
    const { borrow, daysLate, finePerDay, fine } = result.payload;
    expect(fine).toBe(borrow * daysLate * finePerDay);
  });
  it('hard: final = start - op1 + op2', () => {
    const rng = createRng(3);
    const result = libraryCornerTemplate.generate(rng, 3);
    const { start, op1, op2, final } = result.payload;
    expect(final).toBe(start - op1 + op2);
  });
});
