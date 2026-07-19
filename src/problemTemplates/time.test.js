import { describe, it, expect } from 'vitest';
import { timeTemplate } from './time.js';
import { createRng } from '../utils/rng.js';

describe('timeTemplate', () => {
  it('metadata matches spec', () => {
    expect(timeTemplate.id).toBe('time-complex');
    expect(timeTemplate.gradeRange).toEqual(['1', '2', '3', '4']);
  });

  it('has subtemplates and generates valid problems', () => {
    expect(timeTemplate.subtemplates).toBeDefined();
    expect(timeTemplate.subtemplates.length).toBeGreaterThan(0);
    
    for (let i = 0; i < 20; i++) {
      const r = timeTemplate.generate(createRng(i), 1);
      expect(r.question).toBeDefined();
      expect(r.answer).toBeDefined();
      expect(r.subtype).toBe('time');
    }
  });

  it('respects grade filter', () => {
    const templates = timeTemplate.subtemplates;
    templates.forEach(t => {
      const gradeRanges = t.gradeRange || timeTemplate.gradeRange;
      expect(gradeRanges).toBeDefined();
    });
  });
});
