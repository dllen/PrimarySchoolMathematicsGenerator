import { describe, it, expect } from 'vitest';
import { pigeonholeTemplate } from './pigeonhole.js';

const rng = () => ({
  int: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
});

describe('pigeonholeTemplate', () => {
  it('covers 3 bands', () => {
    expect(pigeonholeTemplate.subtemplates).toHaveLength(3);
  });
  it('generates non-null problems', () => {
    for (const sub of pigeonholeTemplate.subtemplates) {
      for (let i = 0; i < 10; i++) {
        const r = sub.generate(rng());
        expect(r.subtype).toBe('pigeonhole');
        expect(r.answer).toBeTruthy();
      }
    }
  });
});

describe('pigeonholeTemplate - math invariants', () => {
  it('pigeon-socks: socks = colors+1 (抽屉原理 n+1)', () => {
    const sub = pigeonholeTemplate.subtemplates.find(s => s.id === 'pigeon-socks');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.socks).toBe(r.payload.colors + 1);
    }
  });
  it('pigeon-seats: people = seats+1 (至少 2 人同椅)', () => {
    const sub = pigeonholeTemplate.subtemplates.find(s => s.id === 'pigeon-seats');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.people).toBe(r.payload.seats + 1);
    }
  });
  it('pigeon-apples: apples = 2*baskets+1', () => {
    const sub = pigeonholeTemplate.subtemplates.find(s => s.id === 'pigeon-apples');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.apples).toBe(2 * r.payload.baskets + 1);
    }
  });
});
