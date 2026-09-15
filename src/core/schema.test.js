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
});
