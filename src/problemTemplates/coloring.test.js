import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { coloringTemplate } from './coloring.js';

describe('coloringTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(coloringTemplate.subtemplates.length).toBe(3);
    expect(coloringTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(coloringTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(coloringTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid coloring questions', () => {
    for (const st of coloringTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/染色|方格|相邻|棋盘/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('coloring');
      expect(r.payload).toBeDefined();
    }
  });
});
