import { describe, it, expect } from 'vitest';
import { shoppingTemplate } from './shopping.js';
import { createRng } from '../utils/rng.js';

describe('shoppingTemplate', () => {
  it('has id, gradeRange, semester', () => {
    expect(shoppingTemplate.id).toBe('shopping-basic');
    expect(shoppingTemplate.gradeRange).toEqual(['1', '2', '3']);
    expect(shoppingTemplate.semester).toBe('all');
  });

  it('produces consistent answer for given variables', () => {
    const rng = createRng(1);
    const result = shoppingTemplate.generate(rng, 1);
    expect(result.answer).toBe(`${result.payload.total}元`);
    expect(result.payload.total).toBe(result.payload.unitPrice * result.payload.quantity);
    expect(result.subtype).toBe('shopping');
    expect(result.question).toContain('小明');
  });

  it('is deterministic with the same seed', () => {
    const a = shoppingTemplate.generate(createRng(99), 2);
    const b = shoppingTemplate.generate(createRng(99), 2);
    expect(a).toEqual(b);
  });

  it('quantity grows with difficulty', () => {
    const easy = [];
    const hard = [];
    for (let s = 0; s < 20; s++) {
      easy.push(shoppingTemplate.generate(createRng(s), 1).payload.quantity);
      hard.push(shoppingTemplate.generate(createRng(s), 3).payload.quantity);
    }
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    expect(avg(hard)).toBeGreaterThan(avg(easy));
  });
});