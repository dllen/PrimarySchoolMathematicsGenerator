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

  it('鸡兔同笼反推留 TODO（reverse generation）', () => {
    expect(solveAnswer({ type: 'integer', expression: { type: 'variable', name: 'chickens' }, reverse: true }, { chickens: 5 }).reversePending).toBe(true);
  });
});
