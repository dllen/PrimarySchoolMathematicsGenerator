import { pickNumberByBand, pickForBand, pickPerson, pickTwoPeople } from './helpers.js';

export const ageProblemTemplate = {
  id: 'age-problem',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'age-diff-constant',
      band: 'easy',
      generate(rng) {
        const [a, b] = pickTwoPeople(rng);
        const diff = pickNumberByBand(rng, 'easy', { min: 2, max: 5 });
        const yearsLater = pickNumberByBand(rng, 'easy', { min: 3, max: 10 });
        return {
          question: `${a}比${b}大${diff}岁。${yearsLater}年后,${a}比${b}大几岁?`,
          answer: `${diff}岁`,
          subtype: 'age-problem',
          payload: { diff, yearsLater, kind: 'diff-constant' },
        };
      },
    },
    {
      id: 'age-sum-now',
      band: 'medium',
      generate(rng) {
        const [child, parent] = pickTwoPeople(rng);
        const childNow = pickNumberByBand(rng, 'medium', { min: 6, max: 12 });
        const parentNow = pickNumberByBand(rng, 'medium', { min: 32, max: 45 });
        const yearsAgo = pickNumberByBand(rng, 'medium', { min: 5, max: 12 });
        const sumThen = childNow + parentNow - 2 * yearsAgo;
        return {
          question: `${parent}今年${parentNow}岁,${child}今年${childNow}岁。${yearsAgo}年前,他们俩的年龄和是多少?`,
          answer: `${sumThen}岁`,
          subtype: 'age-problem',
          payload: { childNow, parentNow, yearsAgo, sumThen, kind: 'sum-then' },
        };
      },
    },
    {
      id: 'age-meet-sum',
      band: 'hard',
      generate(rng) {
        const [a, b] = pickTwoPeople(rng);
        const aNow = pickNumberByBand(rng, 'hard', { min: 8, max: 14 });
        const bNow = pickNumberByBand(rng, 'hard', { min: 35, max: 50 });
        const yearsLater = pickNumberByBand(rng, 'hard', { min: 10, max: 20 });
        const sumThen = aNow + bNow + 2 * yearsLater;
        return {
          question: `${a}今年${aNow}岁,${b}今年${bNow}岁。${yearsLater}年后,他们的年龄和是多少?`,
          answer: `${sumThen}岁`,
          subtype: 'age-problem',
          payload: { aNow, bNow, yearsLater, sumThen, kind: 'sum-later' },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
