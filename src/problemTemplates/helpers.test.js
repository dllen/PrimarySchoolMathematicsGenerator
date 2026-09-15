import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import {
  BANDS,
  levelToBand,
  pickNumberByBand,
  pickPairByBand,
  pickPerson,
  pickPeople,
  pickTwoPeople,
  pickForBand,
  gcd,
  pickTwoSpeeds,
  pickRatio,
  factorial,
  perm,
  comb,
  lcm,
  isPrime,
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

describe('pickPeople', () => {
  it('draws n distinct names without replacement', () => {
    const rng = createRng(42);
    for (let i = 0; i < 50; i++) {
      const names = pickPeople(rng, 3);
      expect(names).toHaveLength(3);
      expect(new Set(names).size).toBe(3);
    }
  });
  it('caps at the pool size', () => {
    const rng = createRng(7);
    expect(pickPeople(rng, 99)).toHaveLength(12);
  });
});

describe('pickForBand', () => {
  it('selects a subtemplate whose band matches the difficulty level', () => {
    const template = {
      id: 'fake',
      subtemplates: [
        { band: 'easy', generate: () => ({ tag: 'easy' }) },
        { band: 'medium', generate: () => ({ tag: 'medium' }) },
        { band: 'hard', generate: () => ({ tag: 'hard' }) },
      ],
    };
    expect(pickForBand(template, 1, createRng(1)).tag).toBe('easy');
    expect(pickForBand(template, 2, createRng(2)).tag).toBe('medium');
    expect(pickForBand(template, 3, createRng(3)).tag).toBe('hard');
  });
  it('throws a named error when a band has no subtemplates', () => {
    const template = {
      id: 'holey',
      subtemplates: [{ band: 'easy', generate: () => ({}) }],
    };
    expect(() => pickForBand(template, 3, createRng(1))).toThrow(
      /No subtemplates for band=hard in template=holey/
    );
  });
  it('返回结果附带 subtemplateId 与 band', () => {
    const template = {
      id: 'fake',
      subtemplates: [
        { id: 'fake-easy-1', band: 'easy', generate: () => ({ tag: 'e1' }) },
        { id: 'fake-easy-2', band: 'easy', generate: () => ({ tag: 'e2' }) },
        { id: 'fake-hard-1', band: 'hard', generate: () => ({ tag: 'h1' }) },
      ],
    };
    const easy = pickForBand(template, 1, createRng(1));
    expect(easy.subtemplateId).toMatch(/^fake-easy-\d$/);
    expect(easy.band).toBe('easy');
    expect(easy.tag).toBeDefined(); // 兼容旧字段
    const hard = pickForBand(template, 3, createRng(2));
    expect(hard.subtemplateId).toBe('fake-hard-1');
    expect(hard.band).toBe('hard');
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

describe('band helpers: degenerate ranges', () => {
  it('pickNumberByBand never returns a value above hi', () => {
    const rng = createRng(1);
    for (let i = 0; i < 20; i++) {
      expect(pickNumberByBand(rng, 'easy', { min: 0, max: 0 })).toBe(1);
    }
  });
  it('pickPairByBand throws instead of silently returning equal values', () => {
    const rng = createRng(1);
    expect(() => pickPairByBand(rng, 'easy', { min: 1, max: 1 })).toThrow(
      /cannot draw two distinct values/
    );
  });
});
});

