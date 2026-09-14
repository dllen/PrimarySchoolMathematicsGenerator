import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { distanceTemplate } from './distance.js';

function findWith(level, predicate, maxIters = 500) {
  for (let i = 0; i < maxIters; i++) {
    const rng = createRng(i * 7 + level * 13);
    const result = distanceTemplate.generate(rng, level);
    if (predicate(result.payload)) return result;
  }
  return null;
}

describe('distanceTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = distanceTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy: distance = speed * time', () => {
    const result = findWith(1, p => p.speed !== undefined && p.time !== undefined && p.distance !== undefined && p.speed1 === undefined);
    const { speed, time, distance } = result.payload;
    expect(distance).toBe(speed * time);
  });
  it('medium (meet): distance = (s1+s2) * time', () => {
    const result = findWith(2, p => p.speed1 !== undefined && p.speed2 !== undefined && p.catchUp === undefined);
    const { speed1, speed2, time, distance } = result.payload;
    expect(distance).toBe((speed1 + speed2) * time);
  });
  it('hard (round): distance = (s1+s2) * time', () => {
    const result = findWith(3, p => p.time !== undefined && p.speed1 !== undefined && p.interval === undefined);
    const { speed1, speed2, time, distance } = result.payload;
    expect(distance).toBe((speed1 + speed2) * time);
  });
  it('hard (bus): total = interval * buses', () => {
    const result = findWith(3, p => p.interval !== undefined);
    const { interval, buses, total } = result.payload;
    expect(total).toBe(interval * buses);
  });
});
