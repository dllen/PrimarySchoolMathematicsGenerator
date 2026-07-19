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
});
