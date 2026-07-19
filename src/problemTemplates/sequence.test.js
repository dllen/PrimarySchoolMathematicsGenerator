import { describe, it, expect } from 'vitest';
import { sequenceTemplate } from './sequence.js';
import { createRng } from '../utils/rng.js';

describe('sequenceTemplate', () => {
  it('metadata matches spec', () => {
    expect(sequenceTemplate.id).toBe('sequence-complex');
    expect(sequenceTemplate.gradeRange).toEqual(['3', '4', '5', '6']);
  });

  it('has subtemplates and generates valid problems', () => {
    expect(sequenceTemplate.subtemplates).toBeDefined();
    expect(sequenceTemplate.subtemplates.length).toBeGreaterThan(0);
    
    for (let i = 0; i < 20; i++) {
      const r = sequenceTemplate.generate(createRng(i), 1);
      expect(r.question).toBeDefined();
      expect(r.answer).toBeDefined();
      expect(r.subtype).toBe('sequence');
    }
  });

  it('generates various question types', () => {
    const questions = new Set();
    for (let i = 0; i < 50; i++) {
      const r = sequenceTemplate.generate(createRng(i), 2);
      questions.add(r.question);
    }
    expect(questions.size).toBeGreaterThan(10);
  });
});
