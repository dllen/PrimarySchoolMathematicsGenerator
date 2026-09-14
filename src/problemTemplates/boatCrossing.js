import { pickNumberByBand, pickPerson, pickTwoPeople, levelToBand } from './helpers.js';

function generateBoatSubtemplates() {
  return [
    {
      id: 'boat-two',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const people = pickNumberByBand(rng, 'easy', { min: 4, max: 12 });
        const perBoat = 2;
        const boats = Math.ceil(people / perBoat);
        const remain = boats * perBoat - people;
        return {
          question: `${person}和${people - 1}个小朋友一共${people}人,每条船坐${perBoat}人,需要几条船?`,
          answer: `${boats}条`,
          subtype: 'boat-crossing',
          payload: { people, perBoat, boats, remain },
        };
      },
    },
    {
      id: 'boat-three',
      band: 'medium',
      generate(rng) {
        const person = pickPerson(rng);
        const people = pickNumberByBand(rng, 'medium', { min: 8, max: 25 });
        const perBoat = 3;
        const boats = Math.ceil(people / perBoat);
        const remain = boats * perBoat - people;
        return {
          question: `${person}和${people - 1}个小朋友一共${people}人,每条船坐${perBoat}人,需要几条船?还剩几个座位?`,
          answer: `需要${boats}条船,剩${remain}个座位`,
          subtype: 'boat-crossing',
          payload: { people, perBoat, boats, remain },
        };
      },
    },
    {
      id: 'boat-compete',
      band: 'hard',
      generate(rng) {
        const [person1, person2] = pickTwoPeople(rng);
        const people1 = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const people2 = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const perBoat = 4;
        const pricePerBoat = pickNumberByBand(rng, 'hard', { min: 20, max: 50 });
        const boats1 = Math.ceil(people1 / perBoat);
        const boats2 = Math.ceil(people2 / perBoat);
        const total1 = boats1 * pricePerBoat;
        const total2 = boats2 * pricePerBoat;
        return {
          question: `${person1}组织了${people1}人,${person2}组织了${people2}人,每条船坐${perBoat}人,每条船${pricePerBoat}元。${person1}要租几艘船?一共多少钱?`,
          answer: `需要${boats1}条船,共${total1}元`,
          subtype: 'boat-crossing',
          payload: { people1, people2, perBoat, pricePerBoat, boats1, boats2, total1, total2 },
        };
      },
    },
  ];
}

export const boatCrossingTemplate = {
  id: 'boat-crossing',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateBoatSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
