import { pickNumberByBand, levelToBand } from './helpers.js';

function generateRedPacketSubtemplates() {
  return [
    {
      id: 'redpacket-receive',
      band: 'easy',
      generate(rng) {
        const r1 = pickNumberByBand(rng, 'easy', { min: 5, max: 20 });
        const r2 = pickNumberByBand(rng, 'easy', { min: 5, max: 20 });
        const total = r1 + r2;
        return {
          question: `过年了,小明收到${r1}元和${r2}元红包,一共收到多少钱?`,
          answer: `${total}元`,
          subtype: 'red-packet',
          payload: { r1, r2, total },
        };
      },
    },
    {
      id: 'redpacket-spend',
      band: 'medium',
      generate(rng) {
        const income = pickNumberByBand(rng, 'medium', { min: 20, max: 80 });
        const spend = pickNumberByBand(rng, 'medium', { min: 5, max: income - 10 });
        const remain = income - spend;
        return {
          question: `小红收到红包${income}元,买玩具花了${spend}元,还剩多少元?`,
          answer: `${remain}元`,
          subtype: 'red-packet',
          payload: { income, spend, remain },
        };
      },
    },
    {
      id: 'redpacket-balance',
      band: 'hard',
      generate(rng) {
        const i1 = pickNumberByBand(rng, 'hard', { min: 20, max: 50 });
        const i2 = pickNumberByBand(rng, 'hard', { min: 10, max: 40 });
        const s1 = pickNumberByBand(rng, 'hard', { min: 5, max: i1 - 5 });
        const s2 = pickNumberByBand(rng, 'hard', { min: 3, max: i2 - 3 });
        const final = i1 + i2 - s1 - s2;
        return {
          question: `小华收到两个红包${i1}元和${i2}元,买书花了${s1}元,买文具花了${s2}元。还剩多少元?`,
          answer: `${final}元`,
          subtype: 'red-packet',
          payload: { i1, i2, s1, s2, final },
        };
      },
    },
  ];
}

export const redPacketTemplate = {
  id: 'red-packet',
  gradeRange: ['1', '2', '3', '4', '5'],
  semester: 'all',
  subtemplates: generateRedPacketSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
