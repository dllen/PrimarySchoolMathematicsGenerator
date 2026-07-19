import { describe, it, expect } from 'vitest';
import { comparisonTemplate } from './comparison.js';
import { createRng } from '../utils/rng.js';

describe('comparisonTemplate', () => {
  it('metadata matches spec', () => {
    expect(comparisonTemplate.id).toBe('comparison-complex');
    expect(comparisonTemplate.gradeRange).toEqual(['2', '3', '4', '5']);
  });

  it('has subtemplates and generates valid problems', () => {
    expect(comparisonTemplate.subtemplates).toBeDefined();
    expect(comparisonTemplate.subtemplates.length).toBeGreaterThan(0);
    
    for (let i = 0; i < 20; i++) {
      const r = comparisonTemplate.generate(createRng(i), 1);
      expect(r.question).toBeDefined();
      expect(r.answer).toBeDefined();
      expect(r.subtype).toBe('comparison');
    }
  });

  it('generates various question types', () => {
    const questions = new Set();
    for (let i = 0; i < 50; i++) {
      const r = comparisonTemplate.generate(createRng(i), 2);
      questions.add(r.question);
    }
    expect(questions.size).toBeGreaterThan(10);
  });
});
