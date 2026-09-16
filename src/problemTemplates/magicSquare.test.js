import { describe, it, expect } from 'vitest';
import { magicSquareTemplate } from './magicSquare.js';

const rng = () => ({
  int: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
});

describe('magicSquareTemplate', () => {
  it('covers 3 bands', () => {
    expect(magicSquareTemplate.subtemplates).toHaveLength(3);
  });
  it('generates non-null problems', () => {
    for (const sub of magicSquareTemplate.subtemplates) {
      const r = sub.generate(rng());
      expect(r.subtype).toBe('magic-square');
      expect(r.answer).toBeTruthy();
    }
  });
});

describe('magicSquareTemplate - payload', () => {
  it('easy subtemplate: size=3, kind=center-known', () => {
    const sub = magicSquareTemplate.subtemplates.find(s => s.id === 'magic-3-center');
    const r = sub.generate(rng());
    expect(r.payload.size).toBe(3);
    expect(r.payload.kind).toBe('center-known');
  });
  it('medium subtemplate: row provided and size=3', () => {
    const sub = magicSquareTemplate.subtemplates.find(s => s.id === 'magic-3-row');
    const r = sub.generate(rng());
    expect(r.payload.row).toHaveLength(3);
    expect(r.payload.size).toBe(3);
  });
  it('hard subtemplate: size=4, mentions diagonal-center', () => {
    const sub = magicSquareTemplate.subtemplates.find(s => s.id === 'magic-4');
    const r = sub.generate(rng());
    expect(r.payload.size).toBe(4);
    expect(r.payload.kind).toBe('diagonal-center');
  });
});
