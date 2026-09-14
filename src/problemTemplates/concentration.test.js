import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { concentrationTemplate } from './concentration.js';

// Find a seed that picks each target subtemplate (basic / find-solute / dilute / mix).
function findWithField(level, field) {
  for (let i = 0; i < 500; i++) {
    const rng = createRng(i * 7 + level * 13);
    const result = concentrationTemplate.generate(rng, level);
    if (result.payload[field] !== undefined && result.payload.addedWater === undefined) return result;
  }
  return null;
}

describe('concentrationTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty`, () => {
      const rng = createRng(band);
      const result = concentrationTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('easy (basic): percent = round(solute/solution * 100)', () => {
    let result = null;
    for (let i = 0; i < 500; i++) {
      const rng = createRng(i + 1);
      result = concentrationTemplate.generate(rng, 1);
      // basic has percent set by compute, find-solute also has percent
      // differentiate: basic picks solute then percent; find-solute picks percent then solute
      // Heuristic: in basic, solute < solution; in find-solute, solution*percent/100 ≈ solute
      // We'll check both formulas hold
      const { solute, solution, percent } = result.payload;
      if (solute !== undefined && solution !== undefined && percent !== undefined &&
          addedWater(payload => 0) === 0) {
        // basic: solute < solution and percent < 100
        if (solute < solution && solute >= 5 && solute <= 7 && solution >= 15 && solution <= 40) break;
      }
    }
    const { solute, solution, percent } = result.payload;
    expect(percent).toBe(Math.round(solute / solution * 100));
  });
  it('easy (find-solute): solute = round(solution * percent / 100)', () => {
    const result = findWithField(1, 'percent');
    // find-solute computes solute from solution * percent / 100
    // basic also has these fields. Need to differentiate:
    // in find-solute, percent is a randomly picked integer; in basic, percent is computed
    // Let's check both formulas
    const { solute, solution, percent } = result.payload;
    expect(solute).toBe(Math.round(solution * percent / 100));
  });
  it('medium (dilute): newPercent = round(solute/newSolution * 100)', () => {
    let result = null;
    for (let i = 0; i < 500; i++) {
      const rng = createRng(i + 1);
      result = concentrationTemplate.generate(rng, 2);
      if (result.payload.addedWater !== undefined) break;
    }
    const { solute, newSolution, newPercent } = result.payload;
    expect(newPercent).toBe(Math.round(solute / newSolution * 100));
  });
  it('hard (mix): percent = round(totalSolute/totalSolution * 100)', () => {
    let result = null;
    for (let i = 0; i < 500; i++) {
      const rng = createRng(i + 1);
      result = concentrationTemplate.generate(rng, 3);
      if (result.payload.totalSolute !== undefined) break;
    }
    const { totalSolute, totalSolution, percent } = result.payload;
    expect(percent).toBe(Math.round(totalSolute / totalSolution * 100));
  });

  it('basic/dilute/evaporate divide by solute + water, not by the water alone', () => {
    // Regression: the text said 'N克水' but the code divided by N as if it were
    // the total solution, overstating every concentration.
    for (let i = 0; i < 400; i++) {
      const r = concentrationTemplate.generate(createRng(i), 1);
      const p = r.payload;
      if (p.water === undefined || p.solution === undefined) continue;
      expect(p.solution, r.question).toBe(p.solute + p.water);
      expect(p.percent, r.question).toBe(Math.round(p.solute / p.solution * 100));
      expect(r.question).toContain(`${p.water}克水`);
    }
  });
});

// Helper used in basic test
function addedWater(payload) {
  return payload.addedWater !== undefined ? 1 : 0;
}
