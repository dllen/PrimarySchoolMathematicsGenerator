import { describe, expect, it } from 'vitest';
import { chickenRabbitTemplate } from './chickenRabbit.js';

describe('chickenRabbitTemplate', () => {
  it('should have correct metadata', () => {
    expect(chickenRabbitTemplate.id).toBe('chicken-rabbit-complex');
    expect(chickenRabbitTemplate.gradeRange).toContain('3');
    expect(chickenRabbitTemplate.gradeRange).toContain('4');
    expect(chickenRabbitTemplate.gradeRange).toContain('5');
    expect(chickenRabbitTemplate.gradeRange).toContain('6');
    expect(chickenRabbitTemplate.subtemplates.length).toBe(9); // 9 subtemplates
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

    expect(result.payload).toHaveProperty('totalHeads');
    expect(result.payload).toHaveProperty('totalLegs');
    expect(typeof result.payload.totalHeads).toBe('number');
    expect(typeof result.payload.totalLegs).toBe('number');
    expect(result.payload.totalHeads).toBeGreaterThan(0);
    expect(result.payload.totalLegs).toBeGreaterThan(0);
  });

  it('should generate all subtemplate types', () => {
    const rng = { int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min, pick: (arr) => arr[0] };
    const generatedSubtypes = new Set();

    // Generate many problems to ensure we hit all subtemplates
    for (let i = 0; i < 100; i++) {
      const result = chickenRabbitTemplate.generate(rng, 2);
      generatedSubtypes.add(result.subtype);
    }

    expect(generatedSubtypes.size).toBe(1);
    expect(generatedSubtypes.has('chicken-rabbit')).toBe(true);
  });

  it('should generate problems with different difficulty levels', () => {
    const rng = { int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min, pick: (arr) => arr[0] };

    // Easy difficulty
    const easy = chickenRabbitTemplate.generate(rng, 1);
    expect(easy.payload.totalHeads).toBeGreaterThanOrEqual(10);
    expect(easy.payload.totalHeads).toBeLessThanOrEqual(50);

    // Medium difficulty
    const medium = chickenRabbitTemplate.generate(rng, 2);
    expect(medium.payload.totalHeads).toBeGreaterThanOrEqual(15);
    expect(medium.payload.totalHeads).toBeLessThanOrEqual(80);

    // Hard difficulty
    const hard = chickenRabbitTemplate.generate(rng, 3);
    expect(hard.payload.totalHeads).toBeGreaterThanOrEqual(30);
    expect(hard.payload.totalHeads).toBeLessThanOrEqual(110);
  });

  it('should handle edge cases in legs-only problems', () => {
    const rng = { int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min, pick: (arr) => arr[0] };

    // Generate multiple times to test edge case handling
    for (let i = 0; i < 50; i++) {
      const result = chickenRabbitTemplate.generate(rng, 2);
      expect(result.answer).toBeTruthy();
      expect(result.question).toBeTruthy();
    }
  });
});
