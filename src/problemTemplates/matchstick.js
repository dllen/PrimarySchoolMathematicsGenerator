import { pickNumberByBand, pickForBand } from './helpers.js';

/**
 * 火柴棒变换:移动/添加/移除 1 根火柴,使等式成立。
 * 用文字描述操作,不画图。
 */
export const matchstickTemplate = {
  id: 'matchstick',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'matchstick-move',
      band: 'easy',
      generate(rng) {
        return {
          question: `用火柴棒摆成 3 + 5 = 9 这个等式(显然不成立)。请移动一根火柴棒,使等式成立。`,
          answer: `把 9 的左上横棒移到下方,使 9 变成 8;或者把 + 号的竖棒移到 5 上使其变成 9(3 + 6 = 9)`,
          subtype: 'matchstick',
          payload: { kind: 'move' },
        };
      },
    },
    {
      id: 'matchstick-add',
      band: 'medium',
      generate(rng) {
        return {
          question: `用火柴棒摆成等式 5 + 7 = 2,如何添加一根火柴棒使其成立?`,
          answer: `在 2 的左侧添加一根竖棒,使其变成 12(5 + 7 = 12);或在等号上添加一横,改成不等号`,
          subtype: 'matchstick',
          payload: { kind: 'add' },
        };
      },
    },
    {
      id: 'matchstick-remove',
      band: 'hard',
      generate(rng) {
        return {
          question: `等式 11 + 7 = 18(此式成立)。请移除一根火柴棒,使新等式也成立。`,
          answer: `移除 11 中的一个 1,得到 1 + 7 = 8;或移除 7 左上的横棒变成 1,得到 11 + 1 = 12`,
          subtype: 'matchstick',
          payload: { kind: 'remove' },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
