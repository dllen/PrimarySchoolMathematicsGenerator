import { pickForBand, pickNumberByBand } from './helpers.js';

function generateSportsSubtemplates() {
  return [
    {
      id: 'sports-single',
      band: 'easy',
      generate(rng) {
        const win = pickNumberByBand(rng, 'easy', { min: 1, max: 4 });
        const score = win * 3;
        return {
          question: `球队赢了${win}场比赛(每场3分),总积分是多少?`,
          answer: `${score}分`,
          subtype: 'sports-score',
          payload: { win, score },
        };
      },
    },
    {
      id: 'sports-team',
      band: 'medium',
      generate(rng) {
        const win = pickNumberByBand(rng, 'medium', { min: 2, max: 8 });
        const draw = pickNumberByBand(rng, 'medium', { min: 1, max: 5 });
        const score = win * 3 + draw;
        return {
          question: `球队赢了${win}场(每场3分),平了${draw}场(每场1分),球队总积分是多少?`,
          answer: `${score}分`,
          subtype: 'sports-score',
          payload: { win, draw, score },
        };
      },
    },
    {
      id: 'sports-rank',
      band: 'medium',
      generate(rng) {
        // Name the teams, otherwise '前三名是谁' has no answer.
        const names = ['红队', '蓝队', '黄队'];
        const a = rng.int(5, 15);
        const b = rng.int(3, a - 1);
        const c = rng.int(1, b - 1);
        const scores = [a, b, c];
        const order = [0, 1, 2].sort((i, j) => scores[j] - scores[i]);
        return {
          question: `红队、蓝队、黄队的积分分别是${a}分、${b}分、${c}分,请按积分从高到低排名。`,
          answer: order
            .map((idx, rank) => `第${rank + 1}名${names[idx]}(${scores[idx]}分)`)
            .join(','),
          subtype: 'sports-score',
          payload: { a, b, c, firstIdx: order[0], secondIdx: order[1], thirdIdx: order[2] },
        };
      },
    },
    {
      id: 'sports-relay',
      band: 'hard',
      generate(rng) {
        const t1 = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const t2 = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const t3 = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const total = t1 + t2 + t3;
        const record = total + pickNumberByBand(rng, 'hard', { min: 1, max: 20 });
        const diff = record - total;
        return {
          question: `接力赛三人分别用时${t1}秒、${t2}秒、${t3}秒,总成绩是多少秒?比纪录${record}秒快几秒?`,
          answer: `总成绩${total}秒,快${diff}秒`,
          subtype: 'sports-score',
          payload: { t1, t2, t3, total, record, diff },
        };
      },
    },
  ];
}

export const sportsScoreTemplate = {
  id: 'sports-score',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateSportsSubtemplates(),
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
