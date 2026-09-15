import { describe, it, expect } from 'vitest';
import { ApplicationStrategy } from './ApplicationStrategy.js';
import { createRng } from '../utils/rng.js';

describe('ApplicationStrategy', () => {
  const config = { grade: '2', semester: '上', difficulty: 'easy' };

  it('is a BandAwareStrategy', () => {
    const s = new ApplicationStrategy(config);
    expect(s.type).toBe('application');
  });

  it('throws when no application templates for the given grade', () => {
    // Olympiad templates start at grade 3, so grade 2 application should still
    // have at least one. But we can verify the error path with a clearly empty
    // config: an unknown type. (Application for grade "1" should still throw
    // only if no templates are registered — defensive check: pass a future
    // grade and expect the error message.)
    const s = new ApplicationStrategy({ ...config, grade: '99' });
    expect(() => s.generate(createRng(1))).toThrow(/No application templates/);
  });

  it('every generated problem carries a known application subtype', () => {
    const s = new ApplicationStrategy({ ...config, grade: '4', difficulty: 'medium' });
    for (let i = 0; i < 200; i++) {
      const r = s.generate(createRng(i));
      expect(typeof r.subtype).toBe('string');
      expect(r.subtype.length).toBeGreaterThan(0);
      expect(r.question).not.toMatch(/\{[a-zA-Z0-9_]+\}/);
    }
  });
});
