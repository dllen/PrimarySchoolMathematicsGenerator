import { pickNumberByBand, pickForBand, pickPerson } from './helpers.js';

export const unitaryTemplate = {
  id: 'unitary',
  gradeRange: ['3', '4', '5'],
  semester: 'all',
  subtemplates: [
    {
      id: 'unitary-direct',
      band: 'easy',
      generate(rng) {
        const unit = pickNumberByBand(rng, 'easy', { min: 2, max: 5 });
        const groups = pickNumberByBand(rng, 'easy', { min: 3, max: 6 });
        const total = unit * groups;
        const targetGroups = pickNumberByBand(rng, 'easy', { min: 7, max: 12 });
        const targetTotal = unit * targetGroups;
        const person = pickPerson(rng);
        return {
          question: `${person}买${groups}支铅笔花了${total}元。每支铅笔多少元?买${targetGroups}支需要多少元?`,
          answer: `${unit}元;${targetTotal}元`,
          subtype: 'unitary',
          payload: { unit, groups, total, targetGroups, targetTotal },
        };
      },
    },
    {
      id: 'unitary-work',
      band: 'medium',
      generate(rng) {
        const days = pickNumberByBand(rng, 'medium', { min: 3, max: 6 });
        const total = pickNumberByBand(rng, 'medium', { min: 60, max: 120 });
        const perDay = total / days;
        const targetDays = pickNumberByBand(rng, 'medium', { min: 7, max: 14 });
        const person = pickPerson(rng);
        return {
          question: `${person}用${days}天读了${total}页书。平均每天读几页?按这个速度,${targetDays}天能读多少页?`,
          answer: `${perDay}页;${perDay * targetDays}页`,
          subtype: 'unitary',
          payload: { days, total, perDay, targetDays, result: perDay * targetDays },
        };
      },
    },
    {
      id: 'unitary-reverse',
      band: 'hard',
      generate(rng) {
        const unit = pickNumberByBand(rng, 'hard', { min: 5, max: 12 });
        const targetGroups = pickNumberByBand(rng, 'hard', { min: 8, max: 15 });
        const groups = pickNumberByBand(rng, 'hard', { min: 3, max: 6 });
        const total = unit * groups;
        const person = pickPerson(rng);
        return {
          question: `${person}用${total}元买了${groups}本笔记本。${targetGroups}本笔记本需要多少元?`,
          answer: `${unit * targetGroups}元`,
          subtype: 'unitary',
          payload: { unit, groups, total, targetGroups, result: unit * targetGroups, kind: 'reverse' },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
