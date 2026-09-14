import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { shareCandyTemplate } from './shareCandy.js';

function findWith(level, predicate, maxIters = 500) {
  for (let i = 0; i < maxIters; i++) {
    const rng = createRng(i * 7 + level * 13);
    const result = shareCandyTemplate.generate(rng, level);
    if (predicate(result.payload)) return result;
  }
  return null;
}

describe('shareCandyTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = shareCandyTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy: total = each * people', () => {
    const rng = createRng(1);
    const result = shareCandyTemplate.generate(rng, 1);
    const { each, people, total } = result.payload;
    expect(total).toBe(each * people);
  });
  it('medium: total = each * people + remain', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = shareCandyTemplate.generate(rng, 2);
      if (result.payload.remain !== undefined) break;
    }
    const { people, each, remain, total } = result.payload;
    expect(total).toBe(people * each + remain);
  });
  it('medium (share-apple): total = each * people + remain', () => {
    const result = findWith(2, p => p.people !== undefined && p.remain !== undefined && p.steps === undefined);
    const { total, each, people, remain } = result.payload;
    expect(total).toBe(each * people + remain);
    expect(result.question).toMatch(/几位小朋友/);
  });
  it('hard: answer survives the stated forward operation', () => {
    // Verify by APPLYING the question's own rule ('每次拿走一半多1颗',
    // i.e. remaining = x/2 - 1) rather than restating the inverse formula.
    for (let i = 0; i < 300; i++) {
      const result = shareCandyTemplate.generate(createRng(i * 31 + 3 * 977), 3);
      const { steps, final, original } = result.payload;
      if (steps === undefined) continue;
      let x = original;
      for (let k = 0; k < steps; k++) {
        expect(x % 2, `original=${original} not divisible at step ${k}`).toBe(0);
        x = x / 2 - 1;
      }
      expect(x, `original=${original} final=${final}`).toBe(final);
    }
  });

  it('share-apple keeps 余数 < 除数', () => {
    // Regression: 每人分到3个，还剩3个 is not a valid remainder.
    for (let i = 0; i < 500; i++) {
      const r = shareCandyTemplate.generate(createRng(i), 2);
      const p = r.payload;
      if (p.remain === undefined || p.each === undefined) continue;
      expect(p.remain, `${r.question} => ${r.answer}`).toBeLessThan(p.each);
    }
  });
});
