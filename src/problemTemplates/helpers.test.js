import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import {
  BANDS,
  levelToBand,
  pickNumberByBand,
  pickPairByBand,
  pickPerson,
  pickTwoPeople,
  gcd,
  pickTwoSpeeds,
  pickRatio,
  factorial,
  perm,
  comb,
  lcm,
  isPrime,
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

describe('pickTwoPeople', () => {
  it('returns two distinct Chinese names', () => {
    const rng = createRng(42);
    for (let i = 0; i < 50; i++) {
      const [a, b] = pickTwoPeople(rng);
      expect(a).not.toBe(b);
      expect(typeof a).toBe('string');
      expect(typeof b).toBe('string');
    }
  });
});

describe('gcd', () => {
  it('computes gcd correctly', () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(8, 12)).toBe(4);
    expect(gcd(7, 5)).toBe(1);
    expect(gcd(100, 75)).toBe(25);
  });
  it('handles gcd with zero', () => {
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(5, 0)).toBe(5);
  });
});

describe('pickTwoSpeeds', () => {
  it('returns two distinct values in band-scaled range', () => {
    const rng = createRng(42);
    for (let i = 0; i < 30; i++) {
      const { speed1, speed2 } = pickTwoSpeeds(rng, 'medium', { min: 50, max: 120 });
      expect(speed1).not.toBe(speed2);
      expect(speed1).toBeGreaterThanOrEqual(50);
      expect(speed1).toBeLessThanOrEqual(120);
    }
  });
});

describe('pickRatio', () => {
  it('returns a ratio with gcd 1', () => {
    const rng = createRng(42);
    for (let i = 0; i < 50; i++) {
      const { a, b } = pickRatio(rng, 'medium');
      expect(gcd(a, b)).toBe(1);
    }
  });
});

describe('factorial', () => {
  it('computes small factorials', () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(1)).toBe(1);
    expect(factorial(5)).toBe(120);
    expect(factorial(6)).toBe(720);
  });
  it('rejects n > 6 to avoid overflow', () => {
    expect(() => factorial(7)).toThrow(/n must be <= 6/);
  });
});

describe('perm', () => {
  it('computes permutations A(n,r)', () => {
    expect(perm(5, 2)).toBe(20);
    expect(perm(6, 3)).toBe(120);
    expect(perm(4, 4)).toBe(24);
  });
});

describe('comb', () => {
  it('computes combinations C(n,r)', () => {
    expect(comb(5, 2)).toBe(10);
    expect(comb(6, 3)).toBe(20);
    expect(comb(6, 0)).toBe(1);
  });
});

describe('lcm', () => {
  it('computes least common multiple', () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(3, 5)).toBe(15);
    expect(lcm(12, 18)).toBe(36);
  });
});

describe('isPrime', () => {
  it('identifies primes and non-primes', () => {
    expect(isPrime(2)).toBe(true);
    expect(isPrime(7)).toBe(true);
    expect(isPrime(13)).toBe(true);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(0)).toBe(false);
    expect(isPrime(8)).toBe(false);
    expect(isPrime(15)).toBe(false);
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
