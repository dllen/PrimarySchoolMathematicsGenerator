import { pickForBand, pickNumberByBand } from './helpers.js';

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
      id: 'redpacket-calculate',
      band: 'hard',
      generate(rng) {
        // Spec §3.5: 已知收入支出与最终余额,求某笔未知收入.
        const i1 = rng.int(20, 50);
        const i2 = rng.int(10, 40);
        const s1 = rng.int(5, 15);
        const s2 = rng.int(3, 12);
        const final = i1 + i2 - s1 - s2;
        return {
          question: `小华收到红包${i1}元,买书花了${s1}元,买文具花了${s2}元,最后还剩${final}元。他还收到了另一个多少元的红包?`,
          answer: `${i2}元`,
          subtype: 'red-packet',
          payload: { i1, s1, s2, final, i2 },
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
    return pickForBand(this, difficultyLevel, rng);
  },
};
