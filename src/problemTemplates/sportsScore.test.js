import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { sportsScoreTemplate } from './sportsScore.js';

describe('sportsScoreTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = sportsScoreTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy: score = win * 3', () => {
    const rng = createRng(1);
    const result = sportsScoreTemplate.generate(rng, 1);
    const { win, score } = result.payload;
    expect(score).toBe(win * 3);
  });
  it('medium (team): score = win*3 + draw', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = sportsScoreTemplate.generate(rng, 2);
      if (result.payload.draw !== undefined) break;
    }
    const { win, draw, score } = result.payload;
    expect(score).toBe(win * 3 + draw);
  });
  it('hard (relay): total = t1 + t2 + t3', () => {
    const rng = createRng(3);
    let result;
    for (let i = 0; i < 50; i++) {
      result = sportsScoreTemplate.generate(rng, 3);
      if (result.payload.t1 !== undefined) break;
    }
    const { t1, t2, t3, total } = result.payload;
    expect(total).toBe(t1 + t2 + t3);
  });
});
