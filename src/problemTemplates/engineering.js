import { pickForBand, pickNumberByBand } from './helpers.js';

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
        // Spec §3.1: 两人合作,求时间 (inverse of the forward variant).
        const r1 = rng.int(3, 10);
        const r2 = rng.int(3, 10);
        const hours = rng.int(2, 6);
        const total = (r1 + r2) * hours;
        return {
          question: `甲每小时做${r1}个,乙每小时做${r2}个,两人一起做${total}个零件需要多少小时?`,
          answer: `${hours}小时`,
          subtype: 'engineering',
          payload: { r1, r2, hours, total },
        };
      },
    },
    {
      id: 'engineering-complete',
      band: 'medium',
      generate(rng) {
        // Spec §3.1: 已知总量和时间,求效率.
        const rate = rng.int(3, 12);
        const hours = rng.int(3, 8);
        const total = rate * hours;
        return {
          question: `一项工程总量是${total}个零件,${hours}小时完成,平均每小时做多少个?`,
          answer: `${rate}个/小时`,
          subtype: 'engineering',
          payload: { total, hours, rate },
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
    return pickForBand(this, difficultyLevel, rng);
  },
};
