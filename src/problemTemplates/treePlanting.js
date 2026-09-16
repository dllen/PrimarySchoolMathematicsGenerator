import { pickNumberByBand, pickForBand, pickPerson } from './helpers.js';

export const treePlantingTemplate = {
  id: 'tree-planting',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'tree-both-ends',
      band: 'easy',
      generate(rng) {
        const interval = pickNumberByBand(rng, 'easy', { min: 3, max: 8 });
        const length = pickNumberByBand(rng, 'easy', { min: 30, max: 80 });
        const trees = Math.floor(length / interval) + 1;
        const person = pickPerson(rng);
        return {
          question: `${person}在${length}米长的路两边种树,每隔${interval}米种一棵,两端都种。共需多少棵树?`,
          answer: `${trees * 2}棵`,
          subtype: 'tree-planting',
          payload: { interval, length, trees, bothEnds: true, sides: 2 },
        };
      },
    },
    {
      id: 'tree-one-end',
      band: 'medium',
      generate(rng) {
        const interval = pickNumberByBand(rng, 'medium', { min: 4, max: 10 });
        const length = pickNumberByBand(rng, 'medium', { min: 50, max: 150 });
        const trees = Math.floor(length / interval);
        const person = pickPerson(rng);
        return {
          question: `${person}在一条${length}米的路一侧种树,每隔${interval}米种一棵,只种一端。共需多少棵树?`,
          answer: `${trees}棵`,
          subtype: 'tree-planting',
          payload: { interval, length, trees, bothEnds: false, sides: 1 },
        };
      },
    },
    {
      id: 'tree-circular',
      band: 'hard',
      generate(rng) {
        const interval = pickNumberByBand(rng, 'hard', { min: 5, max: 12 });
        const circumference = interval * pickNumberByBand(rng, 'hard', { min: 8, max: 20 });
        const trees = circumference / interval;
        const person = pickPerson(rng);
        return {
          question: `${person}在周长${circumference}米的圆形花坛四周种树,每隔${interval}米种一棵。需要多少棵树?`,
          answer: `${trees}棵`,
          subtype: 'tree-planting',
          payload: { interval, circumference, trees, circular: true },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
