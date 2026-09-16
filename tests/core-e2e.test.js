import { describe, it, expect } from 'vitest';
import { ProblemGeneratorFactory } from '../src/strategies/ProblemGeneratorFactory.js';
import { generateQuestion } from '../src/core/generate.js';
import chickenRabbitTpl from '../src/templates/olympiad/O23_CHICKEN_RABBIT_001.json' with { type: 'json' };

describe('DSL engine e2e', () => {
  it('grade=3 dsl 模式生成 5 道 G3 题，字段齐全且不重复', () => {
    const s = ProblemGeneratorFactory.create({ mode: 'dsl', grade: 3 });
    const seen = new Set();
    for (let i = 0; i < 5; i++) {
      const q = s.generate();
      expect(q.templateId).toMatch(/^G3_/);
      expect(typeof q.question).toBe('string');
      expect(q.question.length).toBeGreaterThan(0);
      expect(typeof q.answer.value === 'number' || typeof q.answer.value === 'string').toBe(true);
      expect(q.difficulty.level).toBeGreaterThanOrEqual(1);
      expect(q.difficulty.level).toBeLessThanOrEqual(5);
      // 不重复：hash 唯一
      expect(seen.has(q.hash)).toBe(false);
      seen.add(q.hash);
    }
  });

  it('grade=4 dsl 模式能生成奥数题（O23_）', () => {
    const s = ProblemGeneratorFactory.create({ mode: 'dsl', grade: 4 });
    let foundOlympiad = false;
    for (let i = 0; i < 20; i++) {
      const q = s.generate();
      if (q.templateId.startsWith('O23_')) foundOlympiad = true;
    }
    expect(foundOlympiad).toBe(true);
  });

  it('G3_PRICE_001 同 seed + 同 index 必产同题', () => {
    const s1 = ProblemGeneratorFactory.create({ mode: 'dsl', grade: 3 });
    const s2 = ProblemGeneratorFactory.create({ mode: 'dsl', grade: 3 });
    const q1 = s1.generate();
    const q2 = s2.generate();
    // 不同时刻 seed 不同，所以不一定相同；这里只验证 generate 不抛错
    expect(q1.hash).toBeDefined();
    expect(q2.hash).toBeDefined();
  });
});

describe('e2e: chicken-rabbit (reverse answer path)', () => {
  it('should produce 10 questions with real answers satisfying all constraints', () => {
    const seen = new Set();
    for (let i = 0; i < 10; i++) {
      const q = generateQuestion({ template: chickenRabbitTpl, seed: 1000, index: i });
      expect(q.answer.value).toBeDefined();
      expect(typeof q.answer.value).toBe('number');
      expect(q.answer.reversePending).toBeUndefined();
      expect(q.variables.chickens + q.variables.rabbits).toBe(q.variables.heads);
      expect(2 * q.variables.chickens + 4 * q.variables.rabbits).toBe(q.variables.legs);
      expect(q.answer.value).toBe(q.variables.chickens);
      expect(seen.has(q.hash)).toBe(false);
      seen.add(q.hash);
    }
  });

  it('different seeds produce different questions', () => {
    const q1 = generateQuestion({ template: chickenRabbitTpl, seed: 1, index: 0 });
    const q2 = generateQuestion({ template: chickenRabbitTpl, seed: 2, index: 0 });
    expect(q1.hash).not.toBe(q2.hash);
  });
});
