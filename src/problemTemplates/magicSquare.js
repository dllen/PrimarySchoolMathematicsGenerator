import { pickNumberByBand, pickForBand } from './helpers.js';

/**
 * 幻方:三阶幻方/四阶幻方。
 * 三阶幻方每行/列/对角线之和为15;四阶为34。
 */
export const magicSquareTemplate = {
  id: 'magic-square',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'magic-3-center',
      band: 'easy',
      generate(rng) {
        return {
          question: `三阶幻方(每行/列/对角线之和为15)中,已知中心是5,左上角是8,左下角是4,问右上角是几?`,
          answer: `6`,
          subtype: 'magic-square',
          payload: { size: 3, kind: 'center-known' },
        };
      },
    },
    {
      id: 'magic-3-row',
      band: 'medium',
      generate(rng) {
        return {
          question: `三阶幻方第一行依次为 2、7、6,求幻方中其余6个数并说明幻方结构。`,
          answer: `完整幻方: 2 7 6 / 9 5 1 / 4 3 8(行/列/对角线之和均为15)`,
          subtype: 'magic-square',
          payload: { row: [2, 7, 6], size: 3, kind: 'row-known' },
        };
      },
    },
    {
      id: 'magic-4',
      band: 'hard',
      generate(rng) {
        return {
          question: `四阶幻方(每行/列/对角线之和为34)中,已知四个角为 1、13、4、16,问对角线交点(中心点)是多少?`,
          answer: `8.5(四阶幻方中心 = 总和/16 = 136/16)`,
          subtype: 'magic-square',
          payload: { size: 4, kind: 'diagonal-center' },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
