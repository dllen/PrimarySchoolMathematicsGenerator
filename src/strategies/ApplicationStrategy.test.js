import { describe, it, expect } from 'vitest';
import { ApplicationStrategy } from './ApplicationStrategy.js';
import { createRng } from '../utils/rng.js';

describe('ApplicationStrategy', () => {
  const config = {
    grade: '2',
    semester: '上',
    difficulty: 'easy',
  };

  it('returns problems with application shape', () => {
    const s = new ApplicationStrategy(config);
    const result = s.generate(createRng(1));
    expect(result).toMatchObject({
      question: expect.any(String),
      answer: expect.any(String),
      subtype: expect.any(String),
      payload: expect.any(Object),
    });
  });

  it('respects grade filter — grade 5 cannot use shopping (range 1-4) if strict', () => {
    const s = new ApplicationStrategy({ ...config, grade: '5' });
    const seen = new Set();
    for (let i = 0; i < 30; i++) {
      seen.add(s.generate(createRng(i)).subtype);
    }
    expect(seen.has('shopping')).toBe(false);
  });

  it('is deterministic with same seed', () => {
    const s = new ApplicationStrategy(config);
    const a = s.generate(createRng(42));
    const b = s.generate(createRng(42));
    expect(a).toEqual(b);
  });
});
