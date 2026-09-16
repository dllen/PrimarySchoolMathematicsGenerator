import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { comparisonMultiTemplate } from './comparisonMulti.js';

describe('comparisonMultiTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(comparisonMultiTemplate.subtemplates.length).toBe(3);
    expect(comparisonMultiTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(comparisonMultiTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(comparisonMultiTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid comparison-multi questions', () => {
    for (const st of comparisonMultiTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/比|多|少|最|排|序/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('comparison-multi');
      expect(r.payload).toBeDefined();
    }
  });
});
