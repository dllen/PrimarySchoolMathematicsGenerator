import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { perfectSquareTemplate } from './perfectSquare.js';

describe('perfectSquareTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(perfectSquareTemplate.subtemplates.length).toBe(3);
    expect(perfectSquareTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(perfectSquareTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(perfectSquareTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid perfect-square questions', () => {
    for (const st of perfectSquareTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/平方|因数|约数/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('perfect-square');
      expect(r.payload).toBeDefined();
    }
  });
});
