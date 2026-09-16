import { describe, it, expect } from 'vitest';
import { profitLossTemplate } from './profitLoss.js';

const rng = () => ({
  int: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
});

describe('profitLossTemplate', () => {
  it('covers 3 bands', () => {
    expect(profitLossTemplate.subtemplates).toHaveLength(3);
  });
  it('generates non-null problems', () => {
    for (const sub of profitLossTemplate.subtemplates) {
      const r = sub.generate(rng());
      expect(r.subtype).toBe('profit-loss');
      expect(r.answer).toBeTruthy();
    }
  });
});

describe('profitLossTemplate - payload consistency', () => {
  it('profit-short: total = people*perHead + diff', () => {
    const sub = profitLossTemplate.subtemplates.find(s => s.id === 'profit-short');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.total).toBe(r.payload.people * r.payload.perHead + r.payload.diff);
      expect(r.answer).toBe(`${r.payload.perHead}个`);
    }
  });
  it('profit-over: total = people*perHead - diff (mode=over)', () => {
    const sub = profitLossTemplate.subtemplates.find(s => s.id === 'profit-over');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.mode).toBe('over');
      expect(r.payload.total).toBe(r.payload.people * r.payload.perHead - r.payload.diff);
    }
  });
  it('profit-two-conditions: answer references both total and perHead', () => {
    const sub = profitLossTemplate.subtemplates.find(s => s.id === 'profit-two-conditions');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.answer).toContain(`${r.payload.total}`);
      expect(r.answer).toContain(`${r.payload.perHead + 1}`);
    }
  });
});
