import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { interestTemplate } from './interest.js';

describe('interestTemplate', () => {
  it('has 3 subtemplates', () => {
    expect(interestTemplate.subtemplates.length).toBe(3);
    expect(interestTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(interestTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(interestTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid single-interest questions', () => {
    for (const st of interestTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/本金|利息|年利率|存款|年/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('interest');
    }
  });
});
