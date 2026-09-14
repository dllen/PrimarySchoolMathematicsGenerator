// src/problemTemplates/helpers.js
// 跨模板通用的随机参数生成器 (Sub-project D, 2026-09-14)
// 不依赖 Vue / DOM,可被任何纯 JS 测试或模板直接 import。

/** @typedef {'easy' | 'medium' | 'hard'} Band */
export const BANDS = ['easy', 'medium', 'hard'];

/** DIFFICULTY_TO_LEVEL 反向映射:level 1/2/3 → easy/medium/hard。 */
const LEVEL_TO_BAND = { 1: 'easy', 2: 'medium', 3: 'hard' };

/** 把 difficultyLevel (1/2/3) 映射到 band;未知值兜底为 medium。 */
export const levelToBand = (level) => LEVEL_TO_BAND[level] ?? 'medium';

/** 各 band 对输入区间 [min, max] 的缩放因子 */
const BAND_SCALE = {
  easy: 0.5,
  medium: 1.0,
  hard: 1.8,
};

/**
 * 按 band 缩放后,在区间内取一个整数。
 *  - easy:   [floor(min*0.5), floor(max*0.5)],下界兜底为 1
 *  - medium: [min, max]
 *  - hard:   [floor(min*1.8), floor(max*1.8)]
 */
export function pickNumberByBand(rng, band, { min, max }) {
  const scale = BAND_SCALE[band] ?? 1.0;
  let lo = Math.floor(min * scale);
  let hi = Math.floor(max * scale);
  if (band === 'easy') lo = Math.max(1, lo);
  return rng.int(lo, hi);
}

/**
 * 按 band 取两个不同的整数(用于"差题"/"比多少"类)。
 * 保证返回的 pair 满足 a !== b 且都在缩放后区间内。
 */
export function pickPairByBand(rng, band, { min, max }) {
  const a = pickNumberByBand(rng, band, { min, max });
  let b;
  let tries = 0;
  do {
    b = pickNumberByBand(rng, band, { min, max });
    tries++;
  } while (b === a && tries < 10);
  return [a, b];
}

// 12 个中文常用人名,与小学应用题语境契合。
const PERSON_POOL = [
  '小明', '小红', '小华', '小丽', '小强', '小芳',
  '小军', '小梅', '大伟', '小玲', '小雪', '小刚',
];

/** 从 12 个中文人名中随机选一个。 */
export function pickPerson(rng) {
  return rng.pick(PERSON_POOL);
}

/** 从 PERSON_POOL 中不放回地抽取 n 个不重复的中文人名。 */
export function pickPeople(rng, n) {
  const pool = [...PERSON_POOL];
  const out = [];
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = rng.int(0, pool.length - 1);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}

/** 生成两个不重复的中文人名(来自 PERSON_POOL)。 */
export function pickTwoPeople(rng) {
  return pickPeople(rng, 2);
}


/**
 * 按难度等级从模板的 subtemplates 中选出并生成一题。
 * 集中所有模板共用的「level -> band -> 过滤 -> 随机挑一个」流程,
 * 并让"该 band 没有子模板"只在一个地方报错,而不是每个模板各自抛。
 */
export function pickForBand(template, difficultyLevel, rng) {
  const band = levelToBand(difficultyLevel);
  const pool = template.subtemplates.filter(t => t.band === band);
  if (pool.length === 0) {
    throw new Error(`No subtemplates for band=${band} in template=${template.id}`);
  }
  return rng.pick(pool).generate(rng);
}

/** 欧几里得算法求最大公约数。 */
export function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

/** 行程问题:生成两个不同的速度值 (m/min)。 */
export function pickTwoSpeeds(rng, band, { min, max }) {
  const [a, b] = pickPairByBand(rng, band, { min, max });
  return { speed1: a, speed2: b };
}

/** 分配比例:生成一个最简整数比 a:b。 */
export function pickRatio(rng, band) {
  const a = pickNumberByBand(rng, band, { min: 1, max: 5 });
  const b = pickNumberByBand(rng, band, { min: 1, max: 5 });
  const g = gcd(a, b);
  return { a: a / g, b: b / g };
}


/** 阶乘: n <= 6 (6!=720, 7!=5040 超过 perm <= 1000 约束)。 */
export function factorial(n) {
  if (n > 6) throw new Error('factorial: n must be <= 6');
  return n <= 1 ? 1 : n * factorial(n - 1);
}

/** 排列数 A(n,r) = n * (n-1) * ... * (n-r+1)。用乘法循环避免阶乘溢出。 */
export function perm(n, r) {
  let result = 1;
  for (let i = 0; i < r; i++) result *= (n - i);
  return result;
}

/** 组合数 C(n,r),用对称化简 + 乘法循环,避免中间阶乘溢出。 */
export function comb(n, r) {
  const k = Math.min(r, n - r);
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = result * (n - k + i) / i;
  }
  return Math.round(result);
}

/** 最小公倍数 lcm(a,b) = |a*b| / gcd(a,b) */
export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

/** 质数判断(试除法,适合 n <= 1000) */
export function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}
