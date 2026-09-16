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
  makeRng,
  simplifyFraction,
  formatFraction,
  pickClockTime,
  pickDiscountRate,
  pickSpeedPair,
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


describe('simplifyFraction', () => {
  it('should simplify 4/8 to 1/2', () => {
    expect(simplifyFraction(4, 8)).toEqual({ numerator: 1, denominator: 2 });
  });
  it('should keep negative numerator', () => {
    expect(simplifyFraction(-4, 8)).toEqual({ numerator: -1, denominator: 2 });
  });
  it('should normalize negative denominator', () => {
    expect(simplifyFraction(4, -8)).toEqual({ numerator: -1, denominator: 2 });
  });
  it('should throw on zero denominator', () => {
    expect(() => simplifyFraction(1, 0)).toThrow();
  });
});

describe('formatFraction', () => {
  it('should format integer as plain number', () => {
    expect(formatFraction(5, 1)).toBe('5');
    expect(formatFraction(-3, 1)).toBe('-3');
  });
  it('should format proper fraction', () => {
    expect(formatFraction(1, 2)).toBe('1/2');
  });
  it('should format improper fraction as mixed', () => {
    expect(formatFraction(7, 3)).toBe('2 1/3');
  });
  it('should format negative improper fraction', () => {
    expect(formatFraction(-7, 3)).toBe('-2 1/3');
  });
});

describe('makeRng', () => {
  it('falls back to Math.random when rng is undefined', () => {
    const r = makeRng(undefined);
    const v = r.int(5, 10);
    expect(v).toBeGreaterThanOrEqual(5);
    expect(v).toBeLessThanOrEqual(10);
  });
  it('falls back to Math.random when rng has no .int', () => {
    const r = makeRng({});
    const v = r.int(1, 3);
    expect(v).toBeGreaterThanOrEqual(1);
    expect(v).toBeLessThanOrEqual(3);
  });
  it('uses provided rng.int and rng.pick when present', () => {
    let calls = 0;
    const r = makeRng({
      int: (a, b) => { calls++; return a + 1; },
      pick: (arr) => { calls++; return arr[0]; },
    });
    expect(r.int(0, 9)).toBe(1);
    expect(r.pick(['a', 'b'])).toBe('a');
    expect(calls).toBe(2);
  });
});

describe('pickClockTime', () => {
  it('returns valid HH:MM string', () => {
    const rng = createRng(1);
    for (let i = 0; i < 20; i++) {
      const t = pickClockTime(rng, 'medium');
      expect(t).toMatch(/^([01]?\d|2[0-3]):[0-5]\d$/);
    }
  });
  it('clamps hour to 0-23', () => {
    const rng = createRng(2);
    for (let i = 0; i < 50; i++) {
      const t = pickClockTime(rng, 'hard');
      const [h] = t.split(':').map(Number);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(24);
    }
  });
  it('easy band produces only :00 minutes (整点)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 30; i++) {
      const t = pickClockTime(rng, 'easy');
      expect(t.endsWith(':00')).toBe(true);
    }
  });
  it('medium band produces only multiples of 5 minutes', () => {
    const rng = createRng(8);
    for (let i = 0; i < 50; i++) {
      const t = pickClockTime(rng, 'medium');
      const [, mm] = t.split(':');
      expect(mm).toMatch(/^(00|05|10|15|20|25|30|35|40|45|50|55)$/);
    }
  });
});

describe('pickDiscountRate', () => {
  it('returns rate in [0.5, 0.95]', () => {
    const rng = createRng(3);
    for (let i = 0; i < 30; i++) {
      const r = pickDiscountRate(rng, 'medium');
      expect(r).toBeGreaterThanOrEqual(0.5);
      expect(r).toBeLessThanOrEqual(0.95);
    }
  });
  it('mean(easy) < mean(hard) over 100 samples per band (deep discount vs small)', () => {
    const sample = (band, seed) => {
      const rng = createRng(seed);
      let sum = 0;
      const n = 100;
      for (let i = 0; i < n; i++) sum += pickDiscountRate(rng, band);
      return sum / n;
    };
    const meanEasy = sample('easy', 11);
    const meanHard = sample('hard', 13);
    expect(meanEasy).toBeLessThan(meanHard);
    // sanity bounds: easy mean ∈ [0.5, 0.7], hard mean ∈ [0.75, 0.95]
    expect(meanEasy).toBeGreaterThanOrEqual(0.5);
    expect(meanEasy).toBeLessThanOrEqual(0.7);
    expect(meanHard).toBeGreaterThanOrEqual(0.75);
    expect(meanHard).toBeLessThanOrEqual(0.95);
  });
});

describe('pickSpeedPair', () => {
  it('returns two distinct positive integers', () => {
    const rng = createRng(4);
    for (let i = 0; i < 20; i++) {
      const [a, b] = pickSpeedPair(rng, 'medium');
      expect(a).toBeGreaterThan(0);
      expect(b).toBeGreaterThan(0);
      expect(a).not.toBe(b);
    }
  });
  it('respects band scaling', () => {
    const rngEasy = createRng(5);
    const rngHard = createRng(5);
    const [aEasy] = pickSpeedPair(rngEasy, 'easy');
    const [aHard] = pickSpeedPair(rngHard, 'hard');
    expect(aHard).toBeGreaterThanOrEqual(aEasy);
  });
  it('mean(easy) < mean(hard) over 200 samples per band (scaled km/h range)', () => {
    const sample = (band, seed) => {
      const rng = createRng(seed);
      let sum = 0;
      const n = 200;
      for (let i = 0; i < n; i++) {
        const [a, b] = pickSpeedPair(rng, band);
        sum += (a + b) / 2;
      }
      return sum / n;
    };
    const meanEasy = sample('easy', 21);
    const meanHard = sample('hard', 23);
    expect(meanEasy).toBeLessThan(meanHard);
    // easy ∈ [15, 60] (floor(30*0.5)=15, floor(120*0.5)=60) → midpoint ≈ 37.5
    expect(meanEasy).toBeGreaterThanOrEqual(15);
    expect(meanEasy).toBeLessThanOrEqual(60);
    // hard ∈ [54, 216] (floor(30*1.8)=54, floor(120*1.8)=216) → midpoint ≈ 135
    expect(meanHard).toBeGreaterThanOrEqual(54);
    expect(meanHard).toBeLessThanOrEqual(216);
  });
});
