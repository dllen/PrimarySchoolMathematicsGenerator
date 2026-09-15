import { describe, it, expect } from 'vitest';
import { ProblemGeneratorFactory } from './ProblemGeneratorFactory.js';

describe('ProblemGeneratorFactory dsl mode', () => {
  it('mode=dsl 返回 DslStrategy 实例', () => {
    const s = ProblemGeneratorFactory.create({ mode: 'dsl', grade: 3 });
    expect(s.type).toBe('dsl');
  });

  it('mode=dsl.generate() 返回完整 Question 字段', () => {
    const s = ProblemGeneratorFactory.create({ mode: 'dsl', grade: 3 });
    const q = s.generate();
    expect(q.templateId).toMatch(/^G3_/);
    expect(typeof q.question).toBe('string');
  });
});
