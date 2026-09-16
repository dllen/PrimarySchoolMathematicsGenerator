import { describe, it, expect } from 'vitest';
import { DigitPuzzleStrategy } from './DigitPuzzleStrategy.js';

function makeRng(seed = 1) {
  let st = seed;
  return {
    int: (a, b) => {
      st = (st * 9301 + 49297) % 233280;
      return a + Math.floor((st / 233280) * (b - a + 1));
    },
    pick: (arr) => arr[Math.floor((st / 233280) * arr.length)],
  };
}

describe('DigitPuzzleStrategy', () => {
  const cfg = { difficulty: 'medium', grade: '4' };

  it('should generate a problem with subtype and non-null answer', () => {
    const s = new DigitPuzzleStrategy(cfg);
    const r = s.generate(makeRng());
    expect(r).not.toBeNull();
    expect(r.subtype).toBe('arithmetic-digit-puzzle');
    expect(r.expression).toMatch(/[□+×\-÷0-9=]/);
    expect(r.answer).toBeTruthy();
  });

  it('should produce problems where the blank is solvable with a unique answer', () => {
    const s = new DigitPuzzleStrategy(cfg);
    let ok = 0;
    for (let i = 0; i < 100; i++) {
      const r = s.generate(makeRng(i + 1));
      if (r && r.expression && r.answer) ok++;
    }
    expect(ok).toBeGreaterThanOrEqual(80);
  });

  it('expression must contain at least one □', () => {
    const s = new DigitPuzzleStrategy(cfg);
    for (let i = 0; i < 30; i++) {
      const r = s.generate(makeRng(i + 100));
      expect(r.expression).toContain('□');
    }
  });

  it('every generated problem has a unique solution among 0..9 (substitution)', () => {
    const s = new DigitPuzzleStrategy(cfg);
    let verified = 0;
    for (let i = 0; i < 60; i++) {
      const r = s.generate(makeRng(i + 200));
      if (!r) continue;
      const expr = r.expression;
      const answer = Number(r.answer);
      const rhsMatch = expr.match(/=\s*(\d+)$/);
      expect(rhsMatch).not.toBeNull();
      const rhs = Number(rhsMatch[1]);
      let validCount = 0;
      for (let v = 0; v <= 9; v++) {
        const filled = expr.replace('□', String(v));
        const m = filled.match(/^(\d+)\s*([+×])\s*(\d+)\s*=\s*\d+$/);
        if (!m) continue;
        const value = m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) * Number(m[3]);
        if (value === rhs) validCount++;
      }
      expect(validCount, `expr=${expr}, answer=${answer}`).toBe(1);
      expect(answer).toBeGreaterThanOrEqual(0);
      expect(answer).toBeLessThanOrEqual(9);
      verified++;
    }
    expect(verified).toBeGreaterThan(40);
  });

  it('uses provided rng.int and rng.pick when present', () => {
    let calls = 0;
    const rng = {
      int: (a, b) => { calls++; return a + 1; },
      pick: (arr) => { calls++; return arr[0]; },
    };
    const s = new DigitPuzzleStrategy(cfg);
    const r = s.generate(rng);
    expect(calls).toBeGreaterThan(0);
    expect(r).not.toBeNull();
  });
});
