import { describe, it, expect } from 'vitest';
import { DecimalArithmeticStrategy } from './DecimalArithmeticStrategy.js';

describe('DecimalArithmeticStrategy', () => {
  const cfg = { difficulty: 'medium', grade: '5' };

  it('should generate decimal add/sub/mul', () => {
    const s = new DecimalArithmeticStrategy(cfg);
    const r = s.generate();
    expect(r).not.toBeNull();
    expect(r.subtype).toBe('arithmetic-decimal');
    expect(r.expression).toMatch(/\d+\.\d+/);
  });

  it('answer equals evaluated expression', () => {
    const s = new DecimalArithmeticStrategy(cfg);
    for (let i = 0; i < 80; i++) {
      const r = s.generate();
      const expr = r.expression.replace(/\s*=\s*\?$/, '');
      const m = expr.match(/(-?\d+(?:\.\d+)?)\s*([+\-×])\s*(-?\d+(?:\.\d+)?)/);
      expect(m).not.toBeNull();
      const [, A, op, B] = m;
      const result = op === '+' ? Number(A) + Number(B)
        : op === '-' ? Number(A) - Number(B)
        : Number(A) * Number(B);
      expect(Number(r.answer)).toBeCloseTo(result, 3);
    }
  });
});

describe('DecimalArithmeticStrategy - branches', () => {
  const cfg = { difficulty: 'medium', grade: '5' };
  it('produces all three operators over many runs', () => {
    const s = new DecimalArithmeticStrategy(cfg);
    const ops = new Set();
    for (let i = 0; i < 100; i++) {
      const r = s.generate();
      ops.add(r.payload.op);
    }
    expect(ops).toContain('+');
    expect(ops).toContain('-');
    expect(ops).toContain('×');
  });
  it('subtraction branch always has positive answer', () => {
    const s = new DecimalArithmeticStrategy(cfg);
    for (let i = 0; i < 50; i++) {
      const r = s.generate();
      if (r.payload.op === '-') {
        expect(Number(r.answer)).toBeGreaterThanOrEqual(0);
      }
    }
  });
  it('display uses consistent digit width for subtraction', () => {
    const s = new DecimalArithmeticStrategy(cfg);
    for (let i = 0; i < 30; i++) {
      const r = s.generate();
      if (r.payload.op === '-') {
        const m = r.expression.match(/(-?\d+\.\d+)\s*-\s*(-?\d+\.\d+)/);
        if (m) {
          const dA = m[1].split('.')[1].length;
          const dB = m[2].split('.')[1].length;
          expect(dA).toBe(dB);
        }
      }
    }
  });
});
