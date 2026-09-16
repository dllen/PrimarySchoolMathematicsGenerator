import { pickNumberByBand, pickForBand } from './helpers.js';

function countDivisors(n) {
  let count = 0;
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) count += (i * i === n) ? 1 : 2;
  }
  return count;
}

function isPerfectSquare(n) {
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}

export const perfectSquareTemplate = {
  id: 'perfect-square',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'perfect-square-judge',
      band: 'easy',
      generate(rng) {
        const n = pickNumberByBand(rng, 'easy', { min: 1, max: 144 });
        const isSq = isPerfectSquare(n);
        const r = Math.round(Math.sqrt(n));
        return {
          question: `${n}是完全平方数吗?如果是,它的平方根是多少?`,
          answer: isSq ? `是,平方根${r}` : `不是(${n}介于${r * r === n ? r : (r - 1) * (r - 1)}到${r * r === n ? r : r * r}之间)`,
          subtype: 'perfect-square',
          payload: { kind: 'judge', n, isSq, sqrt: isSq ? r : null },
        };
      },
    },
    {
      id: 'perfect-square-divisor-count',
      band: 'medium',
      generate(rng) {
        const n = pickNumberByBand(rng, 'medium', { min: 10, max: 100 });
        const total = countDivisors(n);
        return {
          question: `${n}共有多少个因数?`,
          answer: `${total}个`,
          subtype: 'perfect-square',
          payload: { kind: 'divisor-count', n, total },
        };
      },
    },
    {
      id: 'perfect-square-nearest',
      band: 'hard',
      generate(rng) {
        const n = pickNumberByBand(rng, 'hard', { min: 50, max: 200 });
        const lo = Math.floor(Math.sqrt(n));
        const candidates = [lo * lo, (lo + 1) * (lo + 1)];
        const closer = candidates.reduce((p, c) => Math.abs(c - n) < Math.abs(p - n) ? c : p);
        return {
          question: `与${n}最接近的完全平方数是多少?`,
          answer: `${closer}`,
          subtype: 'perfect-square',
          payload: { kind: 'nearest', n, closer, candidates },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
