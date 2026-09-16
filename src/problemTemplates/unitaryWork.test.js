import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { unitaryWorkTemplate } from './unitaryWork.js';

describe('unitaryWorkTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(unitaryWorkTemplate.subtemplates.length).toBe(3);
    expect(unitaryWorkTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(unitaryWorkTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(unitaryWorkTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid unitary-work questions', () => {
    for (const st of unitaryWorkTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/工程|工作|天|小时|完成|单独/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('unitary-work');
      expect(r.payload).toBeDefined();
    }
  });
});
