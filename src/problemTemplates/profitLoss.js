import { pickNumberByBand, pickForBand, pickPerson } from './helpers.js';

export const profitLossTemplate = {
  id: 'profit-loss',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'profit-short',
      band: 'easy',
      generate(rng) {
        const people = pickNumberByBand(rng, 'easy', { min: 4, max: 8 });
        const perHead = pickNumberByBand(rng, 'easy', { min: 3, max: 8 });
        const diff = pickNumberByBand(rng, 'easy', { min: 1, max: 3 });
        const totalShort = people * perHead + diff;
        const person = pickPerson(rng);
        return {
          question: `${person}把${totalShort}个糖果分给${people}个小朋友,如果每人分${perHead + 1}个会少${diff}个。糖果刚好够每人分几个?`,
          answer: `${perHead}个`,
          subtype: 'profit-loss',
          payload: { people, perHead, diff, total: totalShort },
        };
      },
    },
    {
      id: 'profit-over',
      band: 'medium',
      generate(rng) {
        const people = pickNumberByBand(rng, 'medium', { min: 5, max: 10 });
        const perHead = pickNumberByBand(rng, 'medium', { min: 4, max: 9 });
        const diff = pickNumberByBand(rng, 'medium', { min: 1, max: 4 });
        const totalOver = people * perHead - diff;
        const person = pickPerson(rng);
        return {
          question: `${person}把${totalOver}颗糖果分给${people}个小朋友,如果每人分${perHead}个会多${diff}颗。每人应该分几颗?`,
          answer: `${perHead - 1}颗`,
          subtype: 'profit-loss',
          payload: { people, perHead, diff, total: totalOver, mode: 'over' },
        };
      },
    },
    {
      id: 'profit-two-conditions',
      band: 'hard',
      generate(rng) {
        const people = pickNumberByBand(rng, 'hard', { min: 6, max: 12 });
        const perHead = pickNumberByBand(rng, 'hard', { min: 5, max: 10 });
        const short = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        const over = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        const total = (perHead + 2) * people - short;
        const person = pickPerson(rng);
        return {
          question: `${person}把一些书分给${people}个同学,如果每人分${perHead + 2}本则少${short}本,如果每人分${perHead + 1}本则多${over}本。书共有多少本?每人恰好分几本?`,
          answer: `${total}本,每人${perHead + 1}本`,
          subtype: 'profit-loss',
          payload: { people, perHead, short, over, total },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
