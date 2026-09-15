import { describe, it, expect } from 'vitest';
import { validateTemplate } from './schema.js';

describe('validateTemplate', () => {
  const validPrice = {
    id: 'G3_PRICE_001',
    version: '1.0',
    metadata: { name: '单价数量总价', type: 'word_problem', grade: 3 },
    variables: {
      unitPrice: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 2, max: 20 } },
      quantity: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 2, max: 10 } },
      total: { type: 'derived', valueType: 'integer', expression: { type: 'operation', op: 'multiply', args: [{ type: 'variable', name: 'unitPrice' }, { type: 'variable', name: 'quantity' }] } },
    },
    answer: { type: 'integer', expression: 'total', unit: '元' },
    renderer: { question: '一本{{unitPrice}}元，{{quantity}}本多少钱？' },
  };

  it('合法模板通过', () => {
    expect(validateTemplate(validPrice).ok).toBe(true);
  });

  it('缺 id 失败', () => {
    const t = { ...validPrice };
    delete t.id;
    expect(validateTemplate(t).ok).toBe(false);
  });

  it('缺 variables 失败', () => {
    const t = { ...validPrice };
    delete t.variables;
    expect(validateTemplate(t).ok).toBe(false);
  });

  it('缺 renderer.question 失败', () => {
    const t = { ...validPrice, renderer: {} };
    expect(validateTemplate(t).ok).toBe(false);
  });

  it('缺 answer 失败', () => {
    const t = { ...validPrice };
    delete t.answer;
    expect(validateTemplate(t).ok).toBe(false);
  });

  it('variable 缺 type 失败', () => {
    const t = JSON.parse(JSON.stringify(validPrice));
    delete t.variables.unitPrice.type;
    expect(validateTemplate(t).ok).toBe(false);
  });

describe('reverse strategy validation', () => {
  const baseReverseTpl = {
    id: 'REVERSE_OK',
    metadata: { name: 'reverse ok', type: 'olympiad', grade: 4 },
    variables: {
      target: { type: 'random', valueType: 'integer', role: 'target',
                 generator: { strategy: 'range', min: 1, max: 10 } },
      x: { type: 'random', valueType: 'integer',
           generator: { strategy: 'range', min: 1, max: 10 } },
    },
    answer: { type: 'integer', expression: { type: 'variable', name: 'target' } },
    renderer: { question: '?' },
    generator: { strategy: 'reverse' },
  };

  it('should accept valid template with strategy=reverse + role=target', () => {
    const r = validateTemplate(baseReverseTpl);
    expect(r.ok).toBe(true);
  });

  it('should reject strategy=reverse without any role=target variable', () => {
    const tpl = { ...baseReverseTpl,
                  variables: { x: baseReverseTpl.variables.x },
                  generator: { strategy: 'reverse' } };
    const r = validateTemplate(tpl);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/role='target'/);
  });

  it('should reject role=target on derived variable', () => {
    const tpl = { ...baseReverseTpl,
                  variables: {
                    target: { type: 'derived', valueType: 'integer', role: 'target',
                              expression: { type: 'literal', value: 5 } },
                    x: baseReverseTpl.variables.x,
                  } };
    const r = validateTemplate(tpl);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/type='random'/);
  });

  it('should reject role=target without generator', () => {
    const tpl = { ...baseReverseTpl,
                  variables: {
                    target: { type: 'random', valueType: 'integer', role: 'target' },
                    x: baseReverseTpl.variables.x,
                  } };
    const r = validateTemplate(tpl);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/generator/);
  });

  it('should reject multiple role=target variables', () => {
    const tpl = { ...baseReverseTpl,
                  variables: {
                    t1: { type: 'random', valueType: 'integer', role: 'target',
                          generator: { strategy: 'range', min: 1, max: 5 } },
                    t2: { type: 'random', valueType: 'integer', role: 'target',
                          generator: { strategy: 'range', min: 1, max: 5 } },
                  } };
    const r = validateTemplate(tpl);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/multiple role='target'/);
  });

  it('should still accept existing forward templates (regression)', () => {
    const tpl = {
      id: 'FWD', metadata: { name: 'forward', type: 'word_problem', grade: 3 },
      variables: {
        a: { type: 'random', valueType: 'integer',
             generator: { strategy: 'range', min: 1, max: 10 } },
        b: { type: 'random', valueType: 'integer',
             generator: { strategy: 'range', min: 1, max: 10 } },
      },
      answer: { type: 'integer', expression: { type: 'variable', name: 'a' } },
      renderer: { question: '?' },
    };
    const r = validateTemplate(tpl);
    expect(r.ok).toBe(true);
  });
});
});
