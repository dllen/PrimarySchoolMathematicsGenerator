import { describe, it, expect } from 'vitest';
import { timeTemplate } from './time.js';
import { createRng } from '../utils/rng.js';

describe('timeTemplate', () => {
  it('metadata matches spec', () => {
    expect(timeTemplate.id).toBe('time-clock');
    expect(timeTemplate.gradeRange).toEqual(['1', '2', '3']);
  });

  it('computes hours consistently', () => {
    const rng = createRng(5);
    const r = timeTemplate.generate(rng, 1);
    expect(r.payload.hoursLater).toBeGreaterThan(0);
    expect(r.payload.hoursLater).toBeLessThanOrEqual(12);
    expect(r.question).toContain('小时');
    expect(r.subtype).toBe('time');
    expect(r.answer).toBe(`${r.payload.endHour}时`);
  });

  it('endHour wraps within 1-12', () => {
    for (let s = 0; s < 30; s++) {
      const r = timeTemplate.generate(createRng(s), 2);
      expect(r.payload.endHour).toBeGreaterThanOrEqual(1);
      expect(r.payload.endHour).toBeLessThanOrEqual(12);
    }
  });
});