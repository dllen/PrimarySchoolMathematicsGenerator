import { pickNumberByBand, pickForBand } from './helpers.js';

export const ageProblemFamilyTemplate = {
  id: 'age-problem-family',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'parent-child-ratio',
      band: 'easy',
      generate(rng) {
        const child = pickNumberByBand(rng, 'easy', { min: 6, max: 12 });
        const ratio = pickNumberByBand(rng, 'easy', { min: 3, max: 5 });
        const parent = child * ratio;
        return {
          question: `父亲今年年龄是儿子的${ratio}倍,儿子今年${child}岁,父亲今年多少岁?`,
          answer: `${parent}岁`,
          subtype: 'age-problem-family',
          payload: { kind: 'parent-child-ratio', child, ratio, parent },
        };
      },
    },
    {
      id: 'parent-mother-child',
      band: 'medium',
      generate(rng) {
        const child = pickNumberByBand(rng, 'medium', { min: 6, max: 14 });
        const mother = pickNumberByBand(rng, 'medium', { min: 30, max: 40 });
        const father = mother + pickNumberByBand(rng, 'medium', { min: 2, max: 6 });
        const totalAge = child + mother + father;
        const yearsLater = pickNumberByBand(rng, 'medium', { min: 5, max: 12 });
        const futureSum = totalAge + 3 * yearsLater;
        return {
          question: `一家三口:父亲${father}岁、母亲${mother}岁、儿子${child}岁,${yearsLater}年后三人年龄和是多少?`,
          answer: `${futureSum}岁`,
          subtype: 'age-problem-family',
          payload: { kind: 'parent-mother-child', child, mother, father, yearsLater, totalAge, futureSum },
        };
      },
    },
    {
      id: 'grandparent-parent-child',
      band: 'hard',
      generate(rng) {
        const child = pickNumberByBand(rng, 'hard', { min: 6, max: 12 });
        const parent = pickNumberByBand(rng, 'hard', { min: 30, max: 45 });
        const grandparent = parent + pickNumberByBand(rng, 'hard', { min: 25, max: 35 });
        const totalAge = child + parent + grandparent;
        return {
          question: `祖孙三代:爷爷${grandparent}岁、爸爸${parent}岁、孙子${child}岁。三人年龄和是多少?爷爷比孙子大几岁?`,
          answer: `和${totalAge}岁,爷爷比孙子大${grandparent - child}岁`,
          subtype: 'age-problem-family',
          payload: { kind: 'grandparent-parent-child', child, parent, grandparent, totalAge, diff: grandparent - child },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
