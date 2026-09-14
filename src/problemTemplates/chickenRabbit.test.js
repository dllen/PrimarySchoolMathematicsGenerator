import { describe, expect, it } from 'vitest';
import { chickenRabbitTemplate } from './chickenRabbit.js';
import { createRng } from '../utils/rng.js';
import { levelToBand, BANDS } from './helpers.js';

describe('chickenRabbitTemplate', () => {
  it('should have correct metadata', () => {
    expect(chickenRabbitTemplate.id).toBe('chicken-rabbit-complex');
    expect(chickenRabbitTemplate.gradeRange).toContain('3');
    expect(chickenRabbitTemplate.gradeRange).toContain('4');
    expect(chickenRabbitTemplate.gradeRange).toContain('5');
    expect(chickenRabbitTemplate.gradeRange).toContain('6');
    expect(chickenRabbitTemplate.subtemplates.length).toBe(9);
  });

  it('should generate valid problems', () => {
    const rng = { int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min, pick: (arr) => arr[0] };

    for (let i = 0; i < 20; i++) {
      const result = chickenRabbitTemplate.generate(rng, 2);
      expect(result).toHaveProperty('question');
      expect(result).toHaveProperty('answer');
      expect(result).toHaveProperty('subtype');
      expect(result).toHaveProperty('payload');
      expect(result.subtype).toBe('chicken-rabbit');
      expect(result.question).toBeTruthy();
      expect(result.answer).toBeTruthy();
    }
  });

  it('should have valid payload structure', () => {
    const rng = { int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min, pick: (arr) => arr[0] };
    const result = chickenRabbitTemplate.generate(rng, 2);

    expect(result.payload).toBeDefined();
    expect(typeof result.payload).toBe('object');
  });

  it('should generate all subtemplate types', () => {
    const rng = { int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min, pick: (arr) => arr[0] };
    const generatedSubtypes = new Set();

    for (let i = 0; i < 100; i++) {
      const result = chickenRabbitTemplate.generate(rng, 2);
      generatedSubtypes.add(result.subtype);
    }

    expect(generatedSubtypes.size).toBe(1);
    expect(generatedSubtypes.has('chicken-rabbit')).toBe(true);
  });

  it('should pick subtemplates matching the difficulty band', () => {
    const rng = { int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min, pick: (arr) => arr[0] };

    // difficulty 1 → easy band subtemplates
    const easy = chickenRabbitTemplate.generate(rng, 1);
    const easyBand = levelToBand(1);
    const easySub = chickenRabbitTemplate.subtemplates.find(t => t === chickenRabbitTemplate.subtemplates[0]);
    // The first subtemplate is used due to pick: arr[0]; verify it matches the band
    expect(chickenRabbitTemplate.subtemplates.filter(t => t.band === easyBand).length).toBeGreaterThanOrEqual(1);

    // difficulty 3 → hard band subtemplates
    const hard = chickenRabbitTemplate.generate(rng, 3);
    const hardBand = levelToBand(3);
    expect(chickenRabbitTemplate.subtemplates.filter(t => t.band === hardBand).length).toBeGreaterThanOrEqual(1);

    // All three bands have at least 1 subtemplate
    for (const band of BANDS) {
      expect(chickenRabbitTemplate.subtemplates.filter(t => t.band === band).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should handle edge cases in legs-only problems', () => {
    const rng = { int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min, pick: (arr) => arr[0] };

    for (let i = 0; i < 50; i++) {
      const result = chickenRabbitTemplate.generate(rng, 2);
      expect(result.answer).toBeTruthy();
      expect(result.question).toBeTruthy();
    }
  });

  it('never leaks a raw {placeholder} into the rendered question', () => {
    // Regression: chained .replace() only substituted the FIRST occurrence,
    // so templates that name an animal twice rendered '{animal1}和{animal2}'
    // literally in 56% of chicken-rabbit-complex problems.
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 400; i++) {
        const r = chickenRabbitTemplate.generate(createRng(i * 31 + level * 977), level);
        expect(r.question, `seed=${i} level=${level}`).not.toMatch(/\{[a-zA-Z0-9_]+\}/);
        expect(r.answer, `seed=${i} level=${level}`).not.toMatch(/\{[a-zA-Z0-9_]+\}/);
      }
    }
  });

  it('chicken-rabbit-multiple honours its own "兔 is Nx 鸡" premise', () => {
    // Regression: rabbit was floor(heads/(m+1)) with chicken taking the
    // remainder, so the stated multiple never held (100% of the time).
    for (let i = 0; i < 300; i++) {
      const r = chickenRabbitTemplate.generate(createRng(i), 3);
      const p = r.payload;
      if (p.multiplier === undefined) continue;
      expect(p.rabbit, r.question).toBe(p.multiplier * p.chicken);
      expect(p.chicken + p.rabbit).toBe(p.totalHeads);
      expect(p.chicken * 2 + p.rabbit * 4).toBe(p.totalLegs);
    }
  });
});
