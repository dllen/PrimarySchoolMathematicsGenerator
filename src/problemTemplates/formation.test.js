import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { formationTemplate } from './formation.js';

describe('formationTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(formationTemplate.subtemplates.length).toBe(3);
    expect(formationTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(formationTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(formationTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid formation questions', () => {
    for (const st of formationTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/方阵/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('formation');
      expect(r.payload).toBeDefined();
    }
  });
});
