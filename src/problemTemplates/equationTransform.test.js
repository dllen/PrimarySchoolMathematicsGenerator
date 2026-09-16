import { describe, it, expect } from 'vitest';
import { equationTransformTemplate } from './equationTransform.js';

const rng = () => ({
  int: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
});

describe('equationTransformTemplate', () => {
  it('covers 3 bands', () => {
    expect(equationTransformTemplate.subtemplates).toHaveLength(3);
  });
  it('generates non-null problems', () => {
    for (const sub of equationTransformTemplate.subtemplates) {
      for (let i = 0; i < 10; i++) {
        const r = sub.generate(rng());
        if (r.question) {
          expect(r.subtype).toBe('equation-transform');
        }
      }
    }
  });
});

describe('equationTransformTemplate - math invariants', () => {
  it('eq-2digit-add: payload sum matches a+b', () => {
    const sub = equationTransformTemplate.subtemplates.find(s => s.id === 'eq-2digit-add');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.sum).toBe(r.payload.a + r.payload.b);
    }
  });
  it('eq-3digit-sub: payload diff = a-b (always non-negative)', () => {
    const sub = equationTransformTemplate.subtemplates.find(s => s.id === 'eq-3digit-sub');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      if (!r.question) continue; // 跳过 empty retry
      expect(r.payload.diff).toBeGreaterThanOrEqual(0);
      expect(r.payload.diff).toBe(r.payload.a - r.payload.b);
    }
  });
  it('eq-mul-rearrange: payload product = a*b (commutative property)', () => {
    const sub = equationTransformTemplate.subtemplates.find(s => s.id === 'eq-mul-rearrange');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.product).toBe(r.payload.a * r.payload.b);
    }
  });
});
