import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { extremeValueTemplate } from './extremeValue.js';

describe('extremeValueTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(extremeValueTemplate.subtemplates.length).toBe(3);
    expect(extremeValueTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(extremeValueTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(extremeValueTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid extreme-value questions', () => {
    for (const st of extremeValueTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/最大|最小|至少|至多/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('extreme-value');
      expect(r.payload).toBeDefined();
    }
  });
});
