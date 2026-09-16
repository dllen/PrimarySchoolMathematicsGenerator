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

/** pickClockTime: 分钟进度(0=整点,5=5的倍数,1=任意分钟) */
const BAND_MINUTE_STEP = {
  easy: 0,
  medium: 5,
  hard: 1,
};

/** pickDiscountRate: 10 档折扣 steps 数组的 band→索引区间(覆盖到 0.5/0.95) */
const BAND_DISCOUNT_RANGE = {
  easy: [0, 4],   // 0.50 – 0.70 (深折扣,让"便宜多少"更有冲击)
  medium: [2, 7], // 0.60 – 0.85
  hard: [5, 9],   // 0.75 – 0.95 (小折扣,反推原价更难)
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
  // Guard: the easy clamp can push lo above hi (e.g. {min:0,max:0} -> lo=1, hi=0).
  if (hi < lo) hi = lo;
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
  if (b === a) {
    // The band-scaled range collapsed to a single value; two distinct draws
    // are impossible. Fail loudly rather than silently returning [a, a].
    throw new Error(`pickPairByBand: cannot draw two distinct values in band=${band} range [${min}, ${max}]`);
  }
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
  const subtemplate = rng.pick(pool);
  const result = subtemplate.generate(rng);
  // 新增:让调用方拿到 subtemplate 粒度的 id 与 band,用于去重 / 报告
  return { ...result, subtemplateId: subtemplate.id, band };
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

/** 化简分数:返回 { numerator, denominator } (最简分数,denom > 0)。 */
export function simplifyFraction(num, den) {
  if (den === 0) throw new Error('simplifyFraction: denominator cannot be 0');
  const sign = (num < 0) !== (den < 0) ? -1 : 1;
  const absNum = Math.abs(num);
  const absDen = Math.abs(den);
  const g = gcd(absNum, absDen);
  return { numerator: sign * (absNum / g), denominator: absDen / g };
}

/** 把分数格式化为字符串:真分数返回 "a/b";整数返回 "a";带分数返回 "a b/c"。 */
export function formatFraction(num, den) {
  const { numerator, denominator } = simplifyFraction(num, den);
  if (denominator === 1) return String(numerator);
  if (Math.abs(numerator) >= denominator) {
    const whole = Math.trunc(numerator / denominator);
    const rem = numerator - whole * denominator;
    if (rem === 0) return String(whole);
    const s = simplifyFraction(Math.abs(rem), denominator);
    return `${whole} ${s.numerator}/${s.denominator}`;
  }
  return `${numerator}/${denominator}`;
}

/**
 * 规范化 rng:有 rng 则使用 rng.int/pick,否则回退到 Math.random。
 * 这样所有 strategy/template 都可以统一用 r(n,m) / rPick(arr) 而不必每次重复三元表达式。
 */
export function makeRng(rng) {
  const useMathRandom = !rng || !rng.int;
  const int = useMathRandom
    ? (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
    : (a, b) => rng.int(a, b);
  const pick = useMathRandom
    ? (arr) => arr[Math.floor(Math.random() * arr.length)]
    : (arr) => rng.pick(arr);
  return { int, pick };
}

/**
 * 生成合法 HH:MM 时间。band → 分钟步进(BAND_MINUTE_STEP):
 *  - easy   → :00 only (整点)
 *  - medium → multiples of 5 minutes (00/05/10/.../55)
 *  - hard   → any minute (00–59)
 * 小时始终在 [0, 23] 区间,与分钟步进无关。
 */
export function pickClockTime(rng, band = 'medium') {
  const hour = rng.int(0, 23);
  const minuteStep = BAND_MINUTE_STEP[band] ?? 5;
  const minute = minuteStep === 0 ? 0 : rng.int(0, 60 / minuteStep - 1) * minuteStep;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * 生成 0.5–0.95 区间的折扣率(以 0.05 为步长)。
 * band → 索引区间 (BAND_DISCOUNT_RANGE),easy 偏深折扣、hard 偏小折扣,
 * 让"现价反推原价 / 便宜多少"在不同难度下有不同数值冲击。
 */
export function pickDiscountRate(rng, band = 'medium') {
  const steps = [0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95];
  const [loIdx, hiIdx] = BAND_DISCOUNT_RANGE[band] ?? [2, 7];
  return steps[rng.int(loIdx, hiIdx)];
}

/**
 * 返回 2 个不同的合理速度(km/h),band 缩放。
 * 用于 boats / trains / 环形跑道等"机械/车辆"类行程题(km/h 域);
 * 区别于 pickTwoSpeeds(rng, band, {min,max}) —— 那个走 m/min 步行域。
 * 返回 [min, max],保证两值都落在缩放后区间内且不相等;区间退化时抛错。
 */
export function pickSpeedPair(rng, band = 'medium') {
  const scale = BAND_SCALE[band] ?? 1.0;
  const lo = Math.max(10, Math.floor(30 * scale));
  const hi = Math.floor(120 * scale);
  const a = rng.int(lo, hi);
  let b = rng.int(lo, hi);
  let tries = 0;
  while (b === a && tries < 10) {
    b = rng.int(lo, hi);
    tries++;
  }
  if (b === a) {
    throw new Error(`pickSpeedPair: cannot draw two distinct values in band=${band} range [${lo}, ${hi}]`);
  }
  return [Math.min(a, b), Math.max(a, b)];
}
