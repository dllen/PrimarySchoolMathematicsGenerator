import { pickNumberByBand, levelToBand } from './helpers.js';

function generateHarvestSubtemplates() {
  return [
    {
      id: 'harvest-grain',
      band: 'easy',
      generate(rng) {
        const yield_ = pickNumberByBand(rng, 'easy', { min: 50, max: 150 });
        const area = pickNumberByBand(rng, 'easy', { min: 2, max: 8 });
        const total = yield_ * area;
        return {
          question: `稻谷亩产量是${yield_}公斤,${area}亩收了稻谷多少公斤?`,
          answer: `${total}公斤`,
          subtype: 'harvest',
          payload: { yield_, area, total },
        };
      },
    },
    {
      id: 'harvest-area',
      band: 'medium',
      generate(rng) {
        const yield_ = pickNumberByBand(rng, 'medium', { min: 80, max: 200 });
        const area = pickNumberByBand(rng, 'medium', { min: 3, max: 12 });
        const total = yield_ * area;
        return {
          question: `收了稻谷${total}公斤,亩产量是${yield_}公斤,种了多少亩?`,
          answer: `${area}亩`,
          subtype: 'harvest',
          payload: { total, yield_, area },
        };
      },
    },
    {
      id: 'harvest-compare',
      band: 'hard',
      generate(rng) {
        const y1 = pickNumberByBand(rng, 'hard', { min: 100, max: 200 });
        const a1 = pickNumberByBand(rng, 'hard', { min: 3, max: 8 });
        const y2 = pickNumberByBand(rng, 'hard', { min: 80, max: y1 - 10 });
        const a2 = a1 + pickNumberByBand(rng, 'hard', { min: 1, max: 3 });
        const t1 = y1 * a1;
        const t2 = y2 * a2;
        const diff = Math.abs(t1 - t2);
        const better = t1 > t2 ? '第一块' : '第二块';
        return {
          question: `第一块亩产${y1}公斤,面积${a1}亩;第二块亩产${y2}公斤,面积${a2}亩。哪块地产量高?高多少?`,
          answer: `${better}高${diff}公斤`,
          subtype: 'harvest',
          payload: { y1, a1, y2, a2, t1, t2, diff },
        };
      },
    },
  ];
}

export const harvestFieldTemplate = {
  id: 'harvest',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateHarvestSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
