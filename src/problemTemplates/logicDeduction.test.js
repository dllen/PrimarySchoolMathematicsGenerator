import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { logicDeductionTemplate } from './logicDeduction.js';

describe('logicDeductionTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(logicDeductionTemplate.subtemplates.length).toBe(3);
    expect(logicDeductionTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(logicDeductionTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(logicDeductionTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid logic-deduction questions', () => {
    for (const st of logicDeductionTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/说|真话|假话|谁|不是|是/);
      expect(r.answer).toMatch(/\d|不是|能|会|谁|说/);
      expect(r.subtype).toBe('logic-deduction');
      expect(r.payload).toBeDefined();
    }
  });
});
