import { pickNumberByBand, pickForBand } from './helpers.js';

export const inclusionExclusionTemplate = {
  id: 'inclusion-exclusion',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'inclusion-two-sets',
      band: 'easy',
      generate(rng) {
        const a = pickNumberByBand(rng, 'easy', { min: 10, max: 30 });
        const b = pickNumberByBand(rng, 'easy', { min: 10, max: 30 });
        const both = pickNumberByBand(rng, 'easy', { min: 3, max: Math.min(a, b) });
        const onlyA = a - both;
        const onlyB = b - both;
        const total = a + b - both;
        return {
          question: `班级${total}人中,喜欢数学的有${a}人,喜欢语文的有${b}人,两科都喜欢的有${both}人,两科都不喜欢的有多少人?`,
          answer: `假设都至少喜欢一科:仅数学${onlyA}人,仅语文${onlyB}人,两科都喜${both}人;若班级共${total}人,则都不喜欢${Math.max(0, total - (a + b - both))}人`,
          subtype: 'inclusion-exclusion',
          payload: { kind: 'two-sets', a, b, both, total, onlyA, onlyB },
        };
      },
    },
    {
      id: 'inclusion-three-sets',
      band: 'medium',
      generate(rng) {
        const a = pickNumberByBand(rng, 'medium', { min: 20, max: 40 });
        const b = pickNumberByBand(rng, 'medium', { min: 15, max: 35 });
        const c = pickNumberByBand(rng, 'medium', { min: 10, max: 25 });
        const ab = pickNumberByBand(rng, 'medium', { min: 3, max: 8 });
        const ac = pickNumberByBand(rng, 'medium', { min: 3, max: 8 });
        const bc = pickNumberByBand(rng, 'medium', { min: 2, max: 6 });
        const abc = pickNumberByBand(rng, 'medium', { min: 1, max: 3 });
        const total = a + b + c - ab - ac - bc + abc;
        return {
          question: `三个兴趣小组同学参加,A组${a}人,B组${b}人,C组${c}人;A∩B ${ab}人,A∩C ${ac}人,B∩C ${bc}人,三者共有${abc}人。三个小组报名总人数(不重复计)是多少?`,
          answer: `${total}人`,
          subtype: 'inclusion-exclusion',
          payload: { kind: 'three-sets', a, b, c, ab, ac, bc, abc, total },
        };
      },
    },
    {
      id: 'inclusion-both-neither',
      band: 'hard',
      generate(rng) {
        const a = pickNumberByBand(rng, 'hard', { min: 30, max: 60 });
        const b = pickNumberByBand(rng, 'hard', { min: 25, max: 50 });
        const both = pickNumberByBand(rng, 'hard', { min: 5, max: 15 });
        const neither = pickNumberByBand(rng, 'hard', { min: 2, max: 10 });
        const total = a + b - both + neither;
        return {
          question: `全班${total}人,会游泳的${a}人,会滑冰的${b}人,两项都会的${both}人,两项都不会的${neither}人。这组数据是否自洽?如自洽,会游泳或会滑冰一共有多少人?`,
          answer: `${a + b - both}人`,
          subtype: 'inclusion-exclusion',
          payload: { kind: 'both-neither', a, b, both, neither, total },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
