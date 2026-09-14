import { gcd, isPrime, lcm, pickForBand, pickNumberByBand } from './helpers.js';

function generateNumberTheorySubtemplates() {
  return [
    {
      id: 'nt-divisible',
      band: 'easy',
      generate(rng) {
        const n = pickNumberByBand(rng, 'easy', { min: 10, max: 50 });
        const divisor = rng.pick([2, 3, 5, 9]);
        const divisible = n % divisor === 0;
        return {
          question: `${n}能否被${divisor}整除?`,
          answer: divisible ? '能' : '不能',
          subtype: 'number-theory',
          payload: { n, divisor, divisible: divisible ? 1 : 0 },
        };
      },
    },
    {
      id: 'nt-remainder',
      band: 'easy',
      generate(rng) {
        const divisor = rng.int(3, 9);
        const quotient = pickNumberByBand(rng, 'easy', { min: 2, max: 9 });
        const remainder = rng.int(1, divisor - 1);
        const dividend = divisor * quotient + remainder;
        return {
          question: `${dividend}除以${divisor},商是${quotient},余数是几?`,
          answer: `${remainder}`,
          subtype: 'number-theory',
          payload: { dividend, divisor, quotient, remainder },
        };
      },
    },
    {
      id: 'nt-lcm',
      band: 'medium',
      generate(rng) {
        const a = rng.int(4, 20);
        const b = rng.int(4, 20);
        const L = lcm(a, b);
        return {
          question: `${a}和${b}的最小公倍数是多少?`,
          answer: `${L}`,
          subtype: 'number-theory',
          payload: { a, b, L },
        };
      },
    },
    {
      id: 'nt-gcd-application',
      band: 'medium',
      generate(rng) {
        const a = rng.int(10, 50);
        const b = rng.int(10, 50);
        const G = gcd(a, b);
        return {
          question: `${a}和${b}的最大公约数是多少?`,
          answer: `${G}`,
          subtype: 'number-theory',
          payload: { a, b, G },
        };
      },
    },
    {
      id: 'nt-congruence',
      band: 'hard',
      generate(rng) {
        const n = rng.int(5, 12);
        const a = rng.int(1, n - 1);
        // Smallest positive integer congruent to a mod n is a itself.
        return {
          question: `求最小的正整数x,使得x除以${n}余${a}。`,
          answer: `${a}`,
          subtype: 'number-theory',
          payload: { n, a, x: a },
        };
      },
    },
    {
      id: 'nt-puzzle',
      band: 'hard',
      generate(rng) {
        const n1 = rng.pick([3, 5]);
        const n2 = rng.pick([5, 7]);
        const r1 = rng.int(1, n1 - 1);
        const r2 = rng.int(1, n2 - 1);
        let x = 1;
        while (!(x % n1 === r1 && x % n2 === r2) && x < 1000) x++;
        return {
          question: `一个数除以${n1}余${r1},除以${n2}余${r2},这个数最小是多少?`,
          answer: `${x}`,
          subtype: 'number-theory',
          payload: { n1, n2, r1, r2, x },
        };
      },
    },
  ];
}

export const numberTheoryTemplate = {
  id: 'number-theory',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: generateNumberTheorySubtemplates(),
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
