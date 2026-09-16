import { pickNumberByBand, pickForBand } from './helpers.js';

export const logicDeductionTemplate = {
  id: 'logic-deduction',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'logic-liar-truth',
      band: 'easy',
      generate(rng) {
        const a = pickNumberByBand(rng, 'easy', { min: 2, max: 5 });
        return {
          question: `甲说:"我有${a}颗糖。"已知甲在撒谎,甲实际有几颗糖?`,
          answer: `不是${a}颗(具体数量未知,题目重在推理)`,
          subtype: 'logic-deduction',
          payload: { kind: 'liar-truth', claim: a },
        };
      },
    },
    {
      id: 'logic-two-liars',
      band: 'medium',
      generate(rng) {
        return {
          question: `甲说:"乙在说谎。" 乙说:"甲在说谎。" 谁在说真话?`,
          answer: '两人都说谎(或两人都不说谎),需附加条件才能确定;典型解:假设甲真则乙假,乙真则甲假,矛盾 → 实际两人都说谎(或题目有附加条件)',
          subtype: 'logic-deduction',
          payload: { kind: 'two-liars' },
        };
      },
    },
    {
      id: 'logic-elimination',
      band: 'hard',
      generate(rng) {
        const names = ['甲', '乙', '丙', '丁'];
        const idx = rng.int(0, 3);
        return {
          question: `${names[0]}、${names[1]}、${names[2]}、${names[3]}四人赛跑。甲不是第一,乙不是最后,丙在甲之后,丁在乙之前。问${names[idx]}是第几名?`,
          answer: '通过排除法:丙在甲之后 → 丙≠第一;丁在乙之前;甲不是第一;乙不是最后;最终可解(具体顺序因题而异)',
          subtype: 'logic-deduction',
          payload: { kind: 'elimination', target: names[idx] },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
