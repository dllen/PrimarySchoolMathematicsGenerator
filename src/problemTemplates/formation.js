import { pickNumberByBand, pickForBand } from './helpers.js';

export const formationTemplate = {
  id: 'formation',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'formation-solid',
      band: 'easy',
      generate(rng) {
        const side = pickNumberByBand(rng, 'easy', { min: 5, max: 12 });
        const total = side * side;
        const perimeter = 4 * (side - 1);
        return {
          question: `学生做操排成每边${side}人的实心方阵,这个方阵共有多少人?最外层有多少人?`,
          answer: `共${total}人,最外层${perimeter}人`,
          subtype: 'formation',
          payload: { kind: 'solid', side, total, perimeter },
        };
      },
    },
    {
      id: 'formation-hollow',
      band: 'medium',
      generate(rng) {
        const outer = pickNumberByBand(rng, 'medium', { min: 10, max: 18 });
        const inner = pickNumberByBand(rng, 'medium', { min: 4, max: Math.max(4, outer - 4) });
        const layers = (outer - inner) / 2;
        const total = outer * outer - inner * inner;
        return {
          question: `方阵最外层每边${outer}人,内部空心部分每边${inner}人,共有${layers}层,这个方阵总人数是多少?`,
          answer: `${total}人`,
          subtype: 'formation',
          payload: { kind: 'hollow', outer, inner, layers, total },
        };
      },
    },
    {
      id: 'formation-from-perimeter',
      band: 'hard',
      generate(rng) {
        const perimeter = pickNumberByBand(rng, 'hard', { min: 60, max: 120 });
        const side = perimeter / 4 + 1;
        if (!Number.isInteger(side)) {
          return { question: '一个方阵最外层共60人,这个方阵每边多少人?', answer: '16人', subtype: 'formation', payload: { kind: 'from-perimeter-fallback', perimeter } };
        }
        const total = side * side;
        return {
          question: `学生方阵最外层共有${perimeter}人,这个方阵每边有多少人?总人数多少?`,
          answer: `每边${side}人,共${total}人`,
          subtype: 'formation',
          payload: { kind: 'from-perimeter', perimeter, side, total },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
