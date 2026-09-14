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

  it('respects difficulty: easy never yields a hard-band subtemplate', () => {
    // Regression: the strategy used to rng.pick(tpl.subtemplates) directly,
    // bypassing tpl.generate() and so ignoring the band entirely. The
    // red-packet hard variant is identifiable by asking for the unknown packet.
    const HARD_SIGNATURE = /另一个多少元的红包/;
    const easy = new ApplicationStrategy({ ...config, grade: '3', difficulty: 'easy' });
    const hard = new ApplicationStrategy({ ...config, grade: '3', difficulty: 'hard' });

    let easyHard = 0;
    for (let i = 0; i < 3000; i++) {
      if (HARD_SIGNATURE.test(easy.generate(createRng(i)).question)) easyHard++;
    }
    expect(easyHard, 'easy band leaked a hard-band problem').toBe(0);

    let hardHard = 0;
    for (let i = 0; i < 3000; i++) {
      if (HARD_SIGNATURE.test(hard.generate(createRng(i)).question)) hardHard++;
    }
    expect(hardHard, 'hard band never produced its own subtemplate').toBeGreaterThan(0);
  });

  it('every generated problem carries a known application subtype', () => {
    const s2 = new ApplicationStrategy({ ...config, grade: '4', difficulty: 'medium' });
    for (let i = 0; i < 500; i++) {
      const r = s2.generate(createRng(i));
      expect(typeof r.subtype).toBe('string');
      expect(r.subtype.length).toBeGreaterThan(0);
      expect(r.question).not.toMatch(/\{[a-zA-Z0-9_]+\}/);
    }
  });
});
