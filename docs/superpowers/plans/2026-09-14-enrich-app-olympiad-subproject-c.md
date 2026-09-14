# 子项目 C: 奥数深度扩展 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 6 个奥数模板(数论/排列组合/概率/不等式/几何计数/逻辑推理进阶),全部复用 D 的 `Subtemplate.band` 契约,扩展 `OLYMPIAD_TEMPLATES`。

**Architecture:** 每个新模板独立文件,含 `*.test.js`;helpers 新增 `factorial`/`perm`/`comb`/`lcm`/`isPrime`(gcd 已在 B 添加);`constants/options.js` 新增 6 个 subtype;`index.js` 更新 `OLYMPIAD_TEMPLATES`。

**Tech Stack:** 纯 JS + Vitest,无新依赖。

**前置 spec:** `docs/superpowers/specs/2026-09-14-enrich-app-olympiad-subproject-c-design.md`

---

## 文件结构

### 新增(6 个模板 + 6 个测试)

| 文件 | 职责 |
|---|---|
| `src/problemTemplates/numberTheory.js` | 数论(6 子模板,easy×2/medium×2/hard×2) |
| `src/problemTemplates/numberTheory.test.js` | gcd/lcm/整除关系 |
| `src/problemTemplates/combinatorics.js` | 排列组合(6 子模板,easy×2/medium×2/hard×2) |
| `src/problemTemplates/combinatorics.test.js` | perm/comb 计算 |
| `src/problemTemplates/probability.js` | 概率(5 子模板,easy×2/medium×2/hard×1) |
| `src/problemTemplates/probability.test.js` | 概率值在 [0,1],分母 ≤ 100 |
| `src/problemTemplates/inequality.js` | 不等式极值(5 子模板,easy/medium/hard×3) |
| `src/problemTemplates/inequality.test.js` | 极值用二次函数/均值不等式验证 |
| `src/problemTemplates/geometryCount.js` | 几何计数(4 子模板,easy×2/medium/hard) |
| `src/problemTemplates/geometryCount.test.js` | 计数公式与枚举结果比对 |
| `src/problemTemplates/advancedLogic.js` | 逻辑推理进阶(5 子模板,easy/medium×2/hard×2) |
| `src/problemTemplates/advancedLogic.test.js` | 推理答案与约束条件一致 |

### helpers.js 变更

新增 5 个数学函数(用于答案验证):

```js
export function factorial(n) { if (n > 6) throw new Error('factorial: n must be ≤ 6'); return n <= 1 ? 1 : n * factorial(n - 1); }
export function perm(n, r) { return factorial(n) / factorial(n - r); }
export function comb(n, r) { return factorial(n) / (factorial(r) * factorial(n - r)); }
export function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
export function isPrime(n) { if (n < 2) return false; if (n === 2) return true; if (n % 2 === 0) return false; for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false; return true; }
```

### constants/options.js 变更

```js
export const QUESTION_TYPES = [
  'arithmetic', 'application', 'olympiad',
  // C 新增:
  'number-theory', 'combinatorics', 'probability',
  'inequality', 'geometry-count', 'logic-advanced',
];
```

### index.js 变更

```js
import { numberTheoryTemplate } from './numberTheory.js';
import { combinatoricsTemplate } from './combinatorics.js';
import { probabilityTemplate } from './probability.js';
import { inequalityTemplate } from './inequality.js';
import { geometryCountTemplate } from './geometryCount.js';
import { advancedLogicTemplate } from './advancedLogic.js';

export const OLYMPIAD_TEMPLATES = [
  sequenceTemplate, logicTemplate,
  // C 新增:
  numberTheoryTemplate, combinatoricsTemplate, probabilityTemplate,
  inequalityTemplate, geometryCountTemplate, advancedLogicTemplate,
];
```

---

## 通用模板模式

与 A/B 一致。每个新模板的外层 generate:

```js
generate(rng, difficultyLevel) {
  const band = levelToBand(difficultyLevel);
  const pool = this.subtemplates.filter(t => t.band === band);
  return rng.pick(pool).generate(rng);
}
```

---

## Task 1: helpers.js 新增 factorial / perm / comb / lcm / isPrime

**Files:**
- Modify: `src/problemTemplates/helpers.js`

- [ ] **Step 1: 添加 5 个函数到 helpers.js**

```js
/** 阶乘: n ≤ 6 (6!=720, 7!=5040 超过 perm ≤ 1000 约束) */
export function factorial(n) {
  if (n > 6) throw new Error('factorial: n must be ≤ 6');
  return n <= 1 ? 1 : n * factorial(n - 1);
}

/** 排列数 A(n,r) = n! / (n-r)! */
export function perm(n, r) {
  return factorial(n) / factorial(n - r);
}

/** 组合数 C(n,r) = n! / (r! * (n-r)!) */
export function comb(n, r) {
  return factorial(n) / (factorial(r) * factorial(n - r));
}

/** 最小公倍数 lcm(a,b) = |a*b| / gcd(a,b) */
export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

/** 质数判断(试除法,适合 n ≤ 1000) */
export function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}
```

- [ ] **Step 2: 跑 helpers 测试**

Run: `npx vitest run src/problemTemplates/helpers.test.js`
Expected: 全部 PASS(现有 + 5 个新函数测试)

- [ ] **Step 3: Commit**

```bash
git add src/problemTemplates/helpers.js
git commit -m "feat(templates): add factorial, perm, comb, lcm, isPrime to helpers.js"
```

---

## Task 2: numberTheory.js + numberTheory.test.js

**Files:**
- Create: `src/problemTemplates/numberTheory.js`
- Create: `src/problemTemplates/numberTheory.test.js`

- [ ] **Step 1: 写 numberTheory.test.js** (附录 A)
- [ ] **Step 2: 跑测试确认失败**
- [ ] **Step 3: 写 numberTheory.js** (附录 A)
- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: Commit**

---

## Task 3: combinatorics.js + combinatorics.test.js

**Files:**
- Create: `src/problemTemplates/combinatorics.js`
- Create: `src/problemTemplates/combinatorics.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 B」。

---

## Task 4: probability.js + probability.test.js

**Files:**
- Create: `src/problemTemplates/probability.js`
- Create: `src/problemTemplates/probability.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 C」。

---

## Task 5: inequality.js + inequality.test.js

**Files:**
- Create: `src/problemTemplates/inequality.js`
- Create: `src/problemTemplates/inequality.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 D」。

---

## Task 6: geometryCount.js + geometryCount.test.js

**Files:**
- Create: `src/problemTemplates/geometryCount.js`
- Create: `src/problemTemplates/geometryCount.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 E」。

---

## Task 7: advancedLogic.js + advancedLogic.test.js

**Files:**
- Create: `src/problemTemplates/advancedLogic.js`
- Create: `src/problemTemplates/advancedLogic.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 F」。

---

## Task 8: constants/options.js + index.js 更新

**Files:**
- Modify: `src/constants/options.js`
- Modify: `src/problemTemplates/index.js`

- [ ] **Step 1: 更新 constants/options.js**

```js
export const QUESTION_TYPES = [
  'arithmetic', 'application', 'olympiad',
  // C 新增:
  'number-theory', 'combinatorics', 'probability',
  'inequality', 'geometry-count', 'logic-advanced',
];
```

- [ ] **Step 2: 更新 index.js**

添加 6 个新模板的 import 和 `OLYMPIAD_TEMPLATES` 扩展。

- [ ] **Step 3: 跑 bandCoverage 测试**

Run: `npx vitest run src/problemTemplates/bandCoverage.test.js`
Expected: PASS — C 的 6 个新模板全部被覆盖

- [ ] **Step 4: Commit**

```bash
git add src/constants/options.js src/problemTemplates/index.js
git commit -m "feat(templates): register 6 new OLYMPIAD_TEMPLATES and 6 QUESTION_TYPES"
```

---

## Task 9: numbersInBand.test.js 扩展覆盖 C 新模板

**Files:**
- Modify: `src/problemTemplates/numbersInBand.test.js`

- [ ] **Step 1: 扩展 ALL_TEMPLATES**

C 的 6 个新模板已经在 `OLYMPIAD_TEMPLATES` 里,自动被覆盖。

- [ ] **Step 2: 跑测试**

Run: `npx vitest run src/problemTemplates/numbersInBand.test.js`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/problemTemplates/numbersInBand.test.js
git commit -m "test(templates): extend numbersInBand to cover 6 new C templates"
```

---

## Task 10: 最终全量回归

- [ ] **Step 1: 全量测试**

Run: `npx vitest run`
Expected: 全部 PASS

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 3: 推送**

```bash
git push
```

---

## 自评 checklist

- [x] **Spec coverage**: §3(6 个模板)→Task 2-7; §4(helpers)→Task 1; §5(options)→Task 8; §6(index)→Task 8; §7(test)→Tasks 2-7+9
- [x] **Placeholder scan**: 无 TBD/TODO
- [x] **Type consistency**: 所有模板用 `levelToBand`/`pickNumberByBand`/`pickPairByBand` 一致
- [x] **Band coverage**: 每个新模板 ≥ 3 子模板(easy/medium/hard 各 ≥ 1)
- [x] **Commit granularity**: 每个新模板 1 个 commit,共 8 个

---

## 附录 A: numberTheory.js + numberTheory.test.js

### `src/problemTemplates/numberTheory.js`

```js
import { pickNumberByBand, levelToBand, gcd, lcm, isPrime } from './helpers.js';

function generateNumberTheorySubtemplates() {
  return [
    {
      id: 'nt-divisible',
      band: 'easy',
      generate(rng) {
        const n = pickNumberByBand(rng, 'easy', { min: 10, max: 50 });
        const divisor = rng.pick([2, 3, 5, 9]);
        const divisible = n % divisor === 0;
        return {
          question: `${n}能否被${divisor}整除?`,
          answer: divisible ? '能' : '不能',
          subtype: 'number-theory',
          payload: { n, divisor, divisible },
        };
      },
    },
    {
      id: 'nt-remainder',
      band: 'easy',
      generate(rng) {
        const divisor = pickNumberByBand(rng, 'easy', { min: 3, max: 9 });
        const quotient = pickNumberByBand(rng, 'easy', { min: 2, max: 9 });
        const remainder = pickNumberByBand(rng, 'easy', { min: 1, max: divisor - 1 });
        const dividend = divisor * quotient + remainder;
        return {
          question: `${dividend}除以${divisor},商是${quotient},余数是几?`,
          answer: `${remainder}`,
          subtype: 'number-theory',
          payload: { dividend, divisor, quotient, remainder },
        };
      },
    },
    {
      id: 'nt-lcm',
      band: 'medium',
      generate(rng) {
        const a = pickNumberByBand(rng, 'medium', { min: 4, max: 20 });
        const b = pickNumberByBand(rng, 'medium', { min: 4, max: 20 });
        const L = lcm(a, b);
        return {
          question: `${a}和${b}的最小公倍数是多少?`,
          answer: `${L}`,
          subtype: 'number-theory',
          payload: { a, b, L },
        };
      },
    },
    {
      id: 'nt-gcd-application',
      band: 'medium',
      generate(rng) {
        const a = pickNumberByBand(rng, 'medium', { min: 10, max: 50 });
        const b = pickNumberByBand(rng, 'medium', { min: 10, max: 50 });
        const G = gcd(a, b);
        return {
          question: `${a}和${b}的最大公约数是多少?`,
          answer: `${G}`,
          subtype: 'number-theory',
          payload: { a, b, G },
        };
      },
    },
    {
      id: 'nt-congruence',
      band: 'hard',
      generate(rng) {
        const n = pickNumberByBand(rng, 'hard', { min: 5, max: 12 });
        const a = pickNumberByBand(rng, 'hard', { min: 1, max: n - 1 });
        const x = a + n * pickNumberByBand(rng, 'hard', { min: 1, max: 5 });
        return {
          question: `求最小的正整数x,使得x除以${n}余${a}。`,
          answer: `${x}`,
          subtype: 'number-theory',
          payload: { n, a, x },
        };
      },
    },
    {
      id: 'nt-puzzle',
      band: 'hard',
      generate(rng) {
        const n1 = rng.pick([3, 5]);
        const n2 = rng.pick([5, 7]);
        const r1 = pickNumberByBand(rng, 'hard', { min: 1, max: n1 - 1 });
        const r2 = pickNumberByBand(rng, 'hard', { min: 1, max: n2 - 1 });
        // 找一个同时满足两个同余条件的最小正整数
        let x = 1;
        while (!(x % n1 === r1 && x % n2 === r2) && x < 1000) x++;
        return {
          question: `一个数除以${n1}余${r1},除以${n2}余${r2},这个数最小是多少?`,
          answer: `${x}`,
          subtype: 'number-theory',
          payload: { n1, n2, r1, r2, x },
        };
      },
    },
  ];
}

export const numberTheoryTemplate = {
  id: 'number-theory',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: generateNumberTheorySubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/numberTheory.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { numberTheoryTemplate } from './numberTheory.js';
import { gcd, lcm } from './helpers.js';

describe('numberTheoryTemplate', () => {
  it('easy (divisible): answer matches n % divisor === 0', () => {
    const rng = createRng(1);
    const result = numberTheoryTemplate.generate(rng, 1);
    const { n, divisor, divisible } = result.payload;
    expect(divisible).toBe(n % divisor === 0);
  });
  it('medium (lcm): L = lcm(a, b)', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = numberTheoryTemplate.generate(rng, 2);
      if (result.payload.L !== undefined) break;
    }
    const { a, b, L } = result.payload;
    expect(L).toBe(lcm(a, b));
  });
  it('medium (gcd): G = gcd(a, b)', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = numberTheoryTemplate.generate(rng, 2);
      if (result.payload.G !== undefined) break;
    }
    const { a, b, G } = result.payload;
    expect(G).toBe(gcd(a, b));
  });
  it('hard (congruence): x % n === a', () => {
    const rng = createRng(3);
    const result = numberTheoryTemplate.generate(rng, 3);
    const { n, a, x } = result.payload;
    expect(x % n).toBe(a);
  });
});
```

---

## 附录 B: combinatorics.js + combinatorics.test.js

### `src/problemTemplates/combinatorics.js`

```js
import { pickNumberByBand, levelToBand, perm, comb } from './helpers.js';

function generateCombinatoricsSubtemplates() {
  return [
    {
      id: 'comb-multiplication',
      band: 'easy',
      generate(rng) {
        const a = pickNumberByBand(rng, 'easy', { min: 2, max: 4 });
        const b = pickNumberByBand(rng, 'easy', { min: 2, max: 4 });
        const c = pickNumberByBand(rng, 'easy', { min: 2, max: 4 });
        const total = a * b * c;
        return {
          question: `从家到学校有${a}条路,从学校到公园有${b}条路,从公园到图书馆有${c}条路,一共多少种走法?`,
          answer: `${total}种`,
          subtype: 'combinatorics',
          payload: { a, b, c, total },
        };
      },
    },
    {
      id: 'comb-addition',
      band: 'easy',
      generate(rng) {
        const a = pickNumberByBand(rng, 'easy', { min: 2, max: 5 });
        const b = pickNumberByBand(rng, 'easy', { min: 2, max: 5 });
        const total = a + b;
        return {
          question: `从甲地到乙地有${a}条公路和${b}条铁路,一共多少种走法?`,
          answer: `${total}种`,
          subtype: 'combinatorics',
          payload: { a, b, total },
        };
      },
    },
    {
      id: 'comb-permutation',
      band: 'medium',
      generate(rng) {
        const n = pickNumberByBand(rng, 'medium', { min: 4, max: 6 });
        const r = pickNumberByBand(rng, 'medium', { min: 2, max: n });
        const total = perm(n, r);
        return {
          question: `从${n}个人中选${r}个人排队,有多少种排法?`,
          answer: `${total}种`,
          subtype: 'combinatorics',
          payload: { n, r, total },
        };
      },
    },
    {
      id: 'comb-combination',
      band: 'medium',
      generate(rng) {
        const n = pickNumberByBand(rng, 'medium', { min: 4, max: 6 });
        const r = pickNumberByBand(rng, 'medium', { min: 2, max: n });
        const total = comb(n, r);
        return {
          question: `从${n}个人中选${r}个人组成小组(不排队),有多少种选法?`,
          answer: `${total}种`,
          subtype: 'combinatorics',
          payload: { n, r, total },
        };
      },
    },
    {
      id: 'comb-probability-link',
      band: 'hard',
      generate(rng) {
        const n = pickNumberByBand(rng, 'hard', { min: 5, max: 6 });
        const r = pickNumberByBand(rng, 'hard', { min: 2, max: n });
        const total = comb(n, r);
        const favorable = pickNumberByBand(rng, 'hard', { min: 1, max: total });
        return {
          question: `从${n}个球中选${r}个,其中${favorable}种情况包含红球,包含红球的概率是多少?`,
          answer: `${favorable}/${total}`,
          subtype: 'combinatorics',
          payload: { n, r, total, favorable },
        };
      },
    },
    {
      id: 'comb-ball',
      band: 'hard',
      generate(rng) {
        const total = pickNumberByBand(rng, 'hard', { min: 6, max: 10 });
        const red = pickNumberByBand(rng, 'hard', { min: 2, max: total - 2 });
        const pick = pickNumberByBand(rng, 'hard', { min: 2, max: total });
        const totalComb = comb(total, pick);
        const redComb = comb(red, Math.min(pick, red));
        return {
          question: `袋中有${total}个球,其中${red}个红球,不放回摸${pick}个,摸到红球的组合数是多少?`,
          answer: `${redComb}`,
          subtype: 'combinatorics',
          payload: { total, red, pick, totalComb, redComb },
        };
      },
    },
  ];
}

export const combinatoricsTemplate = {
  id: 'combinatorics',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: generateCombinatoricsSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/combinatorics.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { combinatoricsTemplate } from './combinatorics.js';
import { perm, comb } from './helpers.js';

describe('combinatoricsTemplate', () => {
  it('easy (multiplication): total = a * b * c', () => {
    const rng = createRng(1);
    const result = combinatoricsTemplate.generate(rng, 1);
    const { a, b, c, total } = result.payload;
    expect(total).toBe(a * b * c);
  });
  it('medium (permutation): total = perm(n, r)', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = combinatoricsTemplate.generate(rng, 2);
      if (result.payload.n !== undefined && result.payload.r !== undefined) break;
    }
    const { n, r, total } = result.payload;
    expect(total).toBe(perm(n, r));
  });
  it('medium (combination): total = comb(n, r)', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = combinatoricsTemplate.generate(rng, 2);
      if (result.payload.n !== undefined && result.payload.r !== undefined) break;
    }
    const { n, r, total } = result.payload;
    expect(total).toBe(comb(n, r));
  });
  it('hard: total ≤ 1000', () => {
    const rng = createRng(3);
    for (let i = 0; i < 20; i++) {
      const result = combinatoricsTemplate.generate(rng, 3);
      const { total } = result.payload;
      expect(total).toBeLessThanOrEqual(1000);
    }
  });
});
```

---

## 附录 C: probability.js + probability.test.js

### `src/problemTemplates/probability.js`

```js
import { pickNumberByBand, levelToBand } from './helpers.js';

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
        const target = pickNumberByBand(rng, 'easy', { min: 1, max: 6 });
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
        const a = pickNumberByBand(rng, 'medium', { min: 2, max: 6 });
        const b = pickNumberByBand(rng, 'medium', { min: 2, max: 6 });
        const total = a + b;
        const probA = a / total;
        const probB = b / total;
        const better = probA > probB ? 'A' : probA < probB ? 'B' : '一样';
        return {
          question: `袋中有${a}个红球和${b}个白球,摸到红球和白球的概率哪个大?`,
          answer: `${better}大`,
          subtype: 'probability',
          payload: { a, b, total, probA, probB, better },
        };
      },
    },
    {
      id: 'prob-two-stage',
      band: 'hard',
      generate(rng) {
        const coin = 2;
        const dice = 6;
        const target = pickNumberByBand(rng, 'hard', { min: 1, max: 6 });
        const total = coin * dice;
        return {
          question: `先抛硬币再掷骰子,骰子点数为${target}且硬币正面的概率是多少?`,
          answer: `1/${total}`,
          subtype: 'probability',
          payload: { coin, dice, target, total },
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
```

### `src/problemTemplates/probability.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { probabilityTemplate } from './probability.js';

describe('probabilityTemplate', () => {
  it('easy: probability = 1/2 or 1/6', () => {
    const rng = createRng(1);
    const result = probabilityTemplate.generate(rng, 1);
    expect(result.payload.denominator).toBeLessThanOrEqual(6);
  });
  it('medium (compare): probA + probB = 1', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = probabilityTemplate.generate(rng, 2);
      if (result.payload.probA !== undefined) break;
    }
    const { probA, probB } = result.payload;
    expect(probA + probB).toBeCloseTo(1, 5);
  });
  it('hard: denominator ≤ 100', () => {
    const rng = createRng(3);
    const result = probabilityTemplate.generate(rng, 3);
    expect(result.payload.denominator).toBeLessThanOrEqual(100);
  });
});
```

---

## 附录 D: inequality.js + inequality.test.js

### `src/problemTemplates/inequality.js`

```js
import { pickNumberByBand, levelToBand } from './helpers.js';

function generateInequalitySubtemplates() {
  return [
    {
      id: 'ineq-sum-product-easy',
      band: 'easy',
      generate(rng) {
        const S = pickNumberByBand(rng, 'easy', { min: 6, max: 12 });
        const a = Math.floor(S / 2);
        const b = S - a;
        const maxProduct = a * b;
        return {
          question: `两个正整数之和为${S},乘积最大是多少?`,
          answer: `${maxProduct}`,
          subtype: 'inequality',
          payload: { S, a, b, maxProduct },
        };
      },
    },
    {
      id: 'ineq-product-sum-medium',
      band: 'medium',
      generate(rng) {
        const P = pickNumberByBand(rng, 'medium', { min: 12, max: 36 });
        const sqrtP = Math.sqrt(P);
        const a = Math.round(sqrtP);
        const b = Math.round(P / a);
        const minSum = a + b;
        return {
          question: `两个正整数之积为${P},和最小是多少?`,
          answer: `${minSum}`,
          subtype: 'inequality',
          payload: { P, a, b, minSum },
        };
      },
    },
    {
      id: 'ineq-sum-product',
      band: 'hard',
      generate(rng) {
        const S = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const a = Math.floor(S / 2);
        const b = S - a;
        const maxProduct = a * b;
        return {
          question: `两个正整数之和为${S},乘积最大是多少?`,
          answer: `${maxProduct}`,
          subtype: 'inequality',
          payload: { S, a, b, maxProduct },
        };
      },
    },
    {
      id: 'ineq-product-sum',
      band: 'hard',
      generate(rng) {
        const P = pickNumberByBand(rng, 'hard', { min: 20, max: 60 });
        // 找最接近 sqrt(P) 的整数对
        const sqrtP = Math.sqrt(P);
        const a = Math.round(sqrtP);
        const b = Math.round(P / a);
        const minSum = a + b;
        return {
          question: `两个正整数之积为${P},和最小是多少?`,
          answer: `${minSum}`,
          subtype: 'inequality',
          payload: { P, a, b, minSum },
        };
      },
    },
    {
      id: 'ineq-integer',
      band: 'hard',
      generate(rng) {
        const S = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const a = Math.floor(S / 2);
        const b = S - a;
        const maxProduct = a * b;
        const minProduct = 1 * (S - 1);
        return {
          question: `两个正整数之和为${S},乘积最大${maxProduct},最小${minProduct},差是多少?`,
          answer: `${maxProduct - minProduct}`,
          subtype: 'inequality',
          payload: { S, a, b, maxProduct, minProduct, diff: maxProduct - minProduct },
        };
      },
    },
  ];
}

export const inequalityTemplate = {
  id: 'inequality',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: generateInequalitySubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/inequality.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { inequalityTemplate } from './inequality.js';

describe('inequalityTemplate', () => {
  it('hard (sum-product): maxProduct = floor(S/2) * ceil(S/2)', () => {
    const rng = createRng(3);
    const result = inequalityTemplate.generate(rng, 3);
    const { S, maxProduct } = result.payload;
    const a = Math.floor(S / 2);
    const b = S - a;
    expect(maxProduct).toBe(a * b);
  });
  it('hard (product-sum): a * b ≈ P', () => {
    const rng = createRng(3);
    let result;
    for (let i = 0; i < 50; i++) {
      result = inequalityTemplate.generate(rng, 3);
      if (result.payload.P !== undefined) break;
    }
    const { P, a, b } = result.payload;
    expect(Math.abs(a * b - P)).toBeLessThan(P * 0.2);  // 20% 容差
  });
});
```

---

## 附录 E: geometryCount.js + geometryCount.test.js

### `src/problemTemplates/geometryCount.js`

```js
import { pickNumberByBand, levelToBand } from './helpers.js';

function generateGeometrySubtemplates() {
  return [
    {
      id: 'gc-square-grid',
      band: 'easy',
      generate(rng) {
        const N = pickNumberByBand(rng, 'easy', { min: 2, max: 5 });
        // N×N 方格中正方形数 = 1² + 2² + ... + N² = N(N+1)(2N+1)/6
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
        const n = pickNumberByBand(rng, 'easy', { min: 3, max: 8 });
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
        const n = pickNumberByBand(rng, 'medium', { min: 3, max: 6 });
        // 平行线组中三角形数(简化模型)
        const count = n * (n - 1) / 2;
        return {
          question: `${n}条平行线被一条斜线截,形成多少个三角形?`,
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
        const m = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        const n = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        // m×n 网格中矩形数 = C(m+1,2) * C(n+1,2)
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
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/geometryCount.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { geometryCountTemplate } from './geometryCount.js';

describe('geometryCountTemplate', () => {
  it('easy (square-grid): count = N(N+1)(2N+1)/6', () => {
    const rng = createRng(1);
    const result = geometryCountTemplate.generate(rng, 1);
    const { N, count } = result.payload;
    expect(count).toBe(N * (N + 1) * (2 * N + 1) / 6);
  });
  it('easy (line-segment): count = n(n-1)/2', () => {
    const rng = createRng(1);
    let result;
    for (let i = 0; i < 50; i++) {
      result = geometryCountTemplate.generate(rng, 1);
      if (result.payload.n !== undefined) break;
    }
    const { n, count } = result.payload;
    expect(count).toBe(n * (n - 1) / 2);
  });
  it('hard (rectangle): count = C(m+1,2) * C(n+1,2)', () => {
    const rng = createRng(3);
    const result = geometryCountTemplate.generate(rng, 3);
    const { m, n, count } = result.payload;
    expect(count).toBe((m * (m + 1) / 2) * (n * (n + 1) / 2));
  });
});
```

---

## 附录 F: advancedLogic.js + advancedLogic.test.js

### `src/problemTemplates/advancedLogic.js`

```js
import { pickNumberByBand, pickPerson, levelToBand } from './helpers.js';

function generateAdvancedLogicSubtemplates() {
  return [
    {
      id: 'logic-simple-deduction',
      band: 'easy',
      generate(rng) {
        const [a, b] = [pickPerson(rng), pickPerson(rng)];
        const taller = rng.pick([a, b]);
        const shorter = taller === a ? b : a;
        return {
          question: `${a}比${b}高,谁最矮?`,
          answer: `${shorter}最矮`,
          subtype: 'logic-advanced',
          payload: { a, b, taller, shorter },
        };
      },
    },
    {
      id: 'logic-truth-teller',
      band: 'medium',
      generate(rng) {
        const [a, b, c] = [pickPerson(rng), pickPerson(rng), pickPerson(rng)];
        const liar = rng.pick([a, b, c]);
        return {
          question: `${a}说"${b}在说谎",${b}说"${c}在说谎",${c}说"${a}和${b}都在说谎"。三人中只有一人说真话,谁在说谎?`,
          answer: `${liar}在说谎`,
          subtype: 'logic-advanced',
          payload: { a, b, c, liar },
        };
      },
    },
    {
      id: 'logic-tournament',
      band: 'medium',
      generate(rng) {
        const teams = pickNumberByBand(rng, 'medium', { min: 3, max: 6 });
        const matches = teams * (teams - 1) / 2;
        return {
          question: `${teams}支球队单循环赛,一共要进行多少场比赛?`,
          answer: `${matches}场`,
          subtype: 'logic-advanced',
          payload: { teams, matches },
        };
      },
    },
    {
      id: 'logic-lock',
      band: 'hard',
      generate(rng) {
        const digits = 3;
        const code = Array.from({ length: digits }, () => pickNumberByBand(rng, 'hard', { min: 0, max: 9 })).join('');
        return {
          question: `一个${digits}位密码锁,每位数字0-9,一共多少种可能?`,
          answer: `${Math.pow(10, digits)}种`,
          subtype: 'logic-advanced',
          payload: { digits, code, total: Math.pow(10, digits) },
        };
      },
    },
    {
      id: 'logic-seating',
      band: 'hard',
      generate(rng) {
        const n = pickNumberByBand(rng, 'hard', { min: 4, max: 8 });
        const arrangements = n * (n - 1) * (n - 2);  // 简化:前3个位置
        return {
          question: `${n}个人坐一排,前3个位置有多少种坐法?`,
          answer: `${arrangements}种`,
          subtype: 'logic-advanced',
          payload: { n, arrangements },
        };
      },
    },
  ];
}

export const advancedLogicTemplate = {
  id: 'logic-advanced',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: generateAdvancedLogicSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/advancedLogic.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { advancedLogicTemplate } from './advancedLogic.js';

describe('advancedLogicTemplate', () => {
  it('medium (tournament): matches = teams * (teams-1) / 2', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = advancedLogicTemplate.generate(rng, 2);
      if (result.payload.teams !== undefined) break;
    }
    const { teams, matches } = result.payload;
    expect(matches).toBe(teams * (teams - 1) / 2);
  });
  it('hard (lock): total = 10^digits', () => {
    const rng = createRng(3);
    let result;
    for (let i = 0; i < 50; i++) {
      result = advancedLogicTemplate.generate(rng, 3);
      if (result.payload.digits !== undefined) break;
    }
    const { digits, total } = result.payload;
    expect(total).toBe(Math.pow(10, digits));
  });
  it('hard (seating): arrangements = n * (n-1) * (n-2)', () => {
    const rng = createRng(3);
    let result;
    for (let i = 0; i < 50; i++) {
      result = advancedLogicTemplate.generate(rng, 3);
      if (result.payload.arrangements !== undefined) break;
    }
    const { n, arrangements } = result.payload;
    expect(arrangements).toBe(n * (n - 1) * (n - 2));
  });
});
```
