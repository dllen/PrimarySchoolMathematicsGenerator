import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { clockAngleTemplate } from './clockAngle.js';

describe('clockAngleTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(clockAngleTemplate.subtemplates.length).toBe(3);
    expect(clockAngleTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(clockAngleTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(clockAngleTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid clock angle questions', () => {
    for (const st of clockAngleTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/钟表|时|分|夹角|重合|成直线/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('clock-angle');
      expect(r.payload).toBeDefined();
    }
  });
});
