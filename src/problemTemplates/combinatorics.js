import { comb, perm, pickForBand } from './helpers.js';

function generateCombinatoricsSubtemplates() {
  return [
    {
      id: 'comb-multiplication',
      band: 'easy',
      generate(rng) {
        const a = rng.int(2, 4);
        const b = rng.int(2, 4);
        const c = rng.int(2, 4);
        const total = a * b * c;
        return {
          question: `从家到学校有${a}条路,从学校到公园有${b}条路,从公园到图书馆有${c}条路,一共多少种走法?`,
          answer: `${total}种`,
          subtype: 'combinatorics',
          payload: { a, b, c, total },
        };
      },
    },
    {
      id: 'comb-addition',
      band: 'easy',
      generate(rng) {
        const a = rng.int(2, 5);
        const b = rng.int(2, 5);
        const total = a + b;
        return {
          question: `从甲地到乙地有${a}条公路和${b}条铁路,一共多少种走法?`,
          answer: `${total}种`,
          subtype: 'combinatorics',
          payload: { a, b, total },
        };
      },
    },
    {
      id: 'comb-permutation',
      band: 'medium',
      generate(rng) {
        const n = rng.int(4, 6);
        const r = rng.int(2, n);
        const total = perm(n, r);
        return {
          question: `从${n}个人中选${r}个人排队,有多少种排法?`,
          answer: `${total}种`,
          subtype: 'combinatorics',
          payload: { n, r, total },
        };
      },
    },
    {
      id: 'comb-combination',
      band: 'medium',
      generate(rng) {
        const n = rng.int(4, 6);
        const r = rng.int(2, n);
        const total = comb(n, r);
        return {
          question: `从${n}个人中选${r}个人组成小组(不排队),有多少种选法?`,
          answer: `${total}种`,
          subtype: 'combinatorics',
          payload: { n, r, total },
        };
      },
    },
    {
      id: 'comb-ball',
      band: 'hard',
      generate(rng) {
        const total = rng.int(6, 10);
        const red = rng.int(2, total - 2);
        const pick = rng.int(2, Math.min(4, red));
        const totalComb = comb(total, pick);
        const redComb = comb(red, pick);
        return {
          question: `袋中有${total}个球,其中${red}个红球,不放回摸${pick}个,摸到的全是红球的组合数是多少?`,
          answer: `${redComb}种(共有${totalComb}种组合)`,
          subtype: 'combinatorics',
          payload: { total, red, pick, totalComb, redComb },
        };
      },
    },
    {
      id: 'comb-probability-link',
      band: 'hard',
      generate(rng) {
        const n = rng.int(5, 6);
        const r = rng.int(2, 3);
        const total = comb(n, r);
        const favorable = rng.int(1, total - 1);
        return {
          question: `从${n}个球中选${r}个,共有${total}种选法,其中${favorable}种包含红球,包含红球的概率是多少?`,
          answer: `${favorable}/${total}`,
          subtype: 'combinatorics',
          payload: { n, r, total, favorable },
        };
      },
    },
  ];
}

export const combinatoricsTemplate = {
  id: 'combinatorics',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: generateCombinatoricsSubtemplates(),
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
