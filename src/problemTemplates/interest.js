import { pickNumberByBand, pickForBand, pickPerson } from './helpers.js';

export const interestTemplate = {
  id: 'interest',
  gradeRange: ['6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'interest-find-total',
      band: 'easy',
      generate(rng) {
        const principal = pickNumberByBand(rng, 'easy', { min: 1000, max: 5000 });
        const ratePct = pickNumberByBand(rng, 'easy', { min: 2, max: 4 });
        const years = pickNumberByBand(rng, 'easy', { min: 1, max: 3 });
        const interest = Math.round(principal * ratePct / 100 * years);
        const total = principal + interest;
        const person = pickPerson(rng);
        return {
          question: `${person}把${principal}元存入银行,年利率${ratePct}%,存${years}年,到期可得本金和利息共多少元?`,
          answer: `${total}元`,
          subtype: 'interest',
          payload: { kind: 'find-total', principal, ratePct, years, interest, total },
        };
      },
    },
    {
      id: 'interest-find-principal',
      band: 'medium',
      generate(rng) {
        const ratePct = pickNumberByBand(rng, 'medium', { min: 2, max: 4 });
        const years = pickNumberByBand(rng, 'medium', { min: 2, max: 5 });
        const interest = pickNumberByBand(rng, 'medium', { min: 200, max: 1500 });
        const principal = Math.round(interest * 100 / (ratePct * years));
        const total = principal + interest;
        return {
          question: `某人存款${years}年,年利率${ratePct}%,到期共取回${total}元(本金+利息),求本金。`,
          answer: `${principal}元`,
          subtype: 'interest',
          payload: { kind: 'find-principal', principal, ratePct, years, interest, total },
        };
      },
    },
    {
      id: 'interest-compare',
      band: 'hard',
      generate(rng) {
        const principal = pickNumberByBand(rng, 'hard', { min: 5000, max: 20000 });
        const rate1 = pickNumberByBand(rng, 'hard', { min: 2, max: 3 });
        const rate2 = rate1 + 1;
        const years = pickNumberByBand(rng, 'hard', { min: 3, max: 5 });
        const interest1 = Math.round(principal * rate1 / 100 * years);
        const interest2 = Math.round(principal * rate2 / 100 * years);
        const diff = interest2 - interest1;
        return {
          question: `本金${principal}元,甲银行年利率${rate1}%,乙银行年利率${rate2}%,存${years}年,两家利息相差多少元?`,
          answer: `${diff}元`,
          subtype: 'interest',
          payload: { kind: 'compare', principal, rate1, rate2, years, diff },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
