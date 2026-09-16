import { pickNumberByBand, pickForBand } from './helpers.js';

/**
 * 抽屉原理(鸽巢原理):n+1 个鸽入 n 个巢,至少 1 巢有 2 鸽。
 * 经典题型:袜子、座位、抽屉、苹果。
 */
export const pigeonholeTemplate = {
  id: 'pigeonhole',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'pigeon-socks',
      band: 'easy',
      generate(rng) {
        const colors = pickNumberByBand(rng, 'easy', { min: 3, max: 5 });
        const socks = colors + 1;
        return {
          question: `抽屉里有${colors}种颜色的袜子(每种足够多),至少摸出几只能保证配成颜色相同的一双?`,
          answer: `${socks}只(最坏情况是每种颜色各拿 1 只,第 ${colors + 1} 只必与前 ${colors} 只中某色配对)`,
          subtype: 'pigeonhole',
          payload: { colors, socks, kind: 'socks' },
        };
      },
    },
    {
      id: 'pigeon-seats',
      band: 'medium',
      generate(rng) {
        const seats = pickNumberByBand(rng, 'medium', { min: 4, max: 8 });
        const people = seats + 1;
        return {
          question: `有${people}个人坐${seats}把椅子,证明至少有 2 人坐在同一把椅子上。`,
          answer: `${seats}把椅子最多容纳 ${seats} 人(每把 1 人);${people} > ${seats},必有 2 人同椅`,
          subtype: 'pigeonhole',
          payload: { seats, people, kind: 'seats' },
        };
      },
    },
    {
      id: 'pigeon-apples',
      band: 'hard',
      generate(rng) {
        const baskets = pickNumberByBand(rng, 'hard', { min: 4, max: 6 });
        const apples = 2 * baskets + 1;
        return {
          question: `把${apples}个苹果放进${baskets}个篮子,证明至少有一个篮子里有 3 个或更多苹果。`,
          answer: `若每篮 ≤ 2,最多 ${baskets * 2} 个;但 ${apples} > ${baskets * 2},必有 1 篮 ≥ 3`,
          subtype: 'pigeonhole',
          payload: { baskets, apples, kind: 'apples' },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
