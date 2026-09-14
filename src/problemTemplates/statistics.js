import { pickForBand, pickNumberByBand } from './helpers.js';

function generateStatisticsSubtemplates() {
  return [
    {
      id: 'statistics-mean',
      band: 'easy',
      generate(rng) {
        const n = pickNumberByBand(rng, 'easy', { min: 3, max: 5 });
        const data = Array.from({ length: n }, () => pickNumberByBand(rng, 'easy', { min: 5, max: 20 }));
        const total = data.reduce((a, b) => a + b, 0);
        const mean = Math.round(total / n * 10) / 10;
        return {
          question: `${data.join('、')}的平均数是多少?`,
          answer: `${mean}`,
          subtype: 'statistics',
          payload: { data, n, total, mean },
        };
      },
    },
    {
      id: 'statistics-mean-reverse',
      band: 'medium',
      generate(rng) {
        const n = pickNumberByBand(rng, 'medium', { min: 4, max: 8 });
        const mean = pickNumberByBand(rng, 'medium', { min: 15, max: 40 });
        const total = n * mean;
        return {
          question: `${n}个数的平均数是${mean},这${n}个数之和是多少?`,
          answer: `${total}`,
          subtype: 'statistics',
          payload: { n, mean, total },
        };
      },
    },
    {
      id: 'statistics-range',
      band: 'medium',
      generate(rng) {
        const n = 5;
        const data = Array.from({ length: n }, () => rng.int(10, 50));
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min;
        return {
          question: `数据${data.join('、')}中,最大值${max},最小值${min},极差是多少?`,
          answer: `${range}`,
          subtype: 'statistics',
          payload: { data, max, min, range },
        };
      },
    },
    {
      id: 'statistics-chart-read',
      band: 'medium',
      generate(rng) {
        // Spec §3.5: 从给定数据读条形图,说出最高/最低.
        const labels = ['一班', '二班', '三班', '四班'];
        const data = labels.map(() => rng.int(10, 50));
        const max = Math.max(...data);
        const min = Math.min(...data);
        const maxClass = labels[data.indexOf(max)];
        const minClass = labels[data.indexOf(min)];
        return {
          question: `条形统计图显示各班人数:${labels.map((l, i) => `${l}${data[i]}人`).join(',')}。哪个班人数最多?哪个班最少?`,
          answer: `${maxClass}最多(${max}人),${minClass}最少(${min}人)`,
          subtype: 'statistics',
          payload: { data, max, min, maxClassIdx: data.indexOf(max), minClassIdx: data.indexOf(min) },
        };
      },
    },
    {
      id: 'statistics-mean-compare',
      band: 'hard',
      generate(rng) {
        const n1 = rng.int(4, 6);
        const n2 = rng.int(4, 6);
        const d1 = Array.from({ length: n1 }, () => pickNumberByBand(rng, 'hard', { min: 15, max: 40 }));
        const d2 = Array.from({ length: n2 }, () => pickNumberByBand(rng, 'hard', { min: 15, max: 40 }));
        const m1 = Math.round(d1.reduce((a, b) => a + b, 0) / n1 * 10) / 10;
        const m2 = Math.round(d2.reduce((a, b) => a + b, 0) / n2 * 10) / 10;
        const diff = Math.round(Math.abs(m1 - m2) * 10) / 10;
        const better = m1 > m2 ? '第一组' : '第二组';
        return {
          question: `第一组平均数${m1},第二组平均数${m2},哪组平均数高?差多少?`,
          answer: `${better}高${diff}`,
          subtype: 'statistics',
          payload: { d1, d2, n1, n2, m1, m2, diff },
        };
      },
    },
  ];
}

export const statisticsTemplate = {
  id: 'statistics',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateStatisticsSubtemplates(),
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
