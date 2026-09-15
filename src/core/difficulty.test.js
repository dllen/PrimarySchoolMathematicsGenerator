import { describe, it, expect } from 'vitest';
import { calculateDifficulty, scoreToLevel } from './difficulty.js';

describe('calculateDifficulty', () => {
  it('0 变量 → 0 分', () => {
    const t = { variables: {}, answer: { type: 'integer', expression: { type: 'literal', value: 1 } } };
    expect(calculateDifficulty(t, {})).toBe(0);
  });

  it('3 random + 1 multiply → operationScore=5, variableScore=9, depthScore=4 = 18', () => {
    const t = {
      variables: {
        a: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 1, max: 10 } },
        b: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 1, max: 10 } },
        c: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 1, max: 10 } },
        total: { type: 'derived', valueType: 'integer', expression: { type: 'operation', op: 'multiply', args: [{ type: 'variable', name: 'a' }, { type: 'variable', name: 'b' }] } },
      },
      answer: { type: 'integer', expression: { type: 'variable', name: 'total' } },
    };
    // 4 vars × 3 = 12, 1 op × 5 = 5, depth 1 × 4 = 4 → 21
    expect(calculateDifficulty(t, { a: 1, b: 2, c: 3, total: 2 })).toBe(21);
  });
});

describe('scoreToLevel', () => {
  it('0 → level 1', () => expect(scoreToLevel(0)).toBe(1));
  it('20 → level 1', () => expect(scoreToLevel(20)).toBe(1));
  it('21 → level 2', () => expect(scoreToLevel(21)).toBe(2));
  it('40 → level 2', () => expect(scoreToLevel(40)).toBe(2));
  it('41 → level 3', () => expect(scoreToLevel(41)).toBe(3));
  it('60 → level 3', () => expect(scoreToLevel(60)).toBe(3));
  it('61 → level 4', () => expect(scoreToLevel(61)).toBe(4));
  it('80 → level 4', () => expect(scoreToLevel(80)).toBe(4));
  it('81 → level 5', () => expect(scoreToLevel(81)).toBe(5));
  it('100 → level 5', () => expect(scoreToLevel(100)).toBe(5));
});
