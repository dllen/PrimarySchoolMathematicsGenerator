import { describe, it, expect } from 'vitest';
import { shoppingTemplate } from './shopping.js';
import { createRng } from '../utils/rng.js';

describe('shoppingTemplate', () => {
  it('has id, gradeRange, semester', () => {
    expect(shoppingTemplate.id).toBe('shopping-complex');
    expect(shoppingTemplate.gradeRange).toEqual(['1', '2', '3', '4']);
    expect(shoppingTemplate.semester).toBe('all');
  });

  it('has subtemplates and generates valid problems', () => {
    expect(shoppingTemplate.subtemplates).toBeDefined();
    expect(shoppingTemplate.subtemplates.length).toBeGreaterThan(0);
    
    for (let i = 0; i < 20; i++) {
      const r = shoppingTemplate.generate(createRng(i), 1);
      expect(r.question).toBeDefined();
      expect(r.answer).toBeDefined();
      expect(r.subtype).toBe('shopping');
    }
  });

  it('is deterministic with the same seed', () => {
    const a = shoppingTemplate.generate(createRng(99), 2);
    const b = shoppingTemplate.generate(createRng(99), 2);
    expect(a).toEqual(b);
  });

  it('generates various question types', () => {
    const subtypes = new Set();
    for (let i = 0; i < 50; i++) {
      const r = shoppingTemplate.generate(createRng(i), 2);
      subtypes.add(r.question);
    }
    expect(subtypes.size).toBeGreaterThan(10);
  });

  it('shopping-share always splits evenly (no half-item answers)', () => {
    // Regression: an odd total made '平均每人分到几个' answer 9.5.
    for (let i = 0; i < 500; i++) {
      const r = shoppingTemplate.generate(createRng(i * 31 + 2 * 977), 2);
      const p = r.payload;
      if (p.share === undefined) continue;
      expect(Number.isInteger(p.share), `${r.question} => ${r.answer}`).toBe(true);
      expect(p.share * 2).toBe(p.total);
    }
  });
});
