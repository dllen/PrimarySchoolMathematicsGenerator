import { describe, it, expect } from 'vitest';
import { sequenceTemplate } from './sequence.js';
import { createRng } from '../utils/rng.js';

describe('sequenceTemplate (arithmetic progression)', () => {
  it('metadata matches spec', () => {
    expect(sequenceTemplate.id).toBe('sequence-arith');
    expect(sequenceTemplate.gradeRange).toEqual(['3', '4', '5', '6']);
  });

  it('produces a valid arithmetic sequence and next term', () => {
    const r = sequenceTemplate.generate(createRng(10), 1);
    const { sequence, commonDiff, nextTerm } = r.payload;
    expect(sequence.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < sequence.length; i++) {
      expect(sequence[i] - sequence[i - 1]).toBe(commonDiff);
    }
    expect(nextTerm).toBe(sequence[sequence.length - 1] + commonDiff);
    expect(r.answer).toBe(`${nextTerm}`);
    expect(r.subtype).toBe('sequence');
  });

  it('length scales with difficulty', () => {
    for (let s = 0; s < 10; s++) {
      const easy = sequenceTemplate.generate(createRng(s), 1);
      const hard = sequenceTemplate.generate(createRng(s), 3);
      expect(hard.payload.sequence.length).toBeGreaterThanOrEqual(easy.payload.sequence.length);
    }
  });
});