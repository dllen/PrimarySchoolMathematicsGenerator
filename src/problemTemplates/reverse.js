import { pickNumberByBand, pickForBand, pickPerson } from './helpers.js';

export const reverseTemplate = {
  id: 'reverse',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'reverse-add',
      band: 'easy',
      generate(rng) {
        const start = pickNumberByBand(rng, 'easy', { min: 10, max: 50 });
        const a = pickNumberByBand(rng, 'easy', { min: 5, max: 20 });
        const b = pickNumberByBand(rng, 'easy', { min: 3, max: 15 });
        const after = start + a - b;
        const person = pickPerson(rng);
        return {
          question: `${person}有一些糖果,先加上${a}颗,又吃掉${b}颗,还剩${after}颗。${person}原来有多少颗糖果?`,
          answer: `${start}颗`,
          subtype: 'reverse',
          payload: { start, a, b, after, kind: 'add-eat' },
        };
      },
    },
    {
      id: 'reverse-mul-div',
      band: 'medium',
      generate(rng) {
        // 重试直到 (start*mul)/div 整除
        for (let attempt = 0; attempt < 20; attempt++) {
          const start = pickNumberByBand(rng, 'medium', { min: 30, max: 80 });
          const mul = pickNumberByBand(rng, 'medium', { min: 2, max: 4 });
          const div = pickNumberByBand(rng, 'medium', { min: 2, max: 4 });
          const after = (start * mul) / div;
          if (Number.isInteger(after)) {
            const person = pickPerson(rng);
            return {
              question: `${person}有一些卡片,数量先乘以${mul}再除以${div}后是${after}。${person}原来有多少张卡片?`,
              answer: `${start}张`,
              subtype: 'reverse',
              payload: { start, mul, div, after, kind: 'mul-div' },
            };
          }
        }
        // 重试失败兜底:确保始终返回有效题目(用 mul=2, div=2, start=整除)
        const start = pickNumberByBand(rng, 'medium', { min: 30, max: 80 });
        const mul = 2;
        const div = 2;
        const after = start;
        const person = pickPerson(rng);
        return {
          question: `${person}有一些卡片,数量先乘以${mul}再除以${div}后是${after}。${person}原来有多少张卡片?`,
          answer: `${start}张`,
          subtype: 'reverse',
          payload: { start, mul, div, after, kind: 'mul-div' },
        };
      },
    },
    {
      id: 'reverse-chain',
      band: 'hard',
      generate(rng) {
        const start = pickNumberByBand(rng, 'hard', { min: 50, max: 100 });
        const a = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const b = pickNumberByBand(rng, 'hard', { min: 5, max: 15 });
        const c = pickNumberByBand(rng, 'hard', { min: 2, max: 4 });
        const after = ((start + a) * c) - b;
        const person = pickPerson(rng);
        return {
          question: `${person}有一些邮票。朋友先给他${a}张,他又把现有数量乘以${c},然后送给同学${b}张,最后还剩${after}张。${person}原来有多少张邮票?`,
          answer: `${start}张`,
          subtype: 'reverse',
          payload: { start, a, b, c, after, kind: 'chain' },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
