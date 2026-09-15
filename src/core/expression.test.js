import { describe, it, expect } from 'vitest';
import { evaluate } from './expression.js';

describe('evaluate', () => {
  it('literal 求值', () => {
    expect(evaluate({ type: 'literal', value: 42 }, { vars: {} }).value).toBe(42);
  });

  it('variable 引用', () => {
    expect(evaluate({ type: 'variable', name: 'a' }, { vars: { a: 5 } }).value).toBe(5);
  });

  it('operation 加法', () => {
    const expr = { type: 'operation', op: 'add', args: [
      { type: 'literal', value: 2 },
      { type: 'literal', value: 3 },
    ]};
    expect(evaluate(expr, { vars: {} }).value).toBe(5);
  });

  it('operation 嵌套', () => {
    const expr = { type: 'operation', op: 'multiply', args: [
      { type: 'operation', op: 'add', args: [
        { type: 'literal', value: 2 },
        { type: 'literal', value: 3 },
      ]},
      { type: 'literal', value: 4 },
    ]};
    expect(evaluate(expr, { vars: {} }).value).toBe(20);
  });

  it('operation 除法', () => {
    const expr = { type: 'operation', op: 'divide', args: [
      { type: 'literal', value: 10 },
      { type: 'literal', value: 2 },
    ]};
    expect(evaluate(expr, { vars: {} }).value).toBe(5);
  });

  it('operation 除零返回 ok:false', () => {
    const expr = { type: 'operation', op: 'divide', args: [
      { type: 'literal', value: 10 },
      { type: 'literal', value: 0 },
    ]};
    const r = evaluate(expr, { vars: {} });
    expect(r.ok).toBe(false);
  });

  it('operation remainder', () => {
    const expr = { type: 'operation', op: 'remainder', args: [
      { type: 'literal', value: 10 },
      { type: 'literal', value: 3 },
    ]};
    expect(evaluate(expr, { vars: {} }).value).toBe(1);
  });

  it('conditional 三元', () => {
    const expr = {
      type: 'conditional',
      condition: { type: 'literal', value: true },
      then: { type: 'literal', value: 'yes' },
      else: { type: 'literal', value: 'no' },
    };
    expect(evaluate(expr, { vars: {} }).value).toBe('yes');
  });

  it('未定义变量返回 ok:false', () => {
    const r = evaluate({ type: 'variable', name: 'missing' }, { vars: {} });
    expect(r.ok).toBe(false);
  });

  it('未知 op 返回 ok:false', () => {
    const expr = { type: 'operation', op: 'unknown', args: [] };
    expect(evaluate(expr, { vars: {} }).ok).toBe(false);
  });
});
