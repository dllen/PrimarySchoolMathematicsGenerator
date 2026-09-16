import { describe, it, expect } from 'vitest';
import { QuickMathStrategy } from './QuickMathStrategy.js';

describe('QuickMathStrategy', () => {
  const cfg = { difficulty: 'medium', grade: '3' };

  it('should generate a quick-math problem', () => {
    const s = new QuickMathStrategy(cfg);
    const r = s.generate();
    expect(r).not.toBeNull();
    expect(r.subtype).toBe('arithmetic-quick-math');
    expect(r.expression).toContain('=');
    expect(r.answer).toBeTruthy();
  });

  it('quick-math result equals naive evaluation', () => {
    const s = new QuickMathStrategy(cfg);
    for (let i = 0; i < 50; i++) {
      const r = s.generate();
      // 抽取纯数字表达式
      const m = r.expression.match(/[-+*\/()\d\s]+/);
      if (m) {
        const naive = Function(`return ${m[0].trim()}`)();
        expect(Number(r.answer)).toBe(naive);
      }
    }
  });

  it('expression mentions 凑十 / 凑百 / 凑整 (at least one in 50 trials)', () => {
    const s = new QuickMathStrategy(cfg);
    const labels = ['凑十', '凑百', '凑整'];
    let found = 0;
    for (let i = 0; i < 50; i++) {
      const r = s.generate();
      if (labels.some(l => r.expression.includes(l))) found++;
    }
    expect(found).toBeGreaterThan(0);
  });
});

describe('QuickMathStrategy - method coverage', () => {
  const cfg = { difficulty: 'medium', grade: '3' };
  it('produces 凑十 / 凑百 / 凑整 across many runs', () => {
    const s = new QuickMathStrategy(cfg);
    const labels = new Set();
    for (let i = 0; i < 100; i++) {
      const r = s.generate();
      const m = r.expression.match(/凑十法|凑百法|凑整/);
      if (m) labels.add(m[0]);
    }
    expect(labels.size).toBeGreaterThanOrEqual(2);
  });
  it('answer equals naive evaluation', () => {
    const s = new QuickMathStrategy(cfg);
    for (let i = 0; i < 30; i++) {
      const r = s.generate();
      const m = r.expression.match(/^(\d+)\s*\+\s*(\d+)/);
      expect(m).not.toBeNull();
      const a = Number(m[1]), b = Number(m[2]);
      expect(r.answer).toBe(a + b);
    }
  });
  it('uses provided rng.int', () => {
    let calls = 0;
    const rng = { int: (a, b) => { calls++; return a + 1; } };
    const s = new QuickMathStrategy(cfg);
    const r = s.generate(rng);
    expect(calls).toBeGreaterThan(0);
    expect(r.subtype).toBe('arithmetic-quick-math');
  });
});
