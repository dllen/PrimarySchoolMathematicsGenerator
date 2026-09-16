import { pickNumberByBand, pickForBand } from './helpers.js';

/**
 * 整除约束的构造式生成:确保 (dist + carLen) % speed === 0。
 *  - dist 取 speed 的整数倍(dist = speed * kMin..kMax)
 *  - carLen 也取 speed 的整数倍(0 或 2..5 倍)
 * 因此 (dist + carLen) / speed 一定是整数,无需重试。
 */
function genIntDiv(rng, band, { speedMin, speedMax, distMin, distMax, isExtra = false }) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const speed = pickNumberByBand(rng, band, { min: speedMin, max: speedMax });
    const kMin = Math.ceil(distMin / speed);
    const kMax = Math.floor(distMax / speed);
    if (kMin > kMax) continue;
    const distK = rng.int(kMin, kMax);
    const dist = speed * distK;
    const carLenK = isExtra ? rng.int(2, 5) : 0;
    const carLen = speed * carLenK;
    const total = dist + carLen;
    return { speed, dist, carLen, total, time: total / speed };
  }
  // 兜底:固定倍数
  const speed = pickNumberByBand(rng, band, { min: speedMin, max: speedMax });
  const dist = speed * 10;
  const carLen = isExtra ? speed * 3 : 0;
  return { speed, dist, carLen, total: dist + carLen, time: (dist + carLen) / speed };
}

/**
 * 两列火车相向而行"完全错开"问题:确保 (l1 + l2) % (v1 + v2) === 0。
 * 构造法:先抽 v1+v2,再让 lSum = (v1+v2) * k,再把 lSum 拆成 l1/l2(各自落在
 * 缩放后区间内)。hard band 1.8 缩放下 [100,300] → [180,540]。
 */
function genCrossMeet(rng) {
  const L_MIN = 180;
  const L_MAX = 540;
  const SUM_MIN = 2 * L_MIN;
  const SUM_MAX = 2 * L_MAX;
  for (let attempt = 0; attempt < 30; attempt++) {
    const v1 = pickNumberByBand(rng, 'hard', { min: 15, max: 30 });
    const v2 = pickNumberByBand(rng, 'hard', { min: 20, max: 35 });
    const vSum = v1 + v2;
    const kMin = Math.ceil(SUM_MIN / vSum);
    const kMax = Math.floor(SUM_MAX / vSum);
    if (kMin > kMax) continue;
    const lSum = vSum * rng.int(kMin, kMax);
    const l1Lo = Math.max(L_MIN, lSum - L_MAX);
    const l1Hi = Math.min(L_MAX, lSum - L_MIN);
    if (l1Lo > l1Hi) continue;
    const l1 = rng.int(l1Lo, l1Hi);
    const l2 = lSum - l1;
    if (l2 < L_MIN || l2 > L_MAX) continue;
    const time = lSum / vSum;
    return {
      question: `两列火车分别长${l1}米和${l2}米,各以每秒${v1}米和${v2}米的速度相向而行,从相遇到完全错开需多少秒?`,
      answer: `${time}秒`,
      subtype: 'train-bridge',
      payload: { kind: 'cross', v1, v2, l1, l2, time },
    };
  }
  // 兜底:固定组合
  const v1 = 20;
  const v2 = 20;
  const l1 = 200;
  const l2 = 200;
  return {
    question: `两列火车各长${l1}米,速度均为${v1}m/s,相向而行相遇完全错开需多少秒?`,
    answer: `${(l1 + l2) / (v1 + v2)}秒`,
    subtype: 'train-bridge',
    payload: { kind: 'cross', v1, v2, l1, l2, time: (l1 + l2) / (v1 + v2) },
  };
}

export const trainBridgeTemplate = {
  id: 'train-bridge',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'train-bridge-time',
      band: 'easy',
      generate(rng) {
        // speed 经 easy band 0.5 缩放后落在 [15, 25] m/s(54-90 km/h,慢速客车)。
        const { speed, dist, carLen, time } = genIntDiv(rng, 'easy', {
          speedMin: 30, speedMax: 50, distMin: 100, distMax: 400, isExtra: true,
        });
        return {
          question: `一列火车长${carLen}米,以每秒${speed}米的速度通过一座${dist}米长的桥,需要多少秒?`,
          answer: `${time}秒`,
          subtype: 'train-bridge',
          payload: { kind: 'bridge', speed, dist, carLen, time },
        };
      },
    },
    {
      id: 'train-tunnel-time',
      band: 'medium',
      // speed 经 medium band 1.0 缩放后落在 [20, 30] m/s(72-108 km/h,普通快车)。
      generate(rng) {
        const { speed, dist, carLen, time } = genIntDiv(rng, 'medium', {
          speedMin: 20, speedMax: 30, distMin: 200, distMax: 800, isExtra: true,
        });
        return {
          question: `火车长${carLen}米,以每秒${speed}米的速度完全通过一条${dist}米长的隧道,需要多少秒?`,
          answer: `${time}秒`,
          subtype: 'train-bridge',
          payload: { kind: 'tunnel', speed, dist, carLen, time },
        };
      },
    },
    {
      id: 'train-cross-meet',
      band: 'hard',
      generate(rng) { return genCrossMeet(rng); },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
