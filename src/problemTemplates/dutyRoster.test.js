import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { dutyRosterTemplate } from './dutyRoster.js';

describe('dutyRosterTemplate', () => {
  for (const band of ['easy', 'hard']) {
    it(`${band}: (today + later) % 7 matches answer`, () => {
      const level = band === 'easy' ? 1 : 3;
      const rng = createRng(band);
      const result = dutyRosterTemplate.generate(rng, level);
      const { today, later, target } = result.payload;
      expect((today + later) % 7).toBe(target);
    });
  }
  it('medium: K % 5 = dayIndex', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = dutyRosterTemplate.generate(rng, 2);
      if (result.payload.K !== undefined) break;
    }
    const { K, cycle, dayIndex } = result.payload;
    expect(K % cycle).toBe(dayIndex);
  });
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = dutyRosterTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }

  it('never renders the literal "undefined" in question or answer', () => {
    // Regression: hard band used pickNumberByBand(0..4), which scales to 0..7
    // and indexed past the 7-element WEEKDAYS array.
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 500; i++) {
        const result = dutyRosterTemplate.generate(createRng(i * 7 + level * 13), level);
        expect(result.question, `seed=${i} level=${level}`).not.toContain('undefined');
        expect(result.answer, `seed=${i} level=${level}`).not.toContain('undefined');
      }
    }
  });
});
