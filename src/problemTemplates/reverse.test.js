import { describe, it, expect } from 'vitest';
import { reverseTemplate } from './reverse.js';

const rng = () => ({
  int: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
});

describe('reverseTemplate', () => {
  it('covers 3 bands', () => {
    expect(reverseTemplate.subtemplates).toHaveLength(3);
  });
  it('generates non-null problems', () => {
    for (const sub of reverseTemplate.subtemplates) {
      for (let i = 0; i < 10; i++) {
        const r = sub.generate(rng());
        if (r.question) {
          expect(r.subtype).toBe('reverse');
          expect(r.answer).toBeTruthy();
        }
      }
    }
  });
});

describe('reverseTemplate - non-empty guarantees', () => {
  it('always returns a non-empty question (no blank titles)', () => {
    for (let i = 0; i < 50; i++) {
      const sub = reverseTemplate.subtemplates[Math.floor(Math.random() * 3)];
      const r = sub.generate(rng());
      expect(r.question).toBeTruthy();
      expect(r.answer).toBeTruthy();
    }
  });
  it('reverse-mul-div: every result has integer after (no broken title)', () => {
    const sub = reverseTemplate.subtemplates.find(s => s.id === 'reverse-mul-div');
    for (let i = 0; i < 30; i++) {
      const r = sub.generate(rng());
      expect(Number.isInteger(r.payload.after)).toBe(true);
      expect(r.question).not.toBe('');
    }
  });
  it('reverse-chain: after = ((start+a)*)*c - b', () => {
    const sub = reverseTemplate.subtemplates.find(s => s.id === 'reverse-chain');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.after).toBe(((r.payload.start + r.payload.a) * r.payload.c) - r.payload.b);
    }
  });
});
