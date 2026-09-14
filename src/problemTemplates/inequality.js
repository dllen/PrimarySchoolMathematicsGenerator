import { pickNumberByBand, levelToBand } from './helpers.js';

function generateInequalitySubtemplates() {
  return [
    {
      id: 'ineq-sum-product-easy',
      band: 'easy',
      generate(rng) {
        const S = pickNumberByBand(rng, 'easy', { min: 6, max: 12 });
        const a = Math.floor(S / 2);
        const b = S - a;
        const maxProduct = a * b;
        return {
          question: `两个正整数之和为${S},乘积最大是多少?`,
          answer: `${maxProduct}`,
          subtype: 'inequality',
          payload: { S, a, b, maxProduct },
        };
      },
    },
    {
      id: 'ineq-product-sum-medium',
      band: 'medium',
      generate(rng) {
        // Enumerate integer pairs so the "two positive integers multiply to P"
        // claim is always satisfiable.
        const a = rng.int(3, 7);
        const b = rng.int(3, 7);
        const P = a * b;
        const minSum = a + b;
        return {
          question: `两个正整数之积为${P},和最小是多少?`,
          answer: `${minSum}`,
          subtype: 'inequality',
          payload: { P, a, b, minSum },
        };
      },
    },
    {
      id: 'ineq-sum-product',
      band: 'hard',
      generate(rng) {
        const S = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const a = Math.floor(S / 2);
        const b = S - a;
        const maxProduct = a * b;
        return {
          question: `两个正整数之和为${S},乘积最大是多少?`,
          answer: `${maxProduct}`,
          subtype: 'inequality',
          payload: { S, a, b, maxProduct },
        };
      },
    },
    {
      id: 'ineq-product-sum',
      band: 'hard',
      generate(rng) {
        const a = rng.int(5, 10);
        const b = rng.int(5, 10);
        const P = a * b;
        const minSum = a + b;
        return {
          question: `两个正整数之积为${P},和最小是多少?`,
          answer: `${minSum}`,
          subtype: 'inequality',
          payload: { P, a, b, minSum },
        };
      },
    },
    {
      id: 'ineq-integer',
      band: 'hard',
      generate(rng) {
        const S = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const a = Math.floor(S / 2);
        const b = S - a;
        const maxProduct = a * b;
        const minProduct = 1 * (S - 1);
        return {
          question: `两个正整数之和为${S},乘积最大${maxProduct},最小${minProduct},差是多少?`,
          answer: `${maxProduct - minProduct}`,
          subtype: 'inequality',
          payload: { S, a, b, maxProduct, minProduct, diff: maxProduct - minProduct },
        };
      },
    },
  ];
}

export const inequalityTemplate = {
  id: 'inequality',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: generateInequalitySubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
