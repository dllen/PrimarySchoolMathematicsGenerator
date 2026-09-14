import { describe, it, expect } from 'vitest';
import { logicTemplate } from './logic.js';
import { createRng } from '../utils/rng.js';

describe('logicTemplate', () => {
  it('metadata matches spec', () => {
    expect(logicTemplate.id).toBe('logic-complex');
    expect(logicTemplate.gradeRange).toEqual(['4', '5', '6']);
  });

  it('has subtemplates and generates valid problems', () => {
    expect(logicTemplate.subtemplates).toBeDefined();
    expect(logicTemplate.subtemplates.length).toBeGreaterThan(0);
    
    for (let i = 0; i < 20; i++) {
      const r = logicTemplate.generate(createRng(i), 1);
      expect(r.question).toBeDefined();
      expect(r.answer).toBeDefined();
      expect(r.subtype).toBe('logic');
    }
  });

  it('generates various question types', () => {
    const questions = new Set();
    for (let i = 0; i < 50; i++) {
      const r = logicTemplate.generate(createRng(i), 2);
      questions.add(r.question);
    }
    expect(questions.size).toBeGreaterThan(10);
  });

  it('logic-plant-trees uses a length that is an exact multiple of the spacing', () => {
    // Regression: '两端都种' was claimed on roads where the length was not a
    // multiple of the interval, so the far end had no tree.
    for (let i = 0; i < 500; i++) {
      const r = logicTemplate.generate(createRng(i * 31 + 2 * 977), 2);
      const p = r.payload;
      if (p.length === undefined || p.interval === undefined || p.groupCount !== undefined) continue;
      if (p.trees === undefined) continue;
      expect(p.length % p.interval, `${r.question}`).toBe(0);
      expect(p.trees).toBe(p.length / p.interval + 1);
    }
  });

  it('logic-pigeonhole-simple answers with ceil(N/G)', () => {
    // Regression: floor(N/G)+1 overstated by one whenever G divided N
    // (10 books into 5 shelves answered 3; the true bound is 2).
    for (let i = 0; i < 500; i++) {
      const r = logicTemplate.generate(createRng(i * 31 + 3 * 977), 3);
      const p = r.payload;
      if (p.peopleCount === undefined || p.groupCount === undefined) continue;
      expect(p.answer, r.question).toBe(Math.ceil(p.peopleCount / p.groupCount));
    }
  });
});
