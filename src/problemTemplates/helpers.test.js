import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import {
  BANDS,
  levelToBand,
  pickNumberByBand,
  pickPairByBand,
  pickPerson,
  assertInRange,
} from './helpers.js';

describe('BANDS', () => {
  it('exports the three canonical bands in order', () => {
    expect(BANDS).toEqual(['easy', 'medium', 'hard']);
  });
});

describe('levelToBand', () => {
  it('maps 1 → easy', () => { expect(levelToBand(1)).toBe('easy'); });
  it('maps 2 → medium', () => { expect(levelToBand(2)).toBe('medium'); });
  it('maps 3 → hard', () => { expect(levelToBand(3)).toBe('hard'); });
  it('falls back to medium for unknown levels', () => {
    expect(levelToBand(0)).toBe('medium');
    expect(levelToBand(99)).toBe('medium');
    expect(levelToBand(undefined)).toBe('medium');
  });
});

describe('pickNumberByBand', () => {
  it('easy: values fall in [floor(min*0.5), floor(max*0.5)]', () => {
    const rng = createRng(42);
    for (let i = 0; i < 50; i++) {
      const v = pickNumberByBand(rng, 'easy', { min: 4, max: 20 });
      expect(v).toBeGreaterThanOrEqual(2);
      expect(v).toBeLessThanOrEqual(10);
    }
  });
  it('medium: values fall in [min, max]', () => {
    const rng = createRng(42);
    for (let i = 0; i < 50; i++) {
      const v = pickNumberByBand(rng, 'medium', { min: 4, max: 20 });
      expect(v).toBeGreaterThanOrEqual(4);
      expect(v).toBeLessThanOrEqual(20);
    }
  });
  it('hard: values fall in [floor(min*1.8), floor(max*1.8)]', () => {
    const rng = createRng(42);
    for (let i = 0; i < 50; i++) {
      const v = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
      expect(v).toBeGreaterThanOrEqual(18);
      expect(v).toBeLessThanOrEqual(54);
    }
  });
  it('clamps easy lower bound to >= 1', () => {
    const rng = createRng(1);
    for (let i = 0; i < 50; i++) {
      const v = pickNumberByBand(rng, 'easy', { min: 1, max: 4 });
      expect(v).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('pickPairByBand', () => {
  it('returns two distinct integers in the same band-scaled range', () => {
    const rng = createRng(42);
    for (let i = 0; i < 50; i++) {
      const [a, b] = pickPairByBand(rng, 'medium', { min: 5, max: 50 });
      expect(a).not.toBe(b);
      expect(a).toBeGreaterThanOrEqual(5);
      expect(a).toBeLessThanOrEqual(50);
      expect(b).toBeGreaterThanOrEqual(5);
      expect(b).toBeLessThanOrEqual(50);
    }
  });
});

describe('pickPerson', () => {
  it('returns a non-empty Chinese name from the pool', () => {
    const rng = createRng(42);
    for (let i = 0; i < 30; i++) {
      const name = pickPerson(rng);
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('assertInRange', () => {
  it('passes silently when value is in [lo, hi]', () => {
    expect(() => assertInRange(5, 1, 10, 'test')).not.toThrow();
  });
  it('throws when value is below lo', () => {
    expect(() => assertInRange(0, 1, 10, 'n')).toThrow(/n.*0.*1.*10/);
  });
  it('throws when value is above hi', () => {
    expect(() => assertInRange(11, 1, 10, 'n')).toThrow(/n.*11.*1.*10/);
  });
});
