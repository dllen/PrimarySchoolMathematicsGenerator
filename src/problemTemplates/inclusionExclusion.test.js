import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { inclusionExclusionTemplate } from './inclusionExclusion.js';

describe('inclusionExclusionTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(inclusionExclusionTemplate.subtemplates.length).toBe(3);
    expect(inclusionExclusionTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(inclusionExclusionTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(inclusionExclusionTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid inclusion-exclusion questions', () => {
    for (const st of inclusionExclusionTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/既.*又|参加|喜欢|都会/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('inclusion-exclusion');
      expect(r.payload).toBeDefined();
    }
  });
});
