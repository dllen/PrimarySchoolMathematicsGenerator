import { gcd, pickForBand, pickNumberByBand, pickPerson, pickRatio, pickTwoPeople } from './helpers.js';

function generateRatioSubtemplates() {
  return [
    {
      id: 'ratio-distribute',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const { a, b } = pickRatio(rng, 'easy');
        const sum = a + b;
        // Choose the total as a multiple of the ratio sum so the split is exact.
        // Picking total independently would make partA:partB != a:b whenever
        // total % sum !== 0 (e.g. 9 candies at 1:1 cannot be split evenly).
        const k = rng.int(2, 6);
        const total = sum * k;
        const partA = a * k;
        const partB = b * k;
        return {
          question: `${person}有${total}个糖,按${a}:${b}分给甲乙两人,甲得几个?`,
          answer: `${partA}个`,
          subtype: 'ratio',
          payload: { a, b, total, sum, k, partA, partB },
        };
      },
    },
    {
      id: 'ratio-scale',
      band: 'medium',
      generate(rng) {
        const person = pickPerson(rng);
        const { a, b } = pickRatio(rng, 'medium');
        // Scale both parts by the same k so partA:partB is exactly a:b.
        // Rounding partA * b / a broke the ratio whenever b/a was not exact.
        const k = rng.int(3, 10);
        const partA = a * k;
        const partB = b * k;
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
        const a1 = rng.int(2, 5);
        const b1 = rng.int(2, 5);
        const a2 = rng.int(2, 5);
        const b2 = rng.int(2, 5);
        // State how much was shared each round, otherwise the merged ratio is
        // undetermined (equal totals was an unstated assumption).
        const k1 = rng.int(2, 5);
        const k2 = rng.int(2, 5);
        const round1Total = (a1 + b1) * k1;
        const round2Total = (a2 + b2) * k2;
        const totalA = a1 * k1 + a2 * k2;
        const totalB = b1 * k1 + b2 * k2;
        const g = gcd(totalA, totalB);
        return {
          question: `${person}第一次把${round1Total}颗糖按${a1}:${b1}分给甲乙,第二次把${round2Total}颗糖按${a2}:${b2}分给甲乙,两次合起来甲乙分到的糖的比是多少?`,
          answer: `${totalA/g}:${totalB/g}`,
          subtype: 'ratio',
          payload: { a1, b1, a2, b2, round1Total, round2Total, totalA, totalB, gcd: g },
        };
      },
    },
    {
      id: 'ratio-partnership',
      band: 'hard',
      generate(rng) {
        const [p1, p2] = pickTwoPeople(rng);
        const { a, b } = pickRatio(rng, 'hard');
        const sum = a + b;
        // Make the profit a multiple of the ratio sum so the split is exact.
        const k = rng.int(10, 50);
        const profit = sum * k;
        const share1 = a * k;
        const share2 = b * k;
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
    return pickForBand(this, difficultyLevel, rng);
  },
};
