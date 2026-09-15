import { describe, it, expect } from 'vitest';
import { mathValidator, answerValidator, uniquenessValidator } from './validator.js';

describe('mathValidator', () => {
  it('answer 等于表达式结果 → ok', () => {
    const r = mathValidator({
      answer: 7,
      answerDef: { type: 'integer', expression: { type: 'operation', op: 'add', args: [{ type: 'variable', name: 'a' }, { type: 'variable', name: 'b' }] } },
      vars: { a: 3, b: 4 },
    });
    expect(r.ok).toBe(true);
  });

  it('answer 不等于表达式结果 → fail', () => {
    const r = mathValidator({
      answer: 100,
      answerDef: { type: 'integer', expression: { type: 'operation', op: 'add', args: [{ type: 'variable', name: 'a' }, { type: 'variable', name: 'b' }] } },
      vars: { a: 3, b: 4 },
    });
    expect(r.ok).toBe(false);
  });
});

describe('answerValidator', () => {
  it('integer 类型 + 整数 → ok', () => {
    expect(answerValidator({ answer: 5, answerDef: { type: 'integer' } }).ok).toBe(true);
  });
  it('integer 类型 + 浮点 → fail', () => {
    expect(answerValidator({ answer: 1.5, answerDef: { type: 'integer' } }).ok).toBe(false);
  });
  it('decimal 类型 + 浮点 → ok', () => {
    expect(answerValidator({ answer: 1.5, answerDef: { type: 'decimal' } }).ok).toBe(true);
  });
});

describe('uniquenessValidator', () => {
  it('当前 batch 内不重复 → ok', () => {
    expect(uniquenessValidator({ hash: 'abc', batchHashes: [] }).ok).toBe(true);
  });
  it('重复 → fail', () => {
    expect(uniquenessValidator({ hash: 'abc', batchHashes: ['abc'] }).ok).toBe(false);
  });
});
