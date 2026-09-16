import { describe, it, expect } from 'vitest';
import { ageProblemTemplate } from './ageProblem.js';

const rng = () => ({
  int: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
});

describe('ageProblemTemplate', () => {
  it('covers 3 bands', () => {
    expect(ageProblemTemplate.subtemplates).toHaveLength(3);
  });
  it('generates non-null problems', () => {
    for (const sub of ageProblemTemplate.subtemplates) {
      const r = sub.generate(rng());
      expect(r.subtype).toBe('age-problem');
      expect(r.answer).toBeTruthy();
    }
  });
  it('age diff constant: payload diff matches answer', () => {
    const sub = ageProblemTemplate.subtemplates.find(s => s.id === 'age-diff-constant');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.answer).toBe(`${r.payload.diff}岁`);
    }
  });
});

describe('ageProblemTemplate - math invariants', () => {
  it('age-sum-now: sumThen = childNow + parentNow - 2*yearsAgo', () => {
    const sub = ageProblemTemplate.subtemplates.find(s => s.id === 'age-sum-now');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.sumThen).toBe(r.payload.childNow + r.payload.parentNow - 2 * r.payload.yearsAgo);
      expect(r.answer).toBe(`${r.payload.sumThen}岁`);
    }
  });
  it('age-meet-sum: sumThen = aNow + bNow + 2*yearsLater', () => {
    const sub = ageProblemTemplate.subtemplates.find(s => s.id === 'age-meet-sum');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.sumThen).toBe(r.payload.aNow + r.payload.bNow + 2 * r.payload.yearsLater);
    }
  });
  it('uses pickTwoPeople for two-person contexts', () => {
    const sub = ageProblemTemplate.subtemplates.find(s => s.id === 'age-diff-constant');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.question).toMatch(/[一-龥]{2}比[一-龥]{2}大/); // 中文名格式
    }
  });
});
