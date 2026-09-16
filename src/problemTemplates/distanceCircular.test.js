import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { distanceCircularTemplate } from './distanceCircular.js';

describe('distanceCircularTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(distanceCircularTemplate.subtemplates.length).toBe(3);
    expect(distanceCircularTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(distanceCircularTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(distanceCircularTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid circular-distance questions', () => {
    for (const st of distanceCircularTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/环形|跑道|周长|圈|相遇|追上/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('distance-circular');
      expect(r.payload).toBeDefined();
    }
  });
});
