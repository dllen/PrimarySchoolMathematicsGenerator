import { describe, it, expect } from 'vitest';
import { FractionArithmeticStrategy } from './FractionArithmeticStrategy.js';
import { simplifyFraction } from '../problemTemplates/helpers.js';

/** 把策略的 answer 字符串解析为 (num, den)。支持 "a"、"a/b"、"a b/c"。 */
function parseAnswer(answer) {
  const trimmed = answer.trim();
  // 带分数 "a b/c" 或 "a-b/c"
  const m1 = trimmed.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (m1) {
    const whole = Number(m1[1]);
    const bn = Number(m1[2]);
    const bd = Number(m1[3]);
    return [whole * bd + bn, bd];
  }
  // 真分数 "a/b"
  const m2 = trimmed.match(/^(-?\d+)\/(\d+)$/);
  if (m2) return [Number(m2[1]), Number(m2[2])];
  // 整数
  return [Number(trimmed), 1];
}

describe('FractionArithmeticStrategy', () => {
  const cfg = { difficulty: 'medium', grade: '5' };

  it('should generate fraction addition/subtraction/mul', () => {
    const s = new FractionArithmeticStrategy(cfg);
    const r = s.generate();
    expect(r).not.toBeNull();
    expect(r.subtype).toBe('arithmetic-fraction');
    expect(r.expression).toMatch(/\d+\/\d+/);
    expect(r.answer).toMatch(/^(\d+\/\d+|-?\d+\s\d+\/\d+|-?\d+)$/);
  });

  it('answer equals exact integer computation', () => {
    const s = new FractionArithmeticStrategy(cfg);
    for (let i = 0; i < 100; i++) {
      const r = s.generate();
      const m = r.expression.match(/(-?\d+)\/(\d+)\s*([+\-×÷])\s*(-?\d+(?:\/\d+)?)/);
      expect(m).not.toBeNull();
      const [, an, ad, op, bs] = m;
      const A_n = Number(an), A_d = Number(ad);
      let B_n, B_d;
      if (bs.includes('/')) {
        const [bn, bd] = bs.split('/').map(Number);
        B_n = bn; B_d = bd;
      } else {
        B_n = Number(bs); B_d = 1;
      }
      let rNum, rDen;
      if (op === '+') { rDen = A_d * B_d; rNum = A_n * B_d + B_n * A_d; }
      else if (op === '-') { rDen = A_d * B_d; rNum = A_n * B_d - B_n * A_d; }
      else { rDen = A_d * B_d; rNum = A_n * B_n; }
      const expected = simplifyFraction(rNum, rDen);
      const [aNum, aDen] = parseAnswer(r.answer);
      const actual = simplifyFraction(aNum, aDen);
      expect(actual).toEqual(expected);
    }
  });

  it('answer fraction form is already simplified', () => {
    const s = new FractionArithmeticStrategy(cfg);
    for (let i = 0; i < 30; i++) {
      const r = s.generate();
      const [num, den] = parseAnswer(r.answer);
      const s1 = simplifyFraction(num, den);
      expect(s1.numerator).toBe(num);
      expect(s1.denominator).toBe(den);
    }
  });
});

describe('FractionArithmeticStrategy - branches', () => {
  const cfg = { difficulty: 'medium', grade: '5' };

  it('produces all three operators across many runs', () => {
    const s = new FractionArithmeticStrategy(cfg);
    const ops = new Set();
    for (let i = 0; i < 100; i++) {
      const r = s.generate();
      ops.add(r.payload.op);
    }
    expect(ops).toContain('+');
    expect(ops).toContain('-');
    expect(ops).toContain('×');
  });

  it('uses provided rng (rng integration)', () => {
    let calls = 0;
    const rng = {
      int: (a, b) => { calls++; return a; },
      pick: (arr) => { calls++; return arr[0]; },
    };
    const s = new FractionArithmeticStrategy(cfg);
    const r = s.generate(rng);
    expect(calls).toBeGreaterThan(0);
    expect(r.subtype).toBe('arithmetic-fraction');
  });
});
