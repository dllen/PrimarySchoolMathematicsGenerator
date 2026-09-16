import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { discountTemplate } from './discount.js';

describe('discountTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(discountTemplate.subtemplates.length).toBe(3);
    expect(discountTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(discountTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(discountTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid subtemplates', () => {
    for (const st of discountTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/原价|现价|打折|满减|送/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('discount');
      expect(r.payload).toBeDefined();
    }
  });
});
