import { pickForBand, pickNumberByBand } from './helpers.js';

function generateConcentrationSubtemplates() {
  return [
    {
      id: 'concentration-basic',
      band: 'easy',
      generate(rng) {
        const solute = rng.int(5, 15);
        const water = rng.int(30, 90);
        // 浓度 = 溶质 / 溶液, and 溶液 = 溶质 + 水.
        const solution = solute + water;
        const percent = Math.round(solute / solution * 100);
        return {
          question: `把${solute}克糖溶解在${water}克水中,糖水浓度是多少(百分数,四舍五入取整数)?`,
          answer: `${percent}%`,
          subtype: 'concentration',
          payload: { solute, water, solution, percent },
        };
      },
    },
    {
      id: 'concentration-find-solute',
      band: 'easy',
      generate(rng) {
        const solution = pickNumberByBand(rng, 'easy', { min: 50, max: 100 });
        const percent = pickNumberByBand(rng, 'easy', { min: 5, max: 20 });
        const solute = Math.round(solution * percent / 100);
        return {
          question: `${solution}克${percent}%的糖水中,糖有多少克?`,
          answer: `${solute}克`,
          subtype: 'concentration',
          payload: { solute, solution, percent },
        };
      },
    },
    {
      id: 'concentration-dilute',
      band: 'medium',
      generate(rng) {
        const solute = rng.int(10, 30);
        const water = rng.int(50, 100);
        const addedWater = rng.int(20, 50);
        const newSolution = solute + water + addedWater;
        const newPercent = Math.round(solute / newSolution * 100);
        return {
          question: `原有${solute}克糖溶在${water}克水中,又加了${addedWater}克水,新浓度是多少(百分数,取整数)?`,
          answer: `${newPercent}%`,
          subtype: 'concentration',
          payload: { solute, water, addedWater, newSolution, newPercent },
        };
      },
    },
    {
      id: 'concentration-mix',
      band: 'hard',
      generate(rng) {
        const s1 = pickNumberByBand(rng, 'hard', { min: 5, max: 15 });
        const sol1 = pickNumberByBand(rng, 'hard', { min: 30, max: 80 });
        const s2 = pickNumberByBand(rng, 'hard', { min: 5, max: 15 });
        const sol2 = pickNumberByBand(rng, 'hard', { min: 30, max: 80 });
        const totalSolute = s1 + s2;
        const totalSolution = sol1 + sol2;
        const percent = Math.round(totalSolute / totalSolution * 100);
        return {
          question: `${sol1}克${Math.round(s1/sol1*100)}%糖水和${sol2}克${Math.round(s2/sol2*100)}%糖水混合,新浓度是多少?`,
          answer: `${percent}%`,
          subtype: 'concentration',
          payload: { s1, sol1, s2, sol2, totalSolute, totalSolution, percent },
        };
      },
    },
    {
      id: 'concentration-evaporate',
      band: 'hard',
      generate(rng) {
        const solute = rng.int(15, 35);
        const water = rng.int(60, 120);
        // Evaporating water must leave some water behind (newSolution > solute).
        const evaporated = rng.int(10, Math.max(10, water - 5));
        const newSolution = solute + water - evaporated;
        const newPercent = Math.round(solute / newSolution * 100);
        return {
          question: `${solute}克糖溶在${water}克水中,蒸发掉${evaporated}克水,新浓度是多少(百分数,取整数)?`,
          answer: `${newPercent}%`,
          subtype: 'concentration',
          payload: { solute, water, evaporated, newSolution, newPercent },
        };
      },
    },
  ];
}

export const concentrationTemplate = {
  id: 'concentration',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: generateConcentrationSubtemplates(),
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
