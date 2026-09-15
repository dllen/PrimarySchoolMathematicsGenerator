import { describe, it, expect } from 'vitest';
import { OlympiadStrategy } from './OlympiadStrategy.js';
import { createRng } from '../utils/rng.js';

describe('OlympiadStrategy', () => {
  const config = { grade: '5', semester: '上', difficulty: 'medium' };

  it('is a BandAwareStrategy', () => {
    const s = new OlympiadStrategy(config);
    expect(s.type).toBe('olympiad');
  });

  it('grade 2 cannot use olympiad templates (range starts at 3)', () => {
    const s = new OlympiadStrategy({ ...config, grade: '2' });
    expect(() => s.generate(createRng(1))).toThrow(/No olympiad templates/);
  });

  it('difficulty scales with level', () => {
    const easy = new OlympiadStrategy({ ...config, difficulty: 'easy' });
    const hard = new OlympiadStrategy({ ...config, difficulty: 'hard' });
    expect(easy.difficultyLevel).toBe(1);
    expect(hard.difficultyLevel).toBe(3);
  });

  it('respects difficulty: easy never yields a hard-band subtemplate', () => {
    // Same integration defect the original test caught: band was inert.
    // The number-theory hard signature mentions "求最小的正整数x".
    const easy = new OlympiadStrategy({ ...config, grade: '5', difficulty: 'easy' });
    for (let i = 0; i < 2000; i++) {
      const q = easy.generate(createRng(i)).question;
      expect(q).not.toMatch(/这个数最小是多少/);
    }
  });
});
