import { describe, it, expect } from 'vitest';
import { generateQuestion } from './generate.js';
import priceTpl from '../templates/wordProblems/G3_PRICE_001.json' with { type: 'json' };

describe('generateQuestion', () => {
  it('G3_PRICE_001 生成完整 Question 字段', () => {
    const q = generateQuestion({ template: priceTpl, seed: 42, index: 0 });
    expect(q).toMatchObject({
      templateId: 'G3_PRICE_001',
      seed: 42,
      index: 0,
    });
    expect(typeof q.question).toBe('string');
    expect(q.question.length).toBeGreaterThan(0);
    expect(typeof q.answer).toBe('object');
    expect(q.answer.value).toBeGreaterThan(0);
    expect(typeof q.difficulty.level).toBe('number');
    expect(typeof q.hash).toBe('string');
    expect(q.variables.unitPrice).toBeDefined();
    expect(q.variables.quantity).toBeDefined();
    expect(q.variables.total).toBe(q.variables.unitPrice * q.variables.quantity);
  });

  it('同 seed + 同 index 必产相同 Question', () => {
    const q1 = generateQuestion({ template: priceTpl, seed: 1, index: 0 });
    const q2 = generateQuestion({ template: priceTpl, seed: 1, index: 0 });
    expect(q1).toEqual(q2);
  });

  it('不同 seed 必产不同 Question', () => {
    const q1 = generateQuestion({ template: priceTpl, seed: 1, index: 0 });
    const q2 = generateQuestion({ template: priceTpl, seed: 2, index: 0 });
    expect(q1.question).not.toBe(q2.question);
  });
});
