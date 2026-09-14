import { pickForBand, pickNumberByBand, pickPerson } from './helpers.js';

function generateShareSubtemplates() {
  return [
    {
      id: 'share-give',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const each = pickNumberByBand(rng, 'easy', { min: 2, max: 6 });
        const people = pickNumberByBand(rng, 'easy', { min: 2, max: 5 });
        const total = each * people;
        return {
          question: `${person}给每位小朋友分${each}颗糖,分给了${people}位小朋友,一共分了多少颗糖?`,
          answer: `${total}颗`,
          subtype: 'share-candy',
          payload: { each, people, total },
        };
      },
    },
    {
      id: 'share-remaining',
      band: 'medium',
      generate(rng) {
        const person = pickPerson(rng);
        const people = pickNumberByBand(rng, 'medium', { min: 3, max: 8 });
        const each = pickNumberByBand(rng, 'medium', { min: 3, max: 7 });
        const remain = pickNumberByBand(rng, 'medium', { min: 1, max: Math.max(1, people - 1) });
        const total = people * each + remain;
        return {
          question: `${person}有一些糖,每位小朋友分${each}颗,分给了${people}位小朋友,还剩${remain}颗。${person}原来有多少颗糖?`,
          answer: `${total}颗`,
          subtype: 'share-candy',
          payload: { people, each, total, remain },
        };
      },
    },
    {
      id: 'share-half',
      band: 'hard',
      generate(rng) {
        const person = pickPerson(rng);
        const final = pickNumberByBand(rng, 'hard', { min: 3, max: 10 });
        const steps = pickNumberByBand(rng, 'hard', { min: 2, max: 4 });
        // inverse: current = final, then current = current * 2 + 1 for each step
        let current = final;
        for (let i = 0; i < steps; i++) current = current * 2 + 1;
        return {
          question: `${person}有一些糖,每次拿走一半多1颗,拿了${steps}次后剩${final}颗。原来有多少颗?`,
          answer: `${current}颗`,
          subtype: 'share-candy',
          payload: { steps, final, original: current },
        };
      },
    },
  ];
}

export const shareCandyTemplate = {
  id: 'share-candy',
  gradeRange: ['2', '3', '4', '5'],
  semester: 'all',
  subtemplates: generateShareSubtemplates(),
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
