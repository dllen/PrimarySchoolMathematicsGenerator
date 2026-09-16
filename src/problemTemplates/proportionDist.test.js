import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { proportionDistTemplate } from './proportionDist.js';

describe('proportionDistTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(proportionDistTemplate.subtemplates.length).toBe(3);
    expect(proportionDistTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(proportionDistTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(proportionDistTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid proportion distribution questions', () => {
    for (const st of proportionDistTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/按.*比|分配|比例/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('proportion-dist');
      expect(r.payload).toBeDefined();
    }
  });
});
