import { describe, it, expect } from 'vitest';
import { comparisonTemplate } from './comparison.js';
import { createRng } from '../utils/rng.js';

describe('comparisonTemplate', () => {
  it('metadata matches spec', () => {
    expect(comparisonTemplate.id).toBe('comparison-diff');
    expect(comparisonTemplate.gradeRange).toEqual(['2', '3', '4']);
  });

  it('difference equals payload fields', () => {
    const r = comparisonTemplate.generate(createRng(7), 1);
    expect(r.payload.difference).toBe(Math.abs(r.payload.a - r.payload.b));
    expect(r.answer).toBe(`${r.payload.difference}`);
    expect(r.subtype).toBe('comparison');
    expect(r.question).toMatch(/多|少/);
  });

  it('produces non-negative difference', () => {
    for (let s = 0; s < 30; s++) {
      const r = comparisonTemplate.generate(createRng(s), 3);
      expect(r.payload.difference).toBeGreaterThanOrEqual(0);
    }
  });
});