import { pickNumberByBand, pickPerson, levelToBand } from './helpers.js';

function generateLibrarySubtemplates() {
  return [
    {
      id: 'library-borrow',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const total = pickNumberByBand(rng, 'easy', { min: 20, max: 50 });
        const borrow = pickNumberByBand(rng, 'easy', { min: 5, max: 15 });
        const back = pickNumberByBand(rng, 'easy', { min: 3, max: 10 });
        const remain = total - borrow + back;
        return {
          question: `图书角有${total}本书,${person}借走了${borrow}本,后来又还了${back}本。还剩多少本?`,
          answer: `${remain}本`,
          subtype: 'library',
          payload: { total, borrow, back, remain },
        };
      },
    },
    {
      id: 'library-fine',
      band: 'medium',
      generate(rng) {
        const person = pickPerson(rng);
        const borrow = pickNumberByBand(rng, 'medium', { min: 10, max: 30 });
        const daysLate = pickNumberByBand(rng, 'medium', { min: 3, max: 10 });
        const finePerDay = pickNumberByBand(rng, 'medium', { min: 1, max: 3 });
        const fine = borrow * daysLate * finePerDay;
        return {
          question: `${person}借了${borrow}本书,每本每天超期罚款${finePerDay}角,迟了${daysLate}天,应付多少角罚款?`,
          answer: `${fine}角`,
          subtype: 'library',
          payload: { borrow, daysLate, finePerDay, fine },
        };
      },
    },
    {
      id: 'library-inventory',
      band: 'hard',
      generate(rng) {
        const person = pickPerson(rng);
        const start = pickNumberByBand(rng, 'hard', { min: 50, max: 100 });
        const op1 = pickNumberByBand(rng, 'hard', { min: 15, max: 30 });
        const op2 = pickNumberByBand(rng, 'hard', { min: 10, max: 25 });
        const final = start - op1 + op2;
        return {
          question: `${person}图书角原有${start}本,先借出${op1}本,又还入${op2}本。现在有多少本?`,
          answer: `${final}本`,
          subtype: 'library',
          payload: { start, op1, op2, final },
        };
      },
    },
  ];
}

export const libraryCornerTemplate = {
  id: 'library',
  gradeRange: ['2', '3', '4', '5'],
  semester: 'all',
  subtemplates: generateLibrarySubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
