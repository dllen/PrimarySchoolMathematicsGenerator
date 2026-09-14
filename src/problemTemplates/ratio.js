import { pickNumberByBand, pickRatio, pickPerson, pickTwoPeople, gcd, levelToBand } from './helpers.js';

function generateRatioSubtemplates() {
  return [
    {
      id: 'ratio-distribute',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const { a, b } = pickRatio(rng, 'easy');
        const total = pickNumberByBand(rng, 'easy', { min: 6, max: 30 });
        const sum = a + b;
        const partA = Math.floor(total * a / sum);
        const partB = total - partA;
        return {
          question: `${person}有${total}个糖,按${a}:${b}分给甲乙两人,甲得几个?`,
          answer: `${partA}个`,
          subtype: 'ratio',
          payload: { a, b, total, sum, partA, partB },
        };
      },
    },
    {
      id: 'ratio-scale',
      band: 'medium',
      generate(rng) {
        const person = pickPerson(rng);
        const { a, b } = pickRatio(rng, 'medium');
        const partA = pickNumberByBand(rng, 'medium', { min: 6, max: 20 });
        const partB = Math.round(partA * b / a);
        const total = partA + partB;
        return {
          question: `${person}按${a}:${b}分糖,甲得了${partA}个,乙得了几个?一共几个?`,
          answer: `乙${partB}个,一共${total}个`,
          subtype: 'ratio',
          payload: { a, b, partA, partB, total },
        };
      },
    },
    {
      id: 'ratio-combine',
      band: 'medium',
      generate(rng) {
        const person = pickPerson(rng);
        // pick a1, b1, a2, b2 directly so combine math stays clean
        const a1 = rng.int(2, 5);
        const b1 = rng.int(2, 5);
        const a2 = rng.int(2, 5);
        const b2 = rng.int(2, 5);
        const totalA = a1 + a2;
        const totalB = b1 + b2;
        const g = gcd(totalA, totalB);
        return {
          question: `${person}第一次按${a1}:${b1}分糖,第二次按${a2}:${b2}分糖,合并后甲乙比是多少?`,
          answer: `${totalA/g}:${totalB/g}`,
          subtype: 'ratio',
          payload: { a1, b1, a2, b2, totalA, totalB, gcd: g },
        };
      },
    },
    {
      id: 'ratio-partnership',
      band: 'hard',
      generate(rng) {
        const [p1, p2] = pickTwoPeople(rng);
        const { a, b } = pickRatio(rng, 'hard');
        const profit = pickNumberByBand(rng, 'hard', { min: 100, max: 500 });
        const sum = a + b;
        const share1 = Math.round(profit * a / sum);
        const share2 = profit - share1;
        return {
          question: `${p1}和${p2}按${a}:${b}合伙做生意,赚了${profit}元,${p1}分多少?`,
          answer: `${p1}${share1}元,${p2}${share2}元`,
          subtype: 'ratio',
          payload: { a, b, profit, sum, share1, share2 },
        };
      },
    },
  ];
}

export const ratioTemplate = {
  id: 'ratio',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: generateRatioSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
