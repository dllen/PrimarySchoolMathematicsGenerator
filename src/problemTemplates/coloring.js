import { pickNumberByBand, pickForBand } from './helpers.js';

export const coloringTemplate = {
  id: 'coloring',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'coloring-checkerboard',
      band: 'easy',
      generate(rng) {
        const n = pickNumberByBand(rng, 'easy', { min: 4, max: 8 });
        return {
          question: `将${n}×${n}的棋盘黑白交替染色(像国际象棋),黑格共有多少个?`,
          answer: `${n * n / 2}个(若${n}为偶数)`,
          subtype: 'coloring',
          payload: { kind: 'checkerboard', n, total: n * n / 2 },
        };
      },
    },
    {
      id: 'coloring-neighbor',
      band: 'medium',
      generate(rng) {
        const n = pickNumberByBand(rng, 'medium', { min: 4, max: 6 });
        return {
          question: `${n}×${n}棋盘按黑白交替染色,至少取多少格才能保证其中有 2 个相邻(共边)的同色格?`,
          answer: `${n * n + 1}格(超出棋盘总数则必然存在相邻同色)`,
          subtype: 'coloring',
          payload: { kind: 'neighbor', n, threshold: n * n + 1 },
        };
      },
    },
    {
      id: 'coloring-domino',
      band: 'hard',
      generate(rng) {
        const m = pickNumberByBand(rng, 'hard', { min: 4, max: 8 });
        const n = pickNumberByBand(rng, 'hard', { min: 4, max: 8 });
        if ((m * n) % 2 !== 0) {
          return { question: '4×4 棋盘用多米诺骨牌(2×1)能否完全覆盖?', answer: '能,需要8块', subtype: 'coloring', payload: { kind: 'domino-fallback' } };
        }
        return {
          question: `${m}×${n}的棋盘用多米诺骨牌(2×1)能否完全覆盖?需要多少块?`,
          answer: `能,需要${m * n / 2}块`,
          subtype: 'coloring',
          payload: { kind: 'domino', m, n, count: m * n / 2 },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
