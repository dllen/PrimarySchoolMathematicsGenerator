import { describe, it, expect } from 'vitest';
import { solveAnswer } from './solver.js';

describe('solveAnswer', () => {
  it('简单 expression 求值', () => {
    const answerDef = { type: 'integer', expression: { type: 'operation', op: 'add', args: [{ type: 'variable', name: 'a' }, { type: 'variable', name: 'b' }] } };
    expect(solveAnswer(answerDef, { a: 3, b: 4 }).value).toBe(7);
  });

  it('answer type integer + 整数结果', () => {
    const answerDef = { type: 'integer', expression: { type: 'variable', name: 'n' } };
    expect(solveAnswer(answerDef, { n: 42 }).value).toBe(42);
  });

  it('should return vars[name] when answer.reverse is true and variable exists', () => {
    const def = { type: 'integer', expression: { type: 'variable', name: 'chickens' }, reverse: true };
    const r = solveAnswer(def, { chickens: 23, rabbits: 12, heads: 35, legs: 94 });
    expect(r.ok).toBe(true);
    expect(r.value).toBe(23);
    expect(r.type).toBe('integer');
    expect(r.reversePending).toBeUndefined();
  });

  it('should throw when reverse answer references ungenerated variable', () => {
    const def = { type: 'integer', expression: { type: 'variable', name: 'ghosts' }, reverse: true };
    expect(() => solveAnswer(def, { chickens: 5 })).toThrow(/ungenerated variable.*ghosts/);
  });
});
