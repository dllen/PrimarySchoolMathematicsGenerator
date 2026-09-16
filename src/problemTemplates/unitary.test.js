import { describe, it, expect } from 'vitest';
import { unitaryTemplate } from './unitary.js';

const rng = () => ({
  int: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
});

describe('unitaryTemplate', () => {
  it('covers 3 bands', () => {
    expect(unitaryTemplate.subtemplates).toHaveLength(3);
  });
  it('generates non-null problems', () => {
    for (const sub of unitaryTemplate.subtemplates) {
      const r = sub.generate(rng());
      expect(r.subtype).toBe('unitary');
      expect(r.answer).toBeTruthy();
    }
  });
});

describe('unitaryTemplate - math invariants', () => {
  it('unitary-direct: targetTotal = unit * targetGroups', () => {
    const sub = unitaryTemplate.subtemplates.find(s => s.id === 'unitary-direct');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.targetTotal).toBe(r.payload.unit * r.payload.targetGroups);
      expect(r.answer).toContain(`${r.payload.unit}元`);
      expect(r.answer).toContain(`${r.payload.targetTotal}元`);
    }
  });
  it('unitary-work: perDay = total/days and result = perDay*targetDays', () => {
    const sub = unitaryTemplate.subtemplates.find(s => s.id === 'unitary-work');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.perDay).toBe(r.payload.total / r.payload.days);
      expect(r.payload.result).toBe(r.payload.perDay * r.payload.targetDays);
    }
  });
  it('unitary-reverse: result = unit*targetGroups', () => {
    const sub = unitaryTemplate.subtemplates.find(s => s.id === 'unitary-reverse');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.result).toBe(r.payload.unit * r.payload.targetGroups);
    }
  });
});
