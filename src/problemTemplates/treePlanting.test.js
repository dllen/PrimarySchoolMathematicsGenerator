import { describe, it, expect } from 'vitest';
import { treePlantingTemplate } from './treePlanting.js';

const rng = () => ({
  int: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
});

describe('treePlantingTemplate', () => {
  it('should have 3 subtemplates', () => {
    expect(treePlantingTemplate.subtemplates).toHaveLength(3);
  });
  it('should cover easy/medium/hard bands', () => {
    const bands = treePlantingTemplate.subtemplates.map(s => s.band);
    expect(bands).toEqual(expect.arrayContaining(['easy', 'medium', 'hard']));
  });
  it('each band generates a non-null problem', () => {
    for (const sub of treePlantingTemplate.subtemplates) {
      const r = sub.generate(rng());
      expect(r.subtype).toBe('tree-planting');
      expect(r.question).toBeTruthy();
      expect(r.answer).toBeTruthy();
    }
  });
});

describe('treePlantingTemplate - payload validation', () => {
  it('tree-both-ends: payload.trees = floor(length/interval)+1 and trees*2 in answer', () => {
    const sub = treePlantingTemplate.subtemplates.find(s => s.id === 'tree-both-ends');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.bothEnds).toBe(true);
      expect(r.payload.trees).toBe(Math.floor(r.payload.length / r.payload.interval) + 1);
      expect(r.answer).toBe(`${r.payload.trees * 2}棵`);
    }
  });
  it('tree-circular: trees = circumference/interval (must be integer)', () => {
    const sub = treePlantingTemplate.subtemplates.find(s => s.id === 'tree-circular');
    for (let i = 0; i < 10; i++) {
      const r = sub.generate(rng());
      expect(r.payload.circular).toBe(true);
      expect(r.payload.trees * r.payload.interval).toBe(r.payload.circumference);
    }
  });
  it('uses gradeRange for grade filtering', () => {
    expect(treePlantingTemplate.gradeRange).toContain('3');
    expect(treePlantingTemplate.gradeRange).toContain('6');
  });
});
