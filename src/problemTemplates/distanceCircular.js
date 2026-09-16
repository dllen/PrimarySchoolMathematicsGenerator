import { pickNumberByBand, pickForBand, pickNumberByBand as pN } from './helpers.js';

export const distanceCircularTemplate = {
  id: 'distance-circular',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'circular-meet',
      band: 'easy',
      generate(rng) {
        for (let attempt = 0; attempt < 20; attempt++) {
          const circumference = pN(rng, 'easy', { min: 200, max: 500 }) * 10;
          const v1 = pN(rng, 'easy', { min: 5, max: 15 });
          const v2 = pN(rng, 'easy', { min: 5, max: 15 });
          const sum = v1 + v2;
          if (circumference % sum === 0) {
            const t = circumference / sum;
            return {
              question: `环形跑道周长${circumference}米,甲速度${v1}m/s、乙速度${v2}m/s,两人从同点反向跑,多久相遇一次?`,
              answer: `${t}秒`,
              subtype: 'distance-circular',
              payload: { kind: 'opposite-meet', circumference, v1, v2, t },
            };
          }
        }
        return { question: '环形跑道周长400米,甲速度5m/s、乙速度3m/s,两人反向跑多久相遇?', answer: '50秒', subtype: 'distance-circular', payload: { kind: 'opposite-meet-fallback' } };
      },
    },
    {
      id: 'circular-chase',
      band: 'medium',
      generate(rng) {
        for (let attempt = 0; attempt < 20; attempt++) {
          const circumference = pN(rng, 'medium', { min: 300, max: 800 });
          const a = pN(rng, 'medium', { min: 6, max: 18 });
          const b = pN(rng, 'medium', { min: 4, max: 14 });
          const [fast, slow] = a > b ? [a, b] : [b, a];
          const diff = fast - slow;
          if (diff > 0 && circumference % diff === 0) {
            const t = circumference / diff;
            return {
              question: `环形跑道周长${circumference}米,甲速度${fast}m/s、乙速度${slow}m/s,同向跑,甲多久追上乙一次?`,
              answer: `${t}秒`,
              subtype: 'distance-circular',
              payload: { kind: 'chase', circumference, v1: fast, v2: slow, t },
            };
          }
        }
        return { question: '环形跑道周长500米,甲10m/s、乙6m/s同向跑,甲多久追上乙?', answer: '125秒', subtype: 'distance-circular', payload: { kind: 'chase-fallback' } };
      },
    },
    {
      id: 'circular-multi',
      band: 'hard',
      generate(rng) {
        const circumference = pN(rng, 'hard', { min: 400, max: 1000 });
        const v1 = pN(rng, 'hard', { min: 4, max: 10 });
        const v2 = pN(rng, 'hard', { min: 3, max: 8 });
        const sumV = v1 + v2;
        const t = circumference / sumV;
        const meets = Math.floor(60 / t);
        return {
          question: `环形跑道周长${circumference}米,甲${v1}m/s、乙${v2}m/s 反向跑,1 分钟内两人相遇几次?`,
          answer: `${meets}次(每 ${t.toFixed(1)} 秒相遇一次)`,
          subtype: 'distance-circular',
          payload: { kind: 'multi-meet', circumference, v1, v2, t, meets, windowSec: 60 },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
