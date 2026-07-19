import { describe, expect, it } from 'vitest';
import { chickenRabbitTemplate } from './chickenRabbit.js';

describe('chickenRabbitTemplate', () => {
  it('should have correct metadata', () => {
    expect(chickenRabbitTemplate.id).toBe('chicken-rabbit-complex');
    expect(chickenRabbitTemplate.gradeRange).toContain('3');
    expect(chickenRabbitTemplate.gradeRange).toContain('4');
    expect(chickenRabbitTemplate.gradeRange).toContain('5');
    expect(chickenRabbitTemplate.gradeRange).toContain('6');
    expect(chickenRabbitTemplate.subtemplates.length).toBeGreaterThan(0);
  });

  it('should generate valid problems', () => {
    const rng = { int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min, pick: (arr) => arr[0] };

    for (let i = 0; i < 10; i++) {
      const result = chickenRabbitTemplate.generate(rng, 1);
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
});
