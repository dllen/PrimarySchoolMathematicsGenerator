import { describe, it, expect } from 'vitest';
import { logicTemplate } from './logic.js';
import { createRng } from '../utils/rng.js';

describe('logicTemplate', () => {
  it('metadata matches spec', () => {
    expect(logicTemplate.id).toBe('logic-simple');
    expect(logicTemplate.gradeRange).toEqual(['4', '5', '6']);
  });

  it('total equals sum of items', () => {
    const r = logicTemplate.generate(createRng(11), 1);
    expect(r.payload.total).toBe(r.payload.a + r.payload.b - r.payload.c);
    expect(r.answer).toBe(`${r.payload.total}支`);
    expect(r.subtype).toBe('logic');
    expect(r.question).toContain('一共');
  });

  it('uses positive values', () => {
    for (let s = 0; s < 30; s++) {
      const r = logicTemplate.generate(createRng(s), 2);
      expect(r.payload.a).toBeGreaterThan(0);
      expect(r.payload.b).toBeGreaterThan(0);
      expect(r.payload.c).toBeGreaterThan(0);
    }
  });

  it('total is always positive (c < a+b)', () => {
    for (let s = 0; s < 50; s++) {
      const r = logicTemplate.generate(createRng(s), 3);
      expect(r.payload.total).toBeGreaterThan(0);
      expect(r.payload.c).toBeLessThan(r.payload.a + r.payload.b);
    }
  });
});