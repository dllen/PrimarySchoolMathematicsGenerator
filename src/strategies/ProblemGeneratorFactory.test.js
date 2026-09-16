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

import { DigitPuzzleStrategy } from './DigitPuzzleStrategy.js';
import { QuickMathStrategy } from './QuickMathStrategy.js';
import { FractionArithmeticStrategy } from './FractionArithmeticStrategy.js';
import { DecimalArithmeticStrategy } from './DecimalArithmeticStrategy.js';

describe('ProblemGeneratorFactory batch E modes', () => {
  const cfg = { difficulty: 'medium', grade: '4' };

  it('should create DigitPuzzleStrategy', () => {
    const s = ProblemGeneratorFactory.createStrategy('digit-puzzle', cfg);
    expect(s).toBeInstanceOf(DigitPuzzleStrategy);
  });
  it('should create QuickMathStrategy', () => {
    const s = ProblemGeneratorFactory.createStrategy('quick-math', cfg);
    expect(s).toBeInstanceOf(QuickMathStrategy);
  });
  it('should create FractionArithmeticStrategy', () => {
    const s = ProblemGeneratorFactory.createStrategy('fraction-arithmetic', cfg);
    expect(s).toBeInstanceOf(FractionArithmeticStrategy);
  });
  it('should create DecimalArithmeticStrategy', () => {
    const s = ProblemGeneratorFactory.createStrategy('decimal-arithmetic', cfg);
    expect(s).toBeInstanceOf(DecimalArithmeticStrategy);
  });
  it('getSupportedTypes includes batch E modes', () => {
    const types = ProblemGeneratorFactory.getSupportedTypes();
    expect(types).toContain('digit-puzzle');
    expect(types).toContain('quick-math');
    expect(types).toContain('fraction-arithmetic');
    expect(types).toContain('decimal-arithmetic');
  });
  it('create() with new modes returns a working strategy', () => {
    for (const mode of ['digit-puzzle', 'quick-math', 'fraction-arithmetic', 'decimal-arithmetic']) {
      const s = ProblemGeneratorFactory.create({ mode, ...cfg });
      expect(s).toBeDefined();
      const r = s.generate();
      expect(r).toBeDefined();
    }
  });
});
