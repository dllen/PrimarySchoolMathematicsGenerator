import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { chickenRabbit3VarTemplate } from './chickenRabbit3Var.js';

describe('chickenRabbit3VarTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(chickenRabbit3VarTemplate.subtemplates.length).toBe(3);
    expect(chickenRabbit3VarTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(chickenRabbit3VarTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(chickenRabbit3VarTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid 3-var chicken-rabbit questions', () => {
    for (const st of chickenRabbit3VarTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/牛|羊|鸡|笼|栏|头|腿|角/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('chicken-rabbit-3var');
      expect(r.payload).toBeDefined();
    }
  });
});
