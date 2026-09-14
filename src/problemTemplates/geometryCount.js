import { comb, pickForBand } from './helpers.js';

function generateGeometrySubtemplates() {
  return [
    {
      id: 'gc-square-grid',
      band: 'easy',
      generate(rng) {
        const N = rng.int(2, 5);
        // N x N 方格中正方形数 = 1^2 + 2^2 + ... + N^2 = N(N+1)(2N+1)/6
        const count = N * (N + 1) * (2 * N + 1) / 6;
        return {
          question: `${N}×${N}的方格图中,一共有多少个正方形?`,
          answer: `${count}个`,
          subtype: 'geometry-count',
          payload: { N, count },
        };
      },
    },
    {
      id: 'gc-line-segment',
      band: 'easy',
      generate(rng) {
        const n = rng.int(3, 8);
        // n 个点内线段数 = n(n-1)/2
        const count = n * (n - 1) / 2;
        return {
          question: `一条直线上有${n}个点,一共有多少条线段?`,
          answer: `${count}条`,
          subtype: 'geometry-count',
          payload: { n, count },
        };
      },
    },
    {
      id: 'gc-triangle',
      band: 'medium',
      generate(rng) {
        const n = rng.int(4, 6);
        // 从 n 个点中任选 3 个组成三角形 = C(n,3)
        const count = comb(n, 3);
        return {
          question: `圆上有${n}个点,任选3个点组成三角形,一共有多少个三角形?`,
          answer: `${count}个`,
          subtype: 'geometry-count',
          payload: { n, count },
        };
      },
    },
    {
      id: 'gc-rectangle',
      band: 'hard',
      generate(rng) {
        const m = rng.int(2, 5);
        const n = rng.int(2, 5);
        // m x n 网格中矩形数 = C(m+1,2) * C(n+1,2)
        const count = (m * (m + 1) / 2) * (n * (n + 1) / 2);
        return {
          question: `${m}×${n}的网格中,一共有多少个矩形?`,
          answer: `${count}个`,
          subtype: 'geometry-count',
          payload: { m, n, count },
        };
      },
    },
  ];
}

export const geometryCountTemplate = {
  id: 'geometry-count',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: generateGeometrySubtemplates(),
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
