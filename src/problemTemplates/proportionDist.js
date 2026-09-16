import { pickNumberByBand, pickForBand } from './helpers.js';

export const proportionDistTemplate = {
  id: 'proportion-dist',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'proportion-two-parts',
      band: 'easy',
      generate(rng) {
        const a = pickNumberByBand(rng, 'easy', { min: 1, max: 4 });
        const b = pickNumberByBand(rng, 'easy', { min: 1, max: 4 });
        const sum = pickNumberByBand(rng, 'easy', { min: 50, max: 200 });
        const total = a + b;
        const partA = Math.round(sum * a / total);
        const partB = sum - partA;
        return {
          question: `把${sum}本书按${a}:${b}的比例分给甲乙两人,甲乙各分多少本?`,
          answer: `甲${partA}本,乙${partB}本`,
          subtype: 'proportion-dist',
          payload: { kind: 'two-parts', ratio: [a, b], total: sum, parts: [partA, partB] },
        };
      },
    },
    {
      id: 'proportion-three-parts',
      band: 'medium',
      generate(rng) {
        const a = pickNumberByBand(rng, 'medium', { min: 1, max: 5 });
        const b = pickNumberByBand(rng, 'medium', { min: 1, max: 5 });
        const c = pickNumberByBand(rng, 'medium', { min: 1, max: 5 });
        const sum = pickNumberByBand(rng, 'medium', { min: 90, max: 300 });
        const total = a + b + c;
        const partA = Math.round(sum * a / total);
        const partB = Math.round(sum * b / total);
        const partC = sum - partA - partB;
        return {
          question: `把${sum}支笔按${a}:${b}:${c}的比例分给三人,各分多少?`,
          answer: `${partA}支、${partB}支、${partC}支`,
          subtype: 'proportion-dist',
          payload: { kind: 'three-parts', ratio: [a, b, c], total: sum, parts: [partA, partB, partC] },
        };
      },
    },
    {
      id: 'proportion-fraction',
      band: 'hard',
      generate(rng) {
        const a = pickNumberByBand(rng, 'hard', { min: 2, max: 7 });
        const b = pickNumberByBand(rng, 'hard', { min: 2, max: 7 });
        const c = pickNumberByBand(rng, 'hard', { min: 2, max: 7 });
        const total = a + b + c;
        const sum = total * pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const partA = sum * a / total;
        const partB = sum * b / total;
        const partC = sum * c / total;
        return {
          question: `把${sum}颗糖果按${a}:${b}:${c}的比例分给三个孩子(允许小数),各分多少颗?`,
          answer: `${partA.toFixed(1)}、${partB.toFixed(1)}、${partC.toFixed(1)}`,
          subtype: 'proportion-dist',
          payload: { kind: 'fraction', ratio: [a, b, c], total: sum, parts: [partA, partB, partC] },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
