import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { averageTemplate } from './average.js';

describe('averageTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(averageTemplate.subtemplates.length).toBe(3);
    expect(averageTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(averageTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(averageTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid average questions', () => {
    for (const st of averageTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/平均/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('average');
      expect(r.payload).toBeDefined();
    }
  });
});
