import { pickNumberByBand, levelToBand } from './helpers.js';

function generateEngineeringSubtemplates() {
  return [
    {
      id: 'engineering-single',
      band: 'easy',
      generate(rng) {
        const rate = pickNumberByBand(rng, 'easy', { min: 2, max: 8 });
        const hours = pickNumberByBand(rng, 'easy', { min: 2, max: 6 });
        const total = rate * hours;
        return {
          question: `工人每小时加工${rate}个零件,加工${hours}小时,一共能加工多少个?`,
          answer: `${total}个`,
          subtype: 'engineering',
          payload: { rate, hours, total },
        };
      },
    },
    {
      id: 'engineering-together',
      band: 'medium',
      generate(rng) {
        const r1 = pickNumberByBand(rng, 'medium', { min: 3, max: 10 });
        const r2 = pickNumberByBand(rng, 'medium', { min: 3, max: 10 });
        const hours = pickNumberByBand(rng, 'medium', { min: 2, max: 6 });
        const total = (r1 + r2) * hours;
        return {
          question: `甲每小时做${r1}个,乙每小时做${r2}个,两人一起做${hours}小时,共完成多少个?`,
          answer: `${total}个`,
          subtype: 'engineering',
          payload: { r1, r2, hours, total },
        };
      },
    },
    {
      id: 'engineering-complete',
      band: 'medium',
      generate(rng) {
        const hours = pickNumberByBand(rng, 'medium', { min: 3, max: 8 });
        const rate = pickNumberByBand(rng, 'medium', { min: 3, max: 12 });
        const total = rate * hours;
        return {
          question: `一项工程,每小时做${rate}个,${hours}小时完成,共做多少个?`,
          answer: `${total}个`,
          subtype: 'engineering',
          payload: { rate, hours, total },
        };
      },
    },
    {
      id: 'engineering-three',
      band: 'hard',
      generate(rng) {
        const r1 = pickNumberByBand(rng, 'hard', { min: 3, max: 12 });
        const r2 = pickNumberByBand(rng, 'hard', { min: 3, max: 12 });
        const r3 = pickNumberByBand(rng, 'hard', { min: 3, max: 12 });
        const hours = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        const total = (r1 + r2 + r3) * hours;
        return {
          question: `三人合作,效率分别为${r1}、${r2}、${r3}个/小时,做了${hours}小时,共完成多少个?`,
          answer: `${total}个`,
          subtype: 'engineering',
          payload: { r1, r2, r3, hours, total },
        };
      },
    },
    {
      id: 'engineering-shift',
      band: 'hard',
      generate(rng) {
        const r1 = pickNumberByBand(rng, 'hard', { min: 4, max: 12 });
        const h1 = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        const r2 = pickNumberByBand(rng, 'hard', { min: 4, max: 12 });
        const h2 = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        const total = r1 * h1 + r2 * h2;
        return {
          question: `先甲做${h1}小时(每小时${r1}个),再乙做${h2}小时(每小时${r2}个),共完成多少个?`,
          answer: `${total}个`,
          subtype: 'engineering',
          payload: { r1, h1, r2, h2, total },
        };
      },
    },
  ];
}

export const engineeringTemplate = {
  id: 'engineering',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateEngineeringSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
