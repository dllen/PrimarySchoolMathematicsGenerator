import { pickNumberByBand, pickForBand } from './helpers.js';

/**
 * 等式变换:在保持等式成立的条件下,重新排列等式中的数字。
 */
export const equationTransformTemplate = {
  id: 'equation-transform',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'eq-2digit-add',
      band: 'easy',
      generate(rng) {
        const a = pickNumberByBand(rng, 'easy', { min: 12, max: 49 });
        const b = pickNumberByBand(rng, 'easy', { min: 12, max: 49 });
        const sum = a + b;
        return {
          question: `原等式: ${a} + ${b} = ${sum}。请将 ${a} 或 ${b} 中的某一位数字减 1,使新等式仍然成立。`,
          answer: `例如: ${a} + (${b - 1}) = ${sum - 1} 或 (${a - 1}) + ${b} = ${sum - 1}`,
          subtype: 'equation-transform',
          payload: { a, b, sum, kind: 'add-2digit' },
        };
      },
    },
    {
      id: 'eq-3digit-sub',
      band: 'medium',
      generate(rng) {
        const a = pickNumberByBand(rng, 'medium', { min: 100, max: 300 });
        const b = pickNumberByBand(rng, 'medium', { min: 50, max: 199 });
        if (a <= b) return { question: '', answer: '', subtype: 'equation-transform', payload: {} };
        const diff = a - b;
        return {
          question: `原等式: ${a} - ${b} = ${diff}。将 ${a} 的个位数加 2(可能进位)后,新等式是否仍成立?给出一种调整方案。`,
          answer: `若 ${a} 个位+2 不进位: 新被减数 = ${a + 2},新差 = ${diff + 2};若有进位则需调整`,
          subtype: 'equation-transform',
          payload: { a, b, diff, kind: 'swap-digits' },
        };
      },
    },
    {
      id: 'eq-mul-rearrange',
      band: 'hard',
      generate(rng) {
        const a = pickNumberByBand(rng, 'hard', { min: 12, max: 24 });
        const b = pickNumberByBand(rng, 'hard', { min: 12, max: 24 });
        const product = a * b;
        return {
          question: `原等式: ${a} × ${b} = ${product}。请将 ${a} 与 ${b} 交换位置,验证 ${b} × ${a} = ${product} 同样成立。`,
          answer: `乘法交换律: ${b} × ${a} = ${product} ✓`,
          subtype: 'equation-transform',
          payload: { a, b, product, kind: 'mul-min-change' },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
