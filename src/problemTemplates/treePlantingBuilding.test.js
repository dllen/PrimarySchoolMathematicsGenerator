import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { treePlantingBuildingTemplate } from './treePlantingBuilding.js';

describe('treePlantingBuildingTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(treePlantingBuildingTemplate.subtemplates.length).toBe(3);
    expect(treePlantingBuildingTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(treePlantingBuildingTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(treePlantingBuildingTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid tree-planting-building questions', () => {
    for (const st of treePlantingBuildingTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/楼|层|楼梯|间隔|锯|段/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('tree-planting-building');
      expect(r.payload).toBeDefined();
    }
  });
});
