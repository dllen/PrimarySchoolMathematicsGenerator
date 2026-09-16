import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { ageProblemFamilyTemplate } from './ageProblemFamily.js';

describe('ageProblemFamilyTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(ageProblemFamilyTemplate.subtemplates.length).toBe(3);
    expect(ageProblemFamilyTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(ageProblemFamilyTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(ageProblemFamilyTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid age-problem-family questions', () => {
    for (const st of ageProblemFamilyTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/父|母|子|爷|奶|岁/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('age-problem-family');
      expect(r.payload).toBeDefined();
    }
  });
});
