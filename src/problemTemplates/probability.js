import { levelToBand } from './helpers.js';

function generateProbabilitySubtemplates() {
  return [
    {
      id: 'prob-coin',
      band: 'easy',
      generate(rng) {
        return {
          question: `抛一枚硬币,正面朝上的概率是多少?`,
          answer: `1/2`,
          subtype: 'probability',
          payload: { numerator: 1, denominator: 2 },
        };
      },
    },
    {
      id: 'prob-dice',
      band: 'easy',
      generate(rng) {
        const target = rng.int(1, 6);
        return {
          question: `掷一个骰子,点数为${target}的概率是多少?`,
          answer: `1/6`,
          subtype: 'probability',
          payload: { target, numerator: 1, denominator: 6 },
        };
      },
    },
    {
      id: 'prob-card',
      band: 'medium',
      generate(rng) {
        const suit = rng.pick(['红桃', '黑桃', '方块', '梅花']);
        const rank = rng.pick(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']);
        return {
          question: `从一副52张扑克牌中抽一张,抽到${suit}${rank}的概率是多少?`,
          answer: `1/52`,
          subtype: 'probability',
          payload: { suit, rank, numerator: 1, denominator: 52 },
        };
      },
    },
    {
      id: 'prob-compare',
      band: 'medium',
      generate(rng) {
        const a = rng.int(2, 6);
        let b = rng.int(2, 6);
        while (b === a) b = rng.int(2, 6);
        const total = a + b;
        const probA = a / total;
        const probB = b / total;
        const better = probA > probB ? '红球' : '白球';
        return {
          question: `袋中有${a}个红球和${b}个白球,摸到红球和白球的概率哪个大?`,
          answer: `${better}大`,
          subtype: 'probability',
          payload: { a, b, total, probA, probB },
        };
      },
    },
    {
      id: 'prob-two-stage',
      band: 'hard',
      generate(rng) {
        const coin = 2;
        const dice = 6;
        const target = rng.int(1, 6);
        const total = coin * dice;
        return {
          question: `先抛硬币再掷骰子,骰子点数为${target}且硬币正面的概率是多少?`,
          answer: `1/${total}`,
          subtype: 'probability',
          payload: { coin, dice, target, total, numerator: 1, denominator: total },
        };
      },
    },
  ];
}

export const probabilityTemplate = {
  id: 'probability',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: generateProbabilitySubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
