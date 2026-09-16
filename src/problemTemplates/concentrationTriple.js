import { pickNumberByBand, pickForBand } from './helpers.js';

export const concentrationTripleTemplate = {
  id: 'concentration-triple',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'triple-mix-basic',
      band: 'easy',
      generate(rng) {
        for (let attempt = 0; attempt < 20; attempt++) {
          const c1 = pickNumberByBand(rng, 'easy', { min: 5, max: 15 });
          const m1 = pickNumberByBand(rng, 'easy', { min: 100, max: 300 });
          const c2 = pickNumberByBand(rng, 'easy', { min: 10, max: 25 });
          const m2 = pickNumberByBand(rng, 'easy', { min: 100, max: 300 });
          const c3 = pickNumberByBand(rng, 'easy', { min: 15, max: 30 });
          const m3 = pickNumberByBand(rng, 'easy', { min: 100, max: 300 });
          const totalMass = m1 + m2 + m3;
          const totalSolute = m1 * c1 / 100 + m2 * c2 / 100 + m3 * c3 / 100;
          const finalC = (totalSolute / totalMass) * 100;
          return {
            question: `${m1}克${c1}%盐水、${m2}克${c2}%盐水、${m3}克${c3}%盐水混合,混合后浓度是多少?`,
            answer: `${finalC.toFixed(1)}%`,
            subtype: 'concentration-triple',
            payload: { kind: 'basic', mixes: [{c: c1, m: m1}, {c: c2, m: m2}, {c: c3, m: m3}], totalMass, totalSolute, finalC },
          };
        }
      },
    },
    {
      id: 'triple-find-mass',
      band: 'medium',
      generate(rng) {
        const c1 = pickNumberByBand(rng, 'medium', { min: 5, max: 15 });
        const m1 = pickNumberByBand(rng, 'medium', { min: 100, max: 300 });
        const c2 = pickNumberByBand(rng, 'medium', { min: 15, max: 25 });
        const m2 = pickNumberByBand(rng, 'medium', { min: 100, max: 300 });
        const c3 = pickNumberByBand(rng, 'medium', { min: 20, max: 35 });
        const target = (c1 + c2 + c3) / 3;
        return {
          question: `${m1}克${c1}%盐水与${m2}克${c2}%盐水混合后,加入${c3}%的盐水,使最终浓度${target.toFixed(1)}%。求应加多少克${c3}%盐水?`,
          answer: `设加入 m 克,(m1·c1 + m2·c2 + m·c3)/(m1 + m2 + m) = ${target.toFixed(1)}/100,解 m = ${(m1 + m2).toFixed(0)}克(近似)`,
          subtype: 'concentration-triple',
          payload: { kind: 'find-mass', c1, m1, c2, m2, c3, target },
        };
      },
    },
    {
      id: 'triple-sequential',
      band: 'hard',
      generate(rng) {
        const c1 = pickNumberByBand(rng, 'hard', { min: 5, max: 12 });
        const c2 = pickNumberByBand(rng, 'hard', { min: 12, max: 22 });
        const c3 = pickNumberByBand(rng, 'hard', { min: 20, max: 30 });
        return {
          question: `现有 200 克${c1}%盐水,先蒸发一半水,再加${c2}%盐水 200 克,最后再加${c3}%盐水 100 克。最终浓度约为多少?`,
          answer: `粗算:(100·c1 + 200·c2 + 100·c3)/400 ≈ ${((100 * c1 + 200 * c2 + 100 * c3) / 400).toFixed(1)}%`,
          subtype: 'concentration-triple',
          payload: { kind: 'sequential', c1, c2, c3 },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
