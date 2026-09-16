import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { concentrationTripleTemplate } from './concentrationTriple.js';

describe('concentrationTripleTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(concentrationTripleTemplate.subtemplates.length).toBe(3);
    expect(concentrationTripleTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(concentrationTripleTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(concentrationTripleTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid concentration-triple questions', () => {
    for (const st of concentrationTripleTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/浓度|混合|盐水|糖水|溶液/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('concentration-triple');
      expect(r.payload).toBeDefined();
    }
  });
});
