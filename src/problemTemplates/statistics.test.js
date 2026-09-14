import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { statisticsTemplate } from './statistics.js';

function findWith(level, predicate, maxIters = 500) {
  for (let i = 0; i < maxIters; i++) {
    const rng = createRng(i * 7 + level * 13);
    const result = statisticsTemplate.generate(rng, level);
    if (predicate(result.payload)) return result;
  }
  return null;
}

describe('statisticsTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = statisticsTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy (mean): mean = total / n', () => {
    const result = findWith(1, p => p.total !== undefined && p.n !== undefined && p.mean !== undefined);
    const { total, n, mean } = result.payload;
    expect(mean).toBeCloseTo(total / n, 1);
  });
  it('medium (mean-reverse): total = n * mean', () => {
    const result = findWith(2, p => p.mean !== undefined && p.total !== undefined);
    const { n, mean, total } = result.payload;
    expect(total).toBe(n * mean);
  });
  it('medium (range): range = max - min', () => {
    const result = findWith(2, p => p.range !== undefined);
    const { max, min, range } = result.payload;
    expect(range).toBe(max - min);
  });
  it('medium (chart-read): max/min match the data', () => {
    const result = findWith(2, p => p.maxClassIdx !== undefined);
    const { data, max, min } = result.payload;
    expect(max).toBe(Math.max(...data));
    expect(min).toBe(Math.min(...data));
    expect(result.answer).toContain(`${max}人`);
    expect(result.answer).toContain(`${min}人`);
  });
  it('hard (compare): diff = |m1 - m2|', () => {
    const result = findWith(3, p => p.m1 !== undefined && p.m2 !== undefined);
    const { m1, m2, diff } = result.payload;
    expect(diff).toBe(Math.round(Math.abs(m1 - m2) * 10) / 10);
  });

  it('hard (compare): ties say "两组一样高", never "高0"', () => {
    // Regression: the answer used m1 > m2 ? '第一组' : '第二组' with no tie
    // branch, so equal averages rendered as '第二组高0'.
    let sawTie = false;
    for (let i = 0; i < 2000; i++) {
      const r = statisticsTemplate.generate(createRng(i * 31 + 3 * 977), 3);
      const { m1, m2 } = r.payload;
      if (m1 === undefined) continue;
      if (m1 === m2) {
        sawTie = true;
        expect(r.answer, r.question).toBe('两组一样高');
      } else {
        expect(r.answer, r.question).not.toMatch(/高0$/);
      }
    }
    expect(sawTie, 'expected at least one tie in 2000 samples').toBe(true);
  });

  it('medium (chart-read): max and min are unique so 最多/最少 is unambiguous', () => {
    // Regression: tied values made '哪个班最多' have two correct answers.
    for (let i = 0; i < 400; i++) {
      const r = statisticsTemplate.generate(createRng(i), 2);
      const p = r.payload;
      if (p.data === undefined || p.maxClassIdx === undefined) continue;
      const maxCount = p.data.filter(v => v === Math.max(...p.data)).length;
      const minCount = p.data.filter(v => v === Math.min(...p.data)).length;
      expect(maxCount, r.question).toBe(1);
      expect(minCount, r.question).toBe(1);
    }
  });
});
