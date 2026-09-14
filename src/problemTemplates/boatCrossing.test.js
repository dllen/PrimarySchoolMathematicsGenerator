import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { boatCrossingTemplate } from './boatCrossing.js';

describe('boatCrossingTemplate', () => {
  for (const band of ['easy', 'medium']) {
    it(`${band}: boats = ceil(people / perBoat)`, () => {
      const level = band === 'easy' ? 1 : 2;
      const rng = createRng(band);
      const result = boatCrossingTemplate.generate(rng, level);
      const { people, perBoat, boats } = result.payload;
      expect(boats).toBe(Math.ceil(people / perBoat));
    });
    it(`${band}: answer is non-empty`, () => {
      const level = band === 'easy' ? 1 : 2;
      const rng = createRng(band);
      const result = boatCrossingTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('hard: total1 = boats1 * pricePerBoat', () => {
    const rng = createRng(3);
    const result = boatCrossingTemplate.generate(rng, 3);
    const { boats1, pricePerBoat, total1 } = result.payload;
    expect(total1).toBe(boats1 * pricePerBoat);
  });
  it('hard: answer is non-empty', () => {
    const rng = createRng(3);
    const result = boatCrossingTemplate.generate(rng, 3);
    expect(typeof result.answer).toBe('string');
    expect(result.answer.length).toBeGreaterThan(0);
  });
});
