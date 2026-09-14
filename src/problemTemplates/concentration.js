import { pickNumberByBand, levelToBand } from './helpers.js';

function generateConcentrationSubtemplates() {
  return [
    {
      id: 'concentration-basic',
      band: 'easy',
      generate(rng) {
        const solute = pickNumberByBand(rng, 'easy', { min: 5, max: 15 });
        const solution = pickNumberByBand(rng, 'easy', { min: 30, max: 80 });
        const percent = Math.round(solute / solution * 100);
        return {
          question: `把${solute}克糖溶解在${solution}克水中,糖水浓度是多少(百分数)?`,
          answer: `${percent}%`,
          subtype: 'concentration',
          payload: { solute, solution, percent },
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
        const solute = pickNumberByBand(rng, 'medium', { min: 10, max: 30 });
        const solution = pickNumberByBand(rng, 'medium', { min: 50, max: 100 });
        // hard band scales max; pick addedWater directly to stay below constraints
        const addedWater = rng.int(20, 50);
        const newSolution = solution + addedWater;
        const newPercent = Math.round(solute / newSolution * 100);
        return {
          question: `原有${solute}克糖溶在${solution}克水中,又加了${addedWater}克水,新浓度是多少?`,
          answer: `${newPercent}%`,
          subtype: 'concentration',
          payload: { solute, solution, addedWater, newSolution, newPercent },
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
        const solute = pickNumberByBand(rng, 'hard', { min: 15, max: 35 });
        const solution = pickNumberByBand(rng, 'hard', { min: 60, max: 120 });
        // pick evaporated directly so solution-evaporated > 0
        const maxEvap = Math.max(1, solution - 1);
        const evaporated = rng.int(10, Math.min(30, maxEvap));
        const newSolution = solution - evaporated;
        const newPercent = Math.round(solute / newSolution * 100);
        return {
          question: `${solute}克糖溶在${solution}克水中,蒸发掉${evaporated}克水,新浓度是多少?`,
          answer: `${newPercent}%`,
          subtype: 'concentration',
          payload: { solute, solution, evaporated, newSolution, newPercent },
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
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
