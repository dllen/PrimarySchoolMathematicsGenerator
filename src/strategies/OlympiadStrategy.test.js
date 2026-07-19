import { describe, it, expect } from 'vitest';
import { OlympiadStrategy } from './OlympiadStrategy.js';
import { createRng } from '../utils/rng.js';

describe('OlympiadStrategy', () => {
  const config = {
    grade: '5',
    semester: '上',
    difficulty: 'medium',
  };

  it('returns olympiad-shape problem', () => {
    const s = new OlympiadStrategy(config);
    const r = s.generate(createRng(3));
    expect(r.subtype).toMatch(/sequence|logic/);
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
});
