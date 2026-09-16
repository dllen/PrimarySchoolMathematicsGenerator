import { pickNumberByBand, pickForBand } from './helpers.js';

export const averageTemplate = {
  id: 'average',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'average-simple',
      band: 'easy',
      generate(rng) {
        const n = pickNumberByBand(rng, 'easy', { min: 3, max: 5 });
        const nums = Array.from({ length: n }, () => pickNumberByBand(rng, 'easy', { min: 10, max: 99 }));
        const sum = nums.reduce((a, b) => a + b, 0);
        const avg = sum / n;
        return {
          question: `${nums.join('、')}这${n}个数的平均数是多少?`,
          answer: `${avg}`,
          subtype: 'average',
          payload: { kind: 'simple', nums, sum, avg },
        };
      },
    },
    {
      id: 'average-find-number',
      band: 'medium',
      generate(rng) {
        const n = pickNumberByBand(rng, 'medium', { min: 4, max: 6 });
        const known = Array.from({ length: n - 1 }, () => pickNumberByBand(rng, 'medium', { min: 50, max: 99 }));
        const knownSum = known.reduce((a, b) => a + b, 0);
        const avg = pickNumberByBand(rng, 'medium', { min: 60, max: 90 });
        const total = avg * n;
        const missing = total - knownSum;
        return {
          question: `小明${n}次考试,已知${n - 1}次成绩为${known.join('、')},平均分${avg},求第${n}次成绩。`,
          answer: `${missing}分`,
          subtype: 'average',
          payload: { kind: 'find-number', known, n, avg, missing, total },
        };
      },
    },
    {
      id: 'average-two-groups',
      band: 'hard',
      generate(rng) {
        const n1 = pickNumberByBand(rng, 'hard', { min: 5, max: 8 });
        const n2 = pickNumberByBand(rng, 'hard', { min: 5, max: 8 });
        const avg1 = pickNumberByBand(rng, 'hard', { min: 70, max: 85 });
        const avg2 = pickNumberByBand(rng, 'hard', { min: 85, max: 95 });
        const sum1 = n1 * avg1;
        const sum2 = n2 * avg2;
        const totalN = n1 + n2;
        const totalAvg = (sum1 + sum2) / totalN;
        return {
          question: `甲组${n1}人,平均分${avg1};乙组${n2}人,平均分${avg2}。两组合在一起的平均分是多少?`,
          answer: `${totalAvg.toFixed(1)}分`,
          subtype: 'average',
          payload: { kind: 'two-groups', n1, avg1, n2, avg2, sum1, sum2, totalAvg },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
