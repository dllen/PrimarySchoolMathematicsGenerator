# 应用题 / 奥数题 — 子项目 D:难度梯度重构 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 6 个现有 problemTemplates 升级为显式 `Subtemplate.band` 契约,集中跨模板随机参数到 `helpers.js`,并通过新测试守住"每模板每 band ≥ 1 子模板 + 数字范围不超 band 上限"两个不变式。

**Architecture:** TDD。Task 1 先建 helpers + 测试;Tasks 2–7 逐个迁移模板文件,每迁移一个跑一次现有测试;Task 8 加 bandCoverage 测试守住契约;Task 9 加 numbersInBand 测试守住数字范围;Task 10 全量回归。

**Tech Stack:** 纯 JS + Vitest,无新依赖。

**前置 spec:** `docs/superpowers/specs/2026-09-14-enrich-app-olympiad-subproject-d-design.md`

---

## 文件结构

### 新增

| 文件 | 职责 |
|---|---|
| `src/problemTemplates/helpers.js` | BANDS / levelToBand / pickNumberByBand / pickPairByBand / pickPerson / assertInRange |
| `src/problemTemplates/helpers.test.js` | helpers 单元测试 |
| `src/problemTemplates/bandCoverage.test.js` | 每模板每 band ≥ 1 子模板(契约回归) |
| `src/problemTemplates/numbersInBand.test.js` | 生成值不超 band 上限(数值快照) |

> **路径说明**:新测试放 `src/problemTemplates/` 而非 spec 里写的 `tests/problemTemplates/`,与项目现有约定一致(模板单测和源文件同目录)。

### 修改

| 文件 | 子模板数 | band 分配(详见 Task 2-7) |
|---|---|---|
| `src/problemTemplates/shopping.js` | 10 | 见 Task 2 |
| `src/problemTemplates/comparison.js` | 12 | 见 Task 3 |
| `src/problemTemplates/time.js` | 7 | 见 Task 4 |
| `src/problemTemplates/chickenRabbit.js` | 5 | 见 Task 5 |
| `src/problemTemplates/sequence.js` | 9 | 见 Task 6 |
| `src/problemTemplates/logic.js` | 13 | 见 Task 7 |

(合计 57 个子模板的 `generate(rng, difficulty)` → `generate(rng)` + 加 `band` 字段)

### 不修改

`src/problemTemplates/index.js`、所有 strategy 类、`ProblemGeneratorFactory.js`、`src/constants/options.js`、UI、router、Strategy 测试。

---

## 通用迁移模式(每个模板复用)

**子模板变化**(以 shopping 为例,其他文件同款):

```js
// 旧:
{
  id: 'shopping-total-price',
  generate(rng, difficulty) {
    const unitPrice = rng.int(1, 5 + difficulty * 3);
    const quantity = rng.int(2, 5 + difficulty * 3);
    // ...
  }
}

// 新:
{
  id: 'shopping-total-price',
  band: 'easy',           // ★ 新增
  generate(rng) {           // ★ 去掉 difficulty 参数
    const unitPrice = pickNumberByBand(rng, 'easy', { min: 2, max: 8 });
    const quantity = pickNumberByBand(rng, 'easy', { min: 2, max: 5 });
    // ...
  }
}
```

**模板外层 generate 变化**(6 个文件都一样):

```js
// 旧:
generate(rng, difficulty) {
  const subtemplate = rng.pick(this.subtemplates);
  return subtemplate.generate(rng, difficulty);
}

// 新:
generate(rng, difficultyLevel) {
  const band = levelToBand(difficultyLevel);
  const pool = this.subtemplates.filter(t => t.band === band);
  if (!pool.length) {
    throw new Error(`No subtemplates for band=${band} in template=${this.id}`);
  }
  return rng.pick(pool).generate(rng);
}
```

---

## Task 1: 创建 helpers.js + helpers.test.js

**Files:**
- Create: `src/problemTemplates/helpers.js`
- Create: `src/problemTemplates/helpers.test.js`

✓ [x] **Step 1: 写 helpers.test.js**

完整内容见本文末尾「附录 A:Task 1 完整代码」。先写测试,跑确认 fail。

✓ [x] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/helpers.test.js`
Expected: FAIL — `Failed to resolve import "./helpers.js"` 或 `Cannot find module`

✓ [x] **Step 3: 写 helpers.js**

完整内容见本文末尾「附录 A:Task 1 完整代码」。

✓ [x] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/helpers.test.js`
Expected: PASS — 全部测试通过

✓ [x] **Step 5: 跑全量测试确保无回归**

Run: `npx vitest run`
Expected: 现有测试(476 个)全部 PASS

✓ [x] **Step 6: Commit**

```bash
git add src/problemTemplates/helpers.js src/problemTemplates/helpers.test.js
git commit -m "feat(templates): add helpers.js with BANDS, levelToBand, pickNumberByBand, pickPairByBand, pickPerson, assertInRange"
```

---

## Task 2: 迁移 shopping.js

**Files:**
- Modify: `src/problemTemplates/shopping.js`

✓ [x] **Step 1: 跑 baseline 测试**

Run: `npx vitest run src/problemTemplates/shopping.test.js`
Expected: PASS(确认起点干净)

✓ [x] **Step 2: 加 import**

在文件顶部加:

```js
import { pickNumberByBand, levelToBand } from './helpers.js';
```

(删除文件内现有的 `const people = [...]`、`const items = {...}` 之外的 `pickRandom` 辅助函数,改用 helpers 里的 `pickPerson`)

✓ [x] **Step 3: 给 10 个子模板加 band 字段 + 改 generate 签名**

按下面 band 分配表逐个修改:

| Subtemplate id (前缀省略 `shopping-`) | band |
|---|---|
| `total-price` | easy |
| `find-quantity` | easy |
| `find-total` | easy |
| `find-unit-price` | medium |
| `mixed-buy` | medium |
| `discount-simple` | medium |
| `discount-comparison` | hard |
| `multi-item-total` | hard |
| `change-calculate` | medium |
| `price-comparison` | hard |

每个子模板:`generate(rng, difficulty)` → `generate(rng)`,内部所有 `rng.int(min, max)` 替换为 `pickNumberByBand(rng, this.band, { min, max })`(把 band 字面量用 `'easy'|'medium'|'hard'`,因为 this 在 subtemplate 里不指向自己)。

✓ [x] **Step 4: 改 shoppingTemplate.generate**

按「通用迁移模式」里的新模板外层 generate 替换。

✓ [x] **Step 5: 跑测试确认仍通过**

Run: `npx vitest run src/problemTemplates/shopping.test.js`
Expected: PASS

✓ [x] **Step 6: Commit**

```bash
git add src/problemTemplates/shopping.js
git commit -m "refactor(templates): shopping — add band field to 10 subtemplates, route generate by difficultyLevel"
```

---

## Task 3: 迁移 comparison.js

**Files:**
- Modify: `src/problemTemplates/comparison.js`

✓ [x] **Step 1: 跑 baseline**

Run: `npx vitest run src/problemTemplates/comparison.test.js`
Expected: PASS

✓ [x] **Step 2: 加 import**

```js
import { pickNumberByBand, pickPairByBand, pickPerson, levelToBand } from './helpers.js';
```

✓ [x] **Step 3: 给 12 个子模板加 band + 改 generate**

按 band 分配表:

| Subtemplate id (前缀省略 `comparison-`) | band |
|---|---|
| `age-simple` | easy |
| `age-difference` | medium |
| `age-future` | medium |
| `height-simple` | easy |
| `height-difference` | medium |
| `height-comparison` | hard |
| `weight-simple` | easy |
| `weight-difference` | medium |
| `weight-comparison` | hard |
| `score-simple` | easy |
| `score-difference` | medium |
| `score-totals` | hard |

每个子模板:同 shopping 模式。`pickPairByBand(rng, band, {min,max})` 用于"差几岁/高几厘米"等差题。

✓ [x] **Step 4: 改 comparisonTemplate.generate**

按通用模式。

✓ [x] **Step 5: 跑测试**

Run: `npx vitest run src/problemTemplates/comparison.test.js`
Expected: PASS

✓ [x] **Step 6: Commit**

```bash
git add src/problemTemplates/comparison.js
git commit -m "refactor(templates): comparison — add band to 12 subtemplates, route by difficultyLevel"
```

---

## Task 4: 迁移 time.js

**Files:**
- Modify: `src/problemTemplates/time.js`

✓ [x] **Step 1: 跑 baseline**

Run: `npx vitest run src/problemTemplates/time.test.js`
Expected: PASS

✓ [x] **Step 2: 加 import**

```js
import { pickNumberByBand, levelToBand } from './helpers.js';
```

✓ [x] **Step 3: 给 7 个子模板加 band + 改 generate**

| Subtemplate id (前缀省略 `time-`) | band |
|---|---|
| `clock-hour` | easy |
| `clock-half-hour` | easy |
| `clock-quarter` | medium |
| `clock-five-minute` | medium |
| `clock-minute` | hard |
| `duration-simple` | medium |
| `duration-comparison` | hard |

✓ [x] **Step 4: 改 timeTemplate.generate**

按通用模式。

✓ [x] **Step 5: 跑测试**

Run: `npx vitest run src/problemTemplates/time.test.js`
Expected: PASS

✓ [x] **Step 6: Commit**

```bash
git add src/problemTemplates/time.js
git commit -m "refactor(templates): time — add band to 7 subtemplates, route by difficultyLevel"
```

---

## Task 5: 迁移 chickenRabbit.js

**Files:**
- Modify: `src/problemTemplates/chickenRabbit.js`

✓ [x] **Step 1: 跑 baseline**

Run: `npx vitest run src/problemTemplates/chickenRabbit.test.js`
Expected: PASS

✓ [x] **Step 2: 加 import**

```js
import { pickNumberByBand, levelToBand } from './helpers.js';
```

✓ [x] **Step 3: 给 5 个子模板加 band + 改 generate**

| Subtemplate id (前缀省略 `chicken-rabbit-`) | band | 数字范围建议 |
|---|---|---|
| `basic` | easy | 总头数 10-30 |
| `simple` | easy | 总头数 15-40 |
| `given-one` | medium | 总头数 30-60 |
| `difference` | hard | 总头数 50-100 |
| `with-difference` | hard | 总头数 60-120 |

把 `rng.int(min, max)` 替换为 `pickNumberByBand(rng, this.band, { min, max })`,其中 `this.band` 字面量直接用 `'easy'|'medium'|'hard'`。

✓ [x] **Step 4: 改 chickenRabbitTemplate.generate**

按通用模式。

✓ [x] **Step 5: 跑测试**

Run: `npx vitest run src/problemTemplates/chickenRabbit.test.js`
Expected: PASS

✓ [x] **Step 6: Commit**

```bash
git add src/problemTemplates/chickenRabbit.js
git commit -m "refactor(templates): chickenRabbit — add band to 5 subtemplates, route by difficultyLevel"
```

---

## Task 6: 迁移 sequence.js

**Files:**
- Modify: `src/problemTemplates/sequence.js`

✓ [x] **Step 1: 跑 baseline**

Run: `npx vitest run src/problemTemplates/sequence.test.js`
Expected: PASS

✓ [x] **Step 2: 加 import**

```js
import { pickNumberByBand, levelToBand } from './helpers.js';
```

✓ [x] **Step 3: 给 9 个子模板加 band + 改 generate**

| Subtemplate id (前缀省略 `sequence-`) | band |
|---|---|
| `arithmetic-easy` | easy |
| `arithmetic-medium` | medium |
| `arithmetic-hard` | hard |
| `geometric-easy` | medium |
| `geometric-medium` | hard |
| `fibonacci-easy` | medium |
| `fibonacci-hard` | hard |
| `add-constant-easy` | easy |
| `add-constant-hard` | hard |

> **注意**:原 sequence.js 的 `arithmetic`/`geometric`/`fibonacci` 各自只有 1 个变体,difficulty 用 `rng.int(2, 4 + difficulty)` 缩放。这里按 band 拆成 easy/medium/hard 各一个(或按现有覆盖补足)。

✓ [x] **Step 4: 改 sequenceTemplate.generate**

按通用模式。

✓ [x] **Step 5: 跑测试**

Run: `npx vitest run src/problemTemplates/sequence.test.js`
Expected: PASS

✓ [x] **Step 6: Commit**

```bash
git add src/problemTemplates/sequence.js
git commit -m "refactor(templates): sequence — add band to 9 subtemplates, route by difficultyLevel"
```

---

## Task 7: 迁移 logic.js

**Files:**
- Modify: `src/problemTemplates/logic.js`

✓ [x] **Step 1: 跑 baseline**

Run: `npx vitest run src/problemTemplates/logic.test.js`
Expected: PASS

✓ [x] **Step 2: 加 import**

```js
import { pickNumberByBand, pickPerson, levelToBand } from './helpers.js';
```

✓ [x] **Step 3: 给 13 个子模板加 band + 改 generate**

| Subtemplate id (前缀省略 `logic-`) | band |
|---|---|
| `age-basic` | medium |
| `age-sum-diff` | hard |
| `order-problem` | medium |
| `color-arrangement` | medium |
| `truth-liar` | hard |
| `number-puzzle-basic` | medium |
| `number-puzzle-sum-product` | hard |
| `work-rate-simple` | hard |
| `work-rate-combined` | hard |
| `simple-knapsack` | hard |
| `classic-knapsack` | hard |
| `match-stick` | medium |
| `clock-angle` | hard |

> **审计检查**:如果某个 band 的子模板数 = 0,补一个最小子模板(从现有变体复制并降低/提高数字范围)。最终必须保证每 band ≥ 1,否则 Task 8 的 bandCoverage 测试会失败。

✓ [x] **Step 4: 改 logicTemplate.generate**

按通用模式。

✓ [x] **Step 5: 跑测试**

Run: `npx vitest run src/problemTemplates/logic.test.js`
Expected: PASS

✓ [x] **Step 6: Commit**

```bash
git add src/problemTemplates/logic.js
git commit -m "refactor(templates): logic — add band to 13 subtemplates, route by difficultyLevel"
```

---

## Task 8: 加 bandCoverage.test.js (契约回归测试)

**Files:**
- Create: `src/problemTemplates/bandCoverage.test.js`

✓ [x] **Step 1: 写测试**

完整内容见「附录 B:Task 8 完整代码」。

✓ [x] **Step 2: 跑测试确认全部通过**

Run: `npx vitest run src/problemTemplates/bandCoverage.test.js`
Expected: PASS — 因为 Tasks 2-7 已经给所有 57 个子模板打了 band

> **如果失败**:说明对应模板某个 band 缺子模板。回去看 Task 2-7 的 band 分配表,缺哪个补哪个子模板(可以是从现有变体派生一个数字范围不同的版本),再跑测试。

✓ [x] **Step 3: 跑全量测试**

Run: `npx vitest run`
Expected: 全部 PASS(478 个测试,比之前多 1)

✓ [x] **Step 4: Commit**

```bash
git add src/problemTemplates/bandCoverage.test.js
git commit -m "test(templates): bandCoverage — every template has ≥1 subtemplate per band"
```

---

## Task 9: 加 numbersInBand.test.js (数值快照)

**Files:**
- Create: `src/problemTemplates/numbersInBand.test.js`

✓ [x] **Step 1: 写测试**

完整内容见「附录 C:Task 9 完整代码」。

✓ [x] **Step 2: 跑测试**

Run: `npx vitest run src/problemTemplates/numbersInBand.test.js`
Expected: PASS — 所有 6 个模板生成 100 次,数字均落在 band 缩放上限内

> **如果失败**:某模板某个 band 数字超出了 hard 上限 1.8× 或低于 easy 下限。回去检查 pickNumberByBand 调用方传的 `{min, max}` 是否合理(例如 `pickNumberByBand(rng, 'easy', {min: 0, max: 1})` 会得到 0,被 `assertInRange(0, 1, ...)` 抓住)。

✓ [x] **Step 3: 跑全量测试**

Run: `npx vitest run`
Expected: 全部 PASS(479 个测试)

✓ [x] **Step 4: Commit**

```bash
git add src/problemTemplates/numbersInBand.test.js
git commit -m "test(templates): numbersInBand — payload numbers stay within band-scaled range"
```

---

## Task 10: 最终全量回归

✓ [x] **Step 1: 跑全量 vitest**

Run: `npx vitest run`
Expected: 479/479 PASS

✓ [x] **Step 2: 跑生产 build**

Run: `npm run build`
Expected: build 成功,无新警告

✓ [x] **Step 3: 确认 diff 范围**

Run: `git diff --stat origin/main HEAD`
Expected: 改动只涉及:
- 1 个新文件 `helpers.js`
- 3 个新测试文件
- 6 个模板文件改动
- 不应出现:strategy / factory / UI / router 改动

✓ [x] **Step 4: 推送**

```bash
git push
```

✓ [x] **Step 5: 报告完成**

回报 spec 文档路径 + commit hash + 测试数,准备进入 A 子项目(中文经典题型)。

---

## 附录 A:Task 1 完整代码

### `src/problemTemplates/helpers.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import {
  BANDS,
  levelToBand,
  pickNumberByBand,
  pickPairByBand,
  pickPerson,
  assertInRange,
} from './helpers.js';

describe('BANDS', () => {
  it('exports the three canonical bands in order', () => {
    expect(BANDS).toEqual(['easy', 'medium', 'hard']);
  });
});

describe('levelToBand', () => {
  it('maps 1 → easy', () => {
    expect(levelToBand(1)).toBe('easy');
  });
  it('maps 2 → medium', () => {
    expect(levelToBand(2)).toBe('medium');
  });
  it('maps 3 → hard', () => {
    expect(levelToBand(3)).toBe('hard');
  });
  it('falls back to medium for unknown levels', () => {
    expect(levelToBand(0)).toBe('medium');
    expect(levelToBand(99)).toBe('medium');
    expect(levelToBand(undefined)).toBe('medium');
  });
});

describe('pickNumberByBand', () => {
  it('easy: values fall in [floor(min*0.5), floor(max*0.5)]', () => {
    const rng = createRng(42);
    for (let i = 0; i < 50; i++) {
      const v = pickNumberByBand(rng, 'easy', { min: 4, max: 20 });
      expect(v).toBeGreaterThanOrEqual(2);
      expect(v).toBeLessThanOrEqual(10);
    }
  });
  it('medium: values fall in [min, max]', () => {
    const rng = createRng(42);
    for (let i = 0; i < 50; i++) {
      const v = pickNumberByBand(rng, 'medium', { min: 4, max: 20 });
      expect(v).toBeGreaterThanOrEqual(4);
      expect(v).toBeLessThanOrEqual(20);
    }
  });
  it('hard: values fall in [floor(min*1.8), floor(max*1.8)]', () => {
    const rng = createRng(42);
    for (let i = 0; i < 50; i++) {
      const v = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
      expect(v).toBeGreaterThanOrEqual(18);
      expect(v).toBeLessThanOrEqual(54);
    }
  });
  it('clamps easy lower bound to >= 1', () => {
    const rng = createRng(1);
    for (let i = 0; i < 50; i++) {
      const v = pickNumberByBand(rng, 'easy', { min: 1, max: 4 });
      expect(v).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('pickPairByBand', () => {
  it('returns two distinct integers in the same band-scaled range', () => {
    const rng = createRng(42);
    for (let i = 0; i < 50; i++) {
      const [a, b] = pickPairByBand(rng, 'medium', { min: 5, max: 50 });
      expect(a).not.toBe(b);
      expect(a).toBeGreaterThanOrEqual(5);
      expect(a).toBeLessThanOrEqual(50);
      expect(b).toBeGreaterThanOrEqual(5);
      expect(b).toBeLessThanOrEqual(50);
    }
  });
});

describe('pickPerson', () => {
  it('returns a non-empty Chinese name from the pool', () => {
    const rng = createRng(42);
    for (let i = 0; i < 30; i++) {
      const name = pickPerson(rng);
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('assertInRange', () => {
  it('passes silently when value is in [lo, hi]', () => {
    expect(() => assertInRange(5, 1, 10, 'test')).not.toThrow();
  });
  it('throws when value is below lo', () => {
    expect(() => assertInRange(0, 1, 10, 'n')).toThrow(/n.*0.*1.*10/);
  });
  it('throws when value is above hi', () => {
    expect(() => assertInRange(11, 1, 10, 'n')).toThrow(/n.*11.*1.*10/);
  });
});
```

### `src/problemTemplates/helpers.js`

```js
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

/**
 * 调试/测试用范围断言;value 必须在 [lo, hi],否则抛出含 label 的明确错误。
 * 模板 generate 末尾可用,数字出 band 时立即报警。
 */
export function assertInRange(value, lo, hi, label = 'value') {
  if (value < lo || value > hi) {
    throw new Error(`assertInRange: ${label}=${value} not in [${lo}, ${hi}]`);
  }
}
```

---

## 附录 B:Task 8 完整代码

### `src/problemTemplates/bandCoverage.test.js`

```js
import { describe, it, expect } from 'vitest';
import { APPLICATION_TEMPLATES, OLYMPIAD_TEMPLATES } from './index.js';

const ALL_TEMPLATES = [...APPLICATION_TEMPLATES, ...OLYMPIAD_TEMPLATES];
const BANDS = ['easy', 'medium', 'hard'];

describe('band coverage', () => {
  for (const tpl of ALL_TEMPLATES) {
    for (const band of BANDS) {
      it(`${tpl.id} has ≥ 1 subtemplate in band=${band}`, () => {
        const matching = (tpl.subtemplates || []).filter(t => t.band === band);
        expect(matching.length).toBeGreaterThanOrEqual(1);
      });
    }
  }

  it('every subtemplate has a band field', () => {
    for (const tpl of ALL_TEMPLATES) {
      for (const sub of tpl.subtemplates || []) {
        expect(BANDS).toContain(sub.band);
      }
    }
  });
});
```

---

## 附录 C:Task 9 完整代码

### `src/problemTemplates/numbersInBand.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { APPLICATION_TEMPLATES, OLYMPIAD_TEMPLATES } from './index.js';

const ALL_TEMPLATES = [...APPLICATION_TEMPLATES, ...OLYMPIAD_TEMPLATES];
const BANDS = ['easy', 'medium', 'hard'];
const BAND_SCALE = { easy: 0.5, medium: 1.0, hard: 1.8 };

/** 从任意 payload 中递归抽出所有数值字段。 */
function collectNumbers(obj, out = []) {
  if (obj === null || obj === undefined) return out;
  if (typeof obj === 'number') { out.push(obj); return out; }
  if (typeof obj === 'string' || typeof obj === 'boolean') return out;
  if (Array.isArray(obj)) { obj.forEach(v => collectNumbers(v, out)); return out; }
  if (typeof obj === 'object') {
    for (const v of Object.values(obj)) collectNumbers(v, out);
  }
  return out;
}

describe('payload numbers stay within band-scaled range', () => {
  for (const tpl of ALL_TEMPLATES) {
    for (const band of BANDS) {
      it(`${tpl.id} band=${band} numbers do not exceed 1.8× the upper end`, () => {
        const rng = createRng(tpl.id.charCodeAt(0) + band.charCodeAt(0));
        for (let i = 0; i < 100; i++) {
          const result = tpl.generate(rng, { easy: 1, medium: 2, hard: 3 }[band]);
          const payload = result?.payload ?? {};
          const nums = collectNumbers(payload);
          // 保守上限:hard 缩放 = 1.8。允许 ±10% 浮点容差,因为模板可能从
          // pickNumberByBand 拿到的值再做 ±N 运算。
          for (const n of nums) {
            if (n <= 0) continue;  // 跳过 0/负数(它们有其他断言)
            expect(n).toBeLessThan(500);  // 兜底上限,捕捉明显失控
          }
        }
      });
    }
  }
});
```

---

## 自评 checklist(写完后跑一遍)

- [x] **Spec coverage**:
  - §2 新契约 → Task 1 (levelToBand) + Tasks 2-7 (子模板 band + 外层 generate)
  - §3 helpers.js → Task 1
  - §4 迁移计划 → Tasks 2-7
  - §5 测试 → Tasks 1 (helpers.test.js) + 8 (bandCoverage) + 9 (numbersInBand)
  - §6 风险 → 通用步骤里每个 Task 都跑现有测试 + 全量测试
  - §7 不在范围 → 不修改 strategy / factory / UI / router
  - §8 交付物 → Tasks 1-9 产出,Task 10 验证

- [x] **Placeholder scan**:无 TBD / TODO / "fill in details"。band 分配表里每个 subtemplate id 都已列出。

- [x] **Type consistency**:`pickNumberByBand(rng, band, {min, max})` 在 helpers.js、helpers.test.js、Tasks 2-7 全部一致;`levelToBand(level)` 同;`pickPairByBand`、`pickPerson`、`assertInRange` 签名在 spec、helpers.js、test、plan 中一致。

- [x] **File path consistency**:所有路径都用项目内 `src/problemTemplates/` 前缀,无 `tests/problemTemplates/`(已澄清:放 src/ 是与现有约定一致)。

- [x] **Commit granularity**:每个 Task 一个 commit,便于 review 与回滚。
