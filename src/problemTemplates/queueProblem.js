import { pickNumberByBand, pickPerson, pickTwoPeople, levelToBand } from './helpers.js';

function generateQueueSubtemplates() {
  return [
    {
      id: 'queue-position',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const front = pickNumberByBand(rng, 'easy', { min: 1, max: 5 });
        const behind = pickNumberByBand(rng, 'easy', { min: 1, max: 5 });
        const total = front + 1 + behind;
        return {
          question: `${person}排队,前面有${front}人,后面有${behind}人。这一队一共多少人?`,
          answer: `${total}人`,
          subtype: 'queue',
          payload: { person, front, behind, total },
        };
      },
    },
    {
      id: 'queue-swap',
      band: 'medium',
      generate(rng) {
        const [a, b] = pickTwoPeople(rng);
        const posA = pickNumberByBand(rng, 'medium', { min: 1, max: 8 });
        const posB = pickNumberByBand(rng, 'medium', { min: 1, max: 8 });
        const swap = Math.abs(posA - posB);
        return {
          question: `${a}排在第${posA}位,${b}排在第${posB}位。如果交换位置,${a}比${b}靠前多少位?`,
          answer: `${swap}位`,
          subtype: 'queue',
          payload: { a, b, posA, posB, swap },
        };
      },
    },
    {
      id: 'queue-ticket',
      band: 'hard',
      generate(rng) {
        const person = pickPerson(rng);
        // Hard band multiplies min/max by 1.8; pick pos directly so it stays < total.
        const total = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const maxPos = Math.max(2, total - 1);
        const pos = rng.int(2, maxPos);
        const skip = pickNumberByBand(rng, 'hard', { min: 1, max: 5 });
        const ahead = total - pos;
        const wait = ahead * skip;
        return {
          question: `${person}购票时前面有${ahead}人,每1人购票需要${skip}分钟,轮到他时需要等多少分钟?`,
          answer: `${wait}分钟`,
          subtype: 'queue',
          payload: { total, pos, skip, ahead, wait },
        };
      },
    },
  ];
}

export const queueProblemTemplate = {
  id: 'queue',
  gradeRange: ['1', '2', '3', '4', '5'],
  semester: 'all',
  subtemplates: generateQueueSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
