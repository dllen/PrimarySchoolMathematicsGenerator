import { pickForBand } from './helpers.js';

/** 时针角度 = 30*H + 0.5*M;分针角度 = 6*M。差值(0–180) 单位 度。 */
function angleBetween(h, m) {
  const hourAngle = 30 * h + 0.5 * m;
  const minuteAngle = 6 * m;
  const diff = Math.abs(hourAngle - minuteAngle) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export const clockAngleTemplate = {
  id: 'clock-angle',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'clock-angle-find',
      band: 'easy',
      generate(rng) {
        for (let attempt = 0; attempt < 30; attempt++) {
          const h = rng.int(1, 12);
          const m = 0;
          const angle = angleBetween(h, m);
          return {
            question: `钟表上${h}点整时,时针与分针的夹角是多少度?`,
            answer: `${angle}°`,
            subtype: 'clock-angle',
            payload: { h, m, angle, kind: 'find-angle' },
          };
        }
      },
    },
    {
      id: 'clock-coincide',
      band: 'medium',
      generate(rng) {
        for (let attempt = 0; attempt < 30; attempt++) {
          const h = rng.int(1, 11);
          const minutes = Math.round((60 * h) / 11);
          if (minutes >= 55 && minutes <= 65) {
            return {
              question: `${h}点整之后,时针和分针下次重合大约是多少分钟后(取整数)?`,
              answer: `${minutes}分钟后`,
              subtype: 'clock-angle',
              payload: { h, minutes, kind: 'coincide' },
            };
          }
        }
        return { question: '1点整之后,时针和分针下次重合大约是多少分钟后?', answer: '55分钟后', subtype: 'clock-angle', payload: { kind: 'coincide-fallback' } };
      },
    },
    {
      id: 'clock-straight',
      band: 'hard',
      generate(rng) {
        for (let attempt = 0; attempt < 50; attempt++) {
          const h = rng.int(0, 11);
          const mSteps = rng.int(0, 11);
          const m = mSteps * 5;
          const m1 = (30 * h - 180) / 5.5;
          const m2 = (30 * h + 180) / 5.5;
          const candidates = [m1, m2].filter(x => x >= 0 && x < 60 && Number.isInteger(x * 2));
          if (candidates.length > 0) {
            const mReal = candidates[0];
            const angle = angleBetween(h, mReal);
            if (Math.abs(angle - 180) < 0.001) {
              return {
                question: `${h}点${Math.round(mReal)}分时,时针与分针成一条直线(180°),该时间点的分针数是多少?`,
                answer: `${Math.round(mReal)}分`,
                subtype: 'clock-angle',
                payload: { h, m: mReal, angle: 180, kind: 'straight' },
              };
            }
          }
        }
        return { question: '3点几分时,时针与分针成一条直线?', answer: '49分', subtype: 'clock-angle', payload: { kind: 'straight-fallback' } };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
