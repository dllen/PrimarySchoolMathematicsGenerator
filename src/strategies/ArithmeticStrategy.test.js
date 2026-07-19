import { describe, it, expect } from 'vitest';
import { ArithmeticStrategy } from './ArithmeticStrategy.js';
import { createRng } from '../utils/rng.js';

describe('ArithmeticStrategy', () => {
  const config = {
    problemType: 'result',
    operations: { add: true, subtract: false, multiply: false, divide: false },
    digits: { add: 1, subtract: 1, multiply: 1, divide: 1 },
    termCount: 2,
    useBrackets: false,
    allowRepeatOperators: true,
  };

  it('delegates to ResultProblemStrategy for result type', () => {
    const s = new ArithmeticStrategy(config);
    const r = s.generate(createRng(1));
    expect(r.question).toMatch(/\d+\s*\+/);
  });

  it('delegates to OperandProblemStrategy for operand type', () => {
    const s = new ArithmeticStrategy({ ...config, problemType: 'operand' });
    const r = s.generate(createRng(2));
    expect(r.question).toMatch(/______/);
  });
});
