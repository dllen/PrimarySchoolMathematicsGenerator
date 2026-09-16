import { pickNumberByBand, pickForBand } from './helpers.js';

export const comparisonMultiTemplate = {
  id: 'comparison-multi',
  gradeRange: ['2', '3', '4'],
  semester: 'all',
  subtemplates: [
    {
      id: 'three-rank',
      band: 'easy',
      generate(rng) {
        const a = pickNumberByBand(rng, 'easy', { min: 10, max: 50 });
        const b = pickNumberByBand(rng, 'easy', { min: 10, max: 50 });
        const c = pickNumberByBand(rng, 'easy', { min: 10, max: 50 });
        const sorted = [a, b, c].sort((x, y) => y - x);
        return {
          question: `三个数 ${a}、${b}、${c},从大到小排序是?最大比最小多多少?`,
          answer: `${sorted.join(' > ')},最大比最小多${sorted[0] - sorted[2]}`,
          subtype: 'comparison-multi',
          payload: { kind: 'three-rank', nums: [a, b, c], sorted, diff: sorted[0] - sorted[2] },
        };
      },
    },
    {
      id: 'three-relations',
      band: 'medium',
      generate(rng) {
        const a = pickNumberByBand(rng, 'medium', { min: 20, max: 80 });
        const diffAB = pickNumberByBand(rng, 'medium', { min: 5, max: 20 });
        const diffBC = pickNumberByBand(rng, 'medium', { min: 5, max: 20 });
        const b = a + diffAB;
        const c = b + diffBC;
        return {
          question: `甲比乙多${diffAB},乙比丙多${diffBC},甲是${a},求丙是多少。`,
          answer: `${c - diffAB - diffBC}`,
          subtype: 'comparison-multi',
          payload: { kind: 'three-relations', a, diffAB, diffBC, b, c: c - diffAB - diffBC },
        };
      },
    },
    {
      id: 'four-rank',
      band: 'hard',
      generate(rng) {
        const nums = Array.from({ length: 4 }, () => pickNumberByBand(rng, 'hard', { min: 50, max: 200 }));
        const sorted = [...nums].sort((x, y) => y - x);
        return {
          question: `${nums.join('、')} 这 4 个数从大到小排序是?第二大的是多少?`,
          answer: `${sorted.join('、')},第二大的${sorted[1]}`,
          subtype: 'comparison-multi',
          payload: { kind: 'four-rank', nums, sorted, secondLargest: sorted[1] },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
