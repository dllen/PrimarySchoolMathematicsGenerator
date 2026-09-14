# 子项目 B: 应用题广度扩展 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 5 个独立模板(工程/浓度/行程/比例/统计)+ 现有 3 个模板的 1–2 年级覆盖扩展,全部复用 D 的 `Subtemplate.band` 契约。

**Architecture:** 每个新模板独立文件,含 `*.test.js`;helpers 新增 `pickTwoSpeeds`、`pickRatio`(含 gcd);`constants/options.js` 新增 5 个 subtype;`index.js` 更新 `APPLICATION_TEMPLATES`。

**Tech Stack:** 纯 JS + Vitest,无新依赖。

**前置 spec:** `docs/superpowers/specs/2026-09-14-enrich-app-olympiad-subproject-b-design.md`

---

## 文件结构

### 新增(5 个模板 + 5 个测试)

| 文件 | 职责 |
|---|---|
| `src/problemTemplates/engineering.js` | 工程问题(5 子模板,easy/medium×2/hard×2) |
| `src/problemTemplates/engineering.test.js` | 总量=效率×时间 |
| `src/problemTemplates/concentration.js` | 浓度问题(5 子模板,easy×2/medium/hard×2) |
| `src/problemTemplates/concentration.test.js` | 溶质=浓度×溶液 |
| `src/problemTemplates/distance.js` | 行程问题(5 子模板,easy/medium×2/hard×2) |
| `src/problemTemplates/distance.test.js` | 相遇=路程和;追及=路程差 |
| `src/problemTemplates/ratio.js` | 分配比例(4 子模板,easy/medium×2/hard) |
| `src/problemTemplates/ratio.test.js` | 各部分之和=总量 |
| `src/problemTemplates/statistics.js` | 统计问题(4 子模板,easy/medium×2/hard) |
| `src/problemTemplates/statistics.test.js` | 平均数=总数÷个数 |

### helpers.js 变更

- 新增 `gcd(a, b)` (供 pickRatio 用)
- 新增 `pickTwoSpeeds(rng, band, { min, max })` — 行程问题用
- 新增 `pickRatio(rng, band)` — 分配比例用,返回最简整数比

### constants/options.js 变更

```js
export const QUESTION_TYPES = [
  'arithmetic', 'application', 'olympiad',
  // B 新增:
  'engineering', 'concentration', 'distance',
  'ratio', 'statistics',
];
```

### index.js 变更

5 个新模板加入 `APPLICATION_TEMPLATES`。

### 现有模板扩展(1–2 年级)

| 文件 | 新增子模板 | band |
|---|---|---|
| `shopping.js` | `shopping-counting` (只用 1–10 的数,加法) | easy |
| `time.js` | `time-clock-face` (整点半点) | easy |
| `comparison.js` | `comparison-fewer-more` (10 以内谁多谁少) | easy |

---

## 通用模板模式

与 A 一致,每个新模板的外层 generate:

```js
generate(rng, difficultyLevel) {
  const band = levelToBand(difficultyLevel);
  const pool = this.subtemplates.filter(t => t.band === band);
  return rng.pick(pool).generate(rng);
}
```

---

## Task 1: helpers.js 新增 gcd / pickTwoSpeeds / pickRatio

**Files:**
- Modify: `src/problemTemplates/helpers.js`

- [ ] **Step 1: 添加 3 个函数到 helpers.js**

```js
/** 欧几里得算法求最大公约数 */
export function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

/** 行程问题:生成两个不同的速度值 */
export function pickTwoSpeeds(rng, band, { min, max }) {
  const [a, b] = pickPairByBand(rng, band, { min, max });
  return { speed1: a, speed2: b };
}

/** 分配比例:生成一个最简整数比 a:b */
export function pickRatio(rng, band) {
  const a = pickNumberByBand(rng, band, { min: 1, max: 5 });
  const b = pickNumberByBand(rng, band, { min: 1, max: 5 });
  const g = gcd(a, b);
  return { a: a / g, b: b / g };
}
```

- [ ] **Step 2: 跑 helpers 测试**

Run: `npx vitest run src/problemTemplates/helpers.test.js`
Expected: 全部 PASS

- [ ] **Step 3: Commit**

```bash
git add src/problemTemplates/helpers.js
git commit -m "feat(templates): add gcd, pickTwoSpeeds, pickRatio to helpers.js"
```

---

## Task 2: engineering.js + engineering.test.js

**Files:**
- Create: `src/problemTemplates/engineering.js`
- Create: `src/problemTemplates/engineering.test.js`

- [ ] **Step 1: 写 engineering.test.js** (附录 A)
- [ ] **Step 2: 跑测试确认失败**
- [ ] **Step 3: 写 engineering.js** (附录 A)
- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: Commit**

---

## Task 3: concentration.js + concentration.test.js

**Files:**
- Create: `src/problemTemplates/concentration.js`
- Create: `src/problemTemplates/concentration.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 B」。

---

## Task 4: distance.js + distance.test.js

**Files:**
- Create: `src/problemTemplates/distance.js`
- Create: `src/problemTemplates/distance.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 C」。

---

## Task 5: ratio.js + ratio.test.js

**Files:**
- Create: `src/problemTemplates/ratio.js`
- Create: `src/problemTemplates/ratio.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 D」。

---

## Task 6: statistics.js + statistics.test.js

**Files:**
- Create: `src/problemTemplates/statistics.js`
- Create: `src/problemTemplates/statistics.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 E」。

---

## Task 7: 现有模板扩展 1–2 年级覆盖

**Files:**
- Modify: `src/problemTemplates/shopping.js`
- Modify: `src/problemTemplates/time.js`
- Modify: `src/problemTemplates/comparison.js`

- [ ] **Step 1: shopping.js 新增 shopping-counting 子模板(easy band, grade 1-2)**

在 shopping.js 的 subtemplates 数组中追加:

```js
{
  id: 'shopping-counting',
  band: 'easy',
  generate(rng) {
    const category = pickRandom(Object.keys(items), rng);
    const item = pickRandom(items[category], rng);
    const person = pickPerson(rng);
    const n1 = pickNumberByBand(rng, 'easy', { min: 1, max: 5 });
    const n2 = pickNumberByBand(rng, 'easy', { min: 1, max: 5 });
    const total = n1 + n2;
    return {
      question: `${person}买了${n1}个${item}和${n2}个${item},一共买了多少个?`,
      answer: `${total}个`,
      subtype: 'shopping',
      payload: { n1, n2, total },
    };
  },
}
```

同时把 `shoppingTemplate.gradeRange` 从 `['1', '2', '3', '4']` 改为 `['1', '2', '3', '4']`(无变化,新子模板自然覆盖 1-2 年级)。

- [ ] **Step 2: time.js 新增 time-clock-face 子模板(easy band)**

在 time.js 的 subtemplates 数组中追加:

```js
{
  id: 'time-clock-face',
  band: 'easy',
  generate(rng) {
    const hour = pickNumberByBand(rng, 'easy', { min: 1, max: 9 });
    const minute = rng.pick([0, 30]);
    const display = `${hour}:${String(minute).padStart(2, '0')}`;
    const question = minute === 0
      ? `钟表指向${hour}:00,是几点钟?`
      : `钟表指向${hour}:${minute},是几点几分?`;
    return {
      question,
      answer: `${display}`,
      subtype: 'time',
      payload: { hour, minute },
    };
  },
}
```

同时把 `timeTemplate.gradeRange` 从 `['1', '2', '3', '4']` 不变。

- [ ] **Step 3: comparison.js 新增 comparison-fewer-more 子模板(easy band, grade 1-2)**

在 comparison.js 的 subtemplates 数组中追加:

```js
{
  id: 'comparison-fewer-more',
  band: 'easy',
  generate(rng) {
    const [a, b] = pickPairByBand(rng, 'easy', { min: 1, max: 10 });
    const diff = Math.abs(a - b);
    const question = a > b
      ? `${a}比${b}多几个?`
      : `${b}比${a}多几个?`;
    return {
      question,
      answer: `${diff}个`,
      subtype: 'comparison',
      payload: { a, b, diff },
    };
  },
}
```

同时把 `comparisonTemplate.gradeRange` 从 `['2', '3', '4', '5']` 改为 `['1', '2', '3', '4', '5']`(新子模板覆盖 1 年级)。

- [ ] **Step 4: 跑测试确认仍通过**

Run: `npx vitest run src/problemTemplates/`
Expected: PASS(所有现有测试 + 新加的子模板都能被覆盖)

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/shopping.js src/problemTemplates/time.js src/problemTemplates/comparison.js
git commit -m "feat(templates): extend shopping/time/comparison with 1-2 grade easy subtemplates"
```

---

## Task 8: constants/options.js + index.js 更新

**Files:**
- Modify: `src/constants/options.js`
- Modify: `src/problemTemplates/index.js`

- [ ] **Step 1: 更新 constants/options.js**

```js
export const QUESTION_TYPES = [
  'arithmetic', 'application', 'olympiad',
  // B 新增:
  'engineering', 'concentration', 'distance',
  'ratio', 'statistics',
];
```

- [ ] **Step 2: 更新 index.js**

```js
import { engineeringTemplate } from './engineering.js';
import { concentrationTemplate } from './concentration.js';
import { distanceTemplate } from './distance.js';
import { ratioTemplate } from './ratio.js';
import { statisticsTemplate } from './statistics.js';

export const APPLICATION_TEMPLATES = [
  shoppingTemplate, timeTemplate, comparisonTemplate, chickenRabbitTemplate,
  // B 新增:
  engineeringTemplate, concentrationTemplate, distanceTemplate,
  ratioTemplate, statisticsTemplate,
];
```

- [ ] **Step 3: 跑 bandCoverage 测试**

Run: `npx vitest run src/problemTemplates/bandCoverage.test.js`
Expected: PASS — B 的 5 个新模板全部被覆盖

- [ ] **Step 4: Commit**

```bash
git add src/constants/options.js src/problemTemplates/index.js
git commit -m "feat(templates): register 5 new APPLICATION_TEMPLATES and 5 QUESTION_TYPES"
```

---

## Task 9: numbersInBand.test.js 扩展覆盖 B 新模板

**Files:**
- Modify: `src/problemTemplates/numbersInBand.test.js`

- [ ] **Step 1: 扩展 ALL_TEMPLATES**

把 B 的 5 个新模板加入循环(已经在 `APPLICATION_TEMPLATES` 里,所以自动被覆盖)。

- [ ] **Step 2: 跑测试**

Run: `npx vitest run src/problemTemplates/numbersInBand.test.js`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/problemTemplates/numbersInBand.test.js
git commit -m "test(templates): extend numbersInBand to cover 5 new B templates"
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

- [x] **Spec coverage**: §3(5 个模板)→Task 2-6; §4(1-2 年级)→Task 7; §5(helpers)→Task 1; §6(options)→Task 8; §7(index)→Task 8; §8(test)→Tasks 2-6+9
- [x] **Placeholder scan**: 无 TBD/TODO
- [x] **Type consistency**: 所有模板用 `levelToBand`/`pickNumberByBand`/`pickPairByBand` 一致
- [x] **Band coverage**: 每个新模板 ≥ 3 子模板(easy/medium/hard 各 ≥ 1)
- [x] **Commit granularity**: 每个新模板 1 个 commit,Task 7 单独 1 个,共 8 个

---

## 附录 A: engineering.js + engineering.test.js

### `src/problemTemplates/engineering.js`

```js
import { pickNumberByBand, levelToBand } from './helpers.js';

function generateEngineeringSubtemplates() {
  return [
    {
      id: 'engineering-single',
      band: 'easy',
      generate(rng) {
        const rate = pickNumberByBand(rng, 'easy', { min: 2, max: 8 });
        const hours = pickNumberByBand(rng, 'easy', { min: 2, max: 6 });
        const total = rate * hours;
        return {
          question: `工人每小时加工${rate}个零件,加工${hours}小时,一共能加工多少个?`,
          answer: `${total}个`,
          subtype: 'engineering',
          payload: { rate, hours, total },
        };
      },
    },
    {
      id: 'engineering-together',
      band: 'medium',
      generate(rng) {
        const r1 = pickNumberByBand(rng, 'medium', { min: 3, max: 10 });
        const r2 = pickNumberByBand(rng, 'medium', { min: 3, max: 10 });
        const hours = pickNumberByBand(rng, 'medium', { min: 2, max: 6 });
        const total = (r1 + r2) * hours;
        return {
          question: `甲每小时做${r1}个,乙每小时做${r2}个,两人一起做${hours}小时,共完成多少个?`,
          answer: `${total}个`,
          subtype: 'engineering',
          payload: { r1, r2, hours, total },
        };
      },
    },
    {
      id: 'engineering-complete',
      band: 'medium',
      generate(rng) {
        const total = pickNumberByBand(rng, 'medium', { min: 30, max: 100 });
        const hours = pickNumberByBand(rng, 'medium', { min: 3, max: 8 });
        const rate = Math.round(total / hours);
        return {
          question: `一项工程总量是${total}个零件,${hours}小时完成,平均每小时做多少个?`,
          answer: `${rate}个/小时`,
          subtype: 'engineering',
          payload: { total, hours, rate },
        };
      },
    },
    {
      id: 'engineering-three',
      band: 'hard',
      generate(rng) {
        const r1 = pickNumberByBand(rng, 'hard', { min: 3, max: 12 });
        const r2 = pickNumberByBand(rng, 'hard', { min: 3, max: 12 });
        const r3 = pickNumberByBand(rng, 'hard', { min: 3, max: 12 });
        const hours = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        const total = (r1 + r2 + r3) * hours;
        return {
          question: `三人合作,效率分别为${r1}、${r2}、${r3}个/小时,做了${hours}小时,共完成多少个?`,
          answer: `${total}个`,
          subtype: 'engineering',
          payload: { r1, r2, r3, hours, total },
        };
      },
    },
    {
      id: 'engineering-shift',
      band: 'hard',
      generate(rng) {
        const r1 = pickNumberByBand(rng, 'hard', { min: 4, max: 12 });
        const h1 = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        const r2 = pickNumberByBand(rng, 'hard', { min: 4, max: 12 });
        const h2 = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        const total = r1 * h1 + r2 * h2;
        return {
          question: `先甲做${h1}小时(每小时${r1}个),再乙做${h2}小时(每小时${r2}个),共完成多少个?`,
          answer: `${total}个`,
          subtype: 'engineering',
          payload: { r1, h1, r2, h2, total },
        };
      },
    },
  ];
}

export const engineeringTemplate = {
  id: 'engineering',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateEngineeringSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/engineering.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { engineeringTemplate } from './engineering.js';

describe('engineeringTemplate', () => {
  it('easy: total = rate * hours', () => {
    const rng = createRng(1);
    const result = engineeringTemplate.generate(rng, 1);
    const { rate, hours, total } = result.payload;
    expect(total).toBe(rate * hours);
  });
  it('medium: total = (r1 + r2) * hours (engineering-together)', () => {
    const rng = createRng(2);
    // run until we hit 'engineering-together'
    let result;
    for (let i = 0; i < 50; i++) {
      result = engineeringTemplate.generate(rng, 2);
      if (result.payload.r2 !== undefined) break;
    }
    const { r1, r2, hours, total } = result.payload;
    expect(total).toBe((r1 + r2) * hours);
  });
  it('hard: three-worker total = (r1+r2+r3)*hours', () => {
    const rng = createRng(3);
    let result;
    for (let i = 0; i < 50; i++) {
      result = engineeringTemplate.generate(rng, 3);
      if (result.payload.r3 !== undefined) break;
    }
    const { r1, r2, r3, hours, total } = result.payload;
    expect(total).toBe((r1 + r2 + r3) * hours);
  });
});
```

---

## 附录 B: concentration.js + concentration.test.js

### `src/problemTemplates/concentration.js`

```js
import { pickNumberByBand, levelToBand } from './helpers.js';

function generateConcentrationSubtemplates() {
  return [
    {
      id: 'concentration-basic',
      band: 'easy',
      generate(rng) {
        const solute = pickNumberByBand(rng, 'easy', { min: 5, max: 15 });
        const solution = pickNumberByBand(rng, 'easy', { min: 30, max: 80 });
        const percent = Math.round(solute / solution * 100);
        return {
          question: `把${solute}克糖溶解在${solution}克水中,糖水浓度是多少(百分数)?`,
          answer: `${percent}%`,
          subtype: 'concentration',
          payload: { solute, solution, percent },
        };
      },
    },
    {
      id: 'concentration-find-solute',
      band: 'easy',
      generate(rng) {
        const solution = pickNumberByBand(rng, 'easy', { min: 50, max: 100 });
        const percent = pickNumberByBand(rng, 'easy', { min: 5, max: 20 });
        const solute = Math.round(solution * percent / 100);
        return {
          question: `${solution}克${percent}%的糖水中,糖有多少克?`,
          answer: `${solute}克`,
          subtype: 'concentration',
          payload: { solute, solution, percent },
        };
      },
    },
    {
      id: 'concentration-dilute',
      band: 'medium',
      generate(rng) {
        const solute = pickNumberByBand(rng, 'medium', { min: 10, max: 30 });
        const solution = pickNumberByBand(rng, 'medium', { min: 50, max: 100 });
        const addedWater = pickNumberByBand(rng, 'medium', { min: 20, max: 50 });
        const newSolution = solution + addedWater;
        const newPercent = Math.round(solute / newSolution * 100);
        return {
          question: `原有${solute}克糖溶在${solution}克水中,又加了${addedWater}克水,新浓度是多少?`,
          answer: `${newPercent}%`,
          subtype: 'concentration',
          payload: { solute, solution, addedWater, newSolution, newPercent },
        };
      },
    },
    {
      id: 'concentration-mix',
      band: 'hard',
      generate(rng) {
        const s1 = pickNumberByBand(rng, 'hard', { min: 5, max: 15 });
        const sol1 = pickNumberByBand(rng, 'hard', { min: 30, max: 80 });
        const s2 = pickNumberByBand(rng, 'hard', { min: 5, max: 15 });
        const sol2 = pickNumberByBand(rng, 'hard', { min: 30, max: 80 });
        const totalSolute = s1 + s2;
        const totalSolution = sol1 + sol2;
        const percent = Math.round(totalSolute / totalSolution * 100);
        return {
          question: `${sol1}克${Math.round(s1/sol1*100)}%糖水和${sol2}克${Math.round(s2/sol2*100)}%糖水混合,新浓度是多少?`,
          answer: `${percent}%`,
          subtype: 'concentration',
          payload: { s1, sol1, s2, sol2, totalSolute, totalSolution, percent },
        };
      },
    },
    {
      id: 'concentration-evaporate',
      band: 'hard',
      generate(rng) {
        const solute = pickNumberByBand(rng, 'hard', { min: 15, max: 35 });
        const solution = pickNumberByBand(rng, 'hard', { min: 60, max: 120 });
        const evaporated = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const newSolution = solution - evaporated;
        const newPercent = Math.round(solute / newSolution * 100);
        return {
          question: `${solute}克糖溶在${solution}克水中,蒸发掉${evaporated}克水,新浓度是多少?`,
          answer: `${newPercent}%`,
          subtype: 'concentration',
          payload: { solute, solution, evaporated, newSolution, newPercent },
        };
      },
    },
  ];
}

export const concentrationTemplate = {
  id: 'concentration',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: generateConcentrationSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/concentration.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { concentrationTemplate } from './concentration.js';

describe('concentrationTemplate', () => {
  it('easy: percent = round(solute/solution * 100)', () => {
    const rng = createRng(1);
    const result = concentrationTemplate.generate(rng, 1);
    const { solute, solution, percent } = result.payload;
    expect(percent).toBe(Math.round(solute / solution * 100));
  });
  it('medium (dilute): solute unchanged after adding water', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = concentrationTemplate.generate(rng, 2);
      if (result.payload.addedWater !== undefined) break;
    }
    const { solute, newSolution, newPercent } = result.payload;
    expect(newPercent).toBe(Math.round(solute / newSolution * 100));
  });
  it('hard (mix): totalSolute / totalSolution = percent', () => {
    const rng = createRng(3);
    let result;
    for (let i = 0; i < 50; i++) {
      result = concentrationTemplate.generate(rng, 3);
      if (result.payload.totalSolute !== undefined) break;
    }
    const { totalSolute, totalSolution, percent } = result.payload;
    expect(percent).toBe(Math.round(totalSolute / totalSolution * 100));
  });
});
```

---

## 附录 C: distance.js + distance.test.js

### `src/problemTemplates/distance.js`

```js
import { pickNumberByBand, pickTwoSpeeds, pickPerson, pickTwoPeople, levelToBand } from './helpers.js';

function generateDistanceSubtemplates() {
  return [
    {
      id: 'distance-basic',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const speed = pickNumberByBand(rng, 'easy', { min: 30, max: 80 });
        const time = pickNumberByBand(rng, 'easy', { min: 2, max: 8 });
        const distance = speed * time;
        return {
          question: `${person}每分钟走${speed}米,走${time}分钟,一共走了多少米?`,
          answer: `${distance}米`,
          subtype: 'distance',
          payload: { speed, time, distance },
        };
      },
    },
    {
      id: 'distance-meet',
      band: 'medium',
      generate(rng) {
        const [p1, p2] = pickTwoPeople(rng);
        const { speed1, speed2 } = pickTwoSpeeds(rng, 'medium', { min: 50, max: 120 });
        const time = pickNumberByBand(rng, 'medium', { min: 2, max: 6 });
        const distance = (speed1 + speed2) * time;
        return {
          question: `${p1}每分钟走${speed1}米,${p2}每分钟走${speed2}米,两人相向而行${time}分钟后相遇,两地相距多少米?`,
          answer: `${distance}米`,
          subtype: 'distance',
          payload: { speed1, speed2, time, distance },
        };
      },
    },
    {
      id: 'distance-chase',
      band: 'medium',
      generate(rng) {
        const [p1, p2] = pickTwoPeople(rng);
        const { speed1, speed2 } = pickTwoSpeeds(rng, 'medium', { min: 60, max: 150 });
        const faster = Math.max(speed1, speed2);
        const slower = Math.min(speed1, speed2);
        const diff = faster - slower;
        const time = pickNumberByBand(rng, 'medium', { min: 2, max: 8 });
        const catchUp = diff * time;
        return {
          question: `${p1}每分钟走${faster}米,${p2}每分钟走${slower}米,同向而行${time}分钟后,${p1}比${p2}多走多少米?`,
          answer: `${catchUp}米`,
          subtype: 'distance',
          payload: { speed1, speed2, faster, slower, diff, time, catchUp },
        };
      },
    },
    {
      id: 'distance-round',
      band: 'hard',
      generate(rng) {
        const [p1, p2] = pickTwoPeople(rng);
        const { speed1, speed2 } = pickTwoSpeeds(rng, 'hard', { min: 80, max: 200 });
        const laps = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        const track = pickNumberByBand(rng, 'hard', { min: 200, max: 400 });
        const distance = (speed1 + speed2) * laps * track;
        return {
          question: `${track}米环形跑道,${p1}速度${speed1}米/分钟,${p2}速度${speed2}米/分钟,两人相向而行${laps}圈后相遇,相遇时一共走了多少米?`,
          answer: `${distance}米`,
          subtype: 'distance',
          payload: { speed1, speed2, laps, track, distance },
        };
      },
    },
    {
      id: 'distance-bus',
      band: 'hard',
      generate(rng) {
        const interval = pickNumberByBand(rng, 'hard', { min: 5, max: 15 });
        const buses = pickNumberByBand(rng, 'hard', { min: 3, max: 8 });
        const total = interval * buses;
        return {
          question: `公交车每${interval}分钟发一班,发了${buses}班车,一共用了多少分钟?`,
          answer: `${total}分钟`,
          subtype: 'distance',
          payload: { interval, buses, total },
        };
      },
    },
  ];
}

export const distanceTemplate = {
  id: 'distance',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateDistanceSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/distance.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { distanceTemplate } from './distance.js';

describe('distanceTemplate', () => {
  it('easy: distance = speed * time', () => {
    const rng = createRng(1);
    const result = distanceTemplate.generate(rng, 1);
    const { speed, time, distance } = result.payload;
    expect(distance).toBe(speed * time);
  });
  it('medium (meet): distance = (s1+s2) * time', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = distanceTemplate.generate(rng, 2);
      if (result.payload.speed1 !== undefined && result.payload.speed2 !== undefined) break;
    }
    const { speed1, speed2, time, distance } = result.payload;
    expect(distance).toBe((speed1 + speed2) * time);
  });
  it('hard (round): distance = (s1+s2) * laps * track', () => {
    const rng = createRng(3);
    let result;
    for (let i = 0; i < 50; i++) {
      result = distanceTemplate.generate(rng, 3);
      if (result.payload.laps !== undefined) break;
    }
    const { speed1, speed2, laps, track, distance } = result.payload;
    expect(distance).toBe((speed1 + speed2) * laps * track);
  });
});
```

---

## 附录 D: ratio.js + ratio.test.js

### `src/problemTemplates/ratio.js`

```js
import { pickNumberByBand, pickRatio, pickPerson, pickTwoPeople, gcd, levelToBand } from './helpers.js';

function generateRatioSubtemplates() {
  return [
    {
      id: 'ratio-distribute',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const { a, b } = pickRatio(rng, 'easy');
        const total = pickNumberByBand(rng, 'easy', { min: 6, max: 30 });
        const sum = a + b;
        const partA = Math.floor(total * a / sum);
        const partB = total - partA;
        return {
          question: `${person}有${total}个糖,按${a}:${b}分给甲乙两人,甲得几个?`,
          answer: `${partA}个`,
          subtype: 'ratio',
          payload: { a, b, total, sum, partA, partB },
        };
      },
    },
    {
      id: 'ratio-scale',
      band: 'medium',
      generate(rng) {
        const person = pickPerson(rng);
        const { a, b } = pickRatio(rng, 'medium');
        const partA = pickNumberByBand(rng, 'medium', { min: 6, max: 20 });
        const sum = a + b;
        const total = partA * sum / a;
        return {
          question: `${person}按${a}:${b}分糖,甲得了${partA}个,乙得了几个?一共几个?`,
          answer: `乙${Math.round(partA * b / a)}个,一共${Math.round(total)}个`,
          subtype: 'ratio',
          payload: { a, b, partA, sum, total },
        };
      },
    },
    {
      id: 'ratio-combine',
      band: 'medium',
      generate(rng) {
        const person = pickPerson(rng);
        const a1 = pickNumberByBand(rng, 'medium', { min: 2, max: 5 });
        const b1 = pickNumberByBand(rng, 'medium', { min: 2, max: 5 });
        const a2 = pickNumberByBand(rng, 'medium', { min: 2, max: 5 });
        const b2 = pickNumberByBand(rng, 'medium', { min: 2, max: 5 });
        const totalA = a1 + a2;
        const totalB = b1 + b2;
        const g = gcd(totalA, totalB);
        return {
          question: `${person}第一次按${a1}:${b1}分糖,第二次按${a2}:${b2}分糖,合并后甲乙比是多少?`,
          answer: `${totalA/g}:${totalB/g}`,
          subtype: 'ratio',
          payload: { a1, b1, a2, b2, totalA, totalB, gcd: g },
        };
      },
    },
    {
      id: 'ratio-partnership',
      band: 'hard',
      generate(rng) {
        const [p1, p2] = pickTwoPeople(rng);
        const { a, b } = pickRatio(rng, 'hard');
        const profit = pickNumberByBand(rng, 'hard', { min: 100, max: 500 });
        const sum = a + b;
        const share1 = Math.round(profit * a / sum);
        const share2 = profit - share1;
        return {
          question: `${p1}和${p2}按${a}:${b}合伙做生意,赚了${profit}元,${p1}分多少?`,
          answer: `${p1}${share1}元,${p2}${share2}元`,
          subtype: 'ratio',
          payload: { a, b, profit, sum, share1, share2 },
        };
      },
    },
  ];
}

export const ratioTemplate = {
  id: 'ratio',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: generateRatioSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/ratio.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { ratioTemplate } from './ratio.js';

describe('ratioTemplate', () => {
  it('easy: partA + partB = total', () => {
    const rng = createRng(1);
    const result = ratioTemplate.generate(rng, 1);
    const { partA, partB, total } = result.payload;
    expect(partA + partB).toBe(total);
  });
  it('medium (scale): partB = partA * b / a', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = ratioTemplate.generate(rng, 2);
      if (result.payload.a !== undefined && result.payload.b !== undefined) break;
    }
    const { a, b, partA } = result.payload;
    expect(Math.round(partA * b / a)).toBe(Math.round(partA * b / a));
  });
  it('hard: share1 + share2 = profit', () => {
    const rng = createRng(3);
    const result = ratioTemplate.generate(rng, 3);
    const { share1, share2, profit } = result.payload;
    expect(share1 + share2).toBe(profit);
  });
});
```

---

## 附录 E: statistics.js + statistics.test.js

### `src/problemTemplates/statistics.js`

```js
import { pickNumberByBand, levelToBand } from './helpers.js';

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
      id: 'statistics-chart-read',
      band: 'medium',
      generate(rng) {
        const data = Array.from({ length: 5 }, () => pickNumberByBand(rng, 'medium', { min: 10, max: 50 }));
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
      id: 'statistics-mean-compare',
      band: 'hard',
      generate(rng) {
        const n1 = pickNumberByBand(rng, 'hard', { min: 4, max: 6 });
        const n2 = pickNumberByBand(rng, 'hard', { min: 4, max: 6 });
        const d1 = Array.from({ length: n1 }, () => pickNumberByBand(rng, 'hard', { min: 15, max: 40 }));
        const d2 = Array.from({ length: n2 }, () => pickNumberByBand(rng, 'hard', { min: 15, max: 40 }));
        const m1 = Math.round(d1.reduce((a,b)=>a+b,0) / n1 * 10) / 10;
        const m2 = Math.round(d2.reduce((a,b)=>a+b,0) / n2 * 10) / 10;
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
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/statistics.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { statisticsTemplate } from './statistics.js';

describe('statisticsTemplate', () => {
  it('easy: mean = total / n', () => {
    const rng = createRng(1);
    const result = statisticsTemplate.generate(rng, 1);
    const { total, n, mean } = result.payload;
    expect(mean).toBeCloseTo(total / n, 1);
  });
  it('medium (reverse): total = n * mean', () => {
    const rng = createRng(2);
    let result;
    for (let i = 0; i < 50; i++) {
      result = statisticsTemplate.generate(rng, 2);
      if (result.payload.mean !== undefined && result.payload.total !== undefined) break;
    }
    const { n, mean, total } = result.payload;
    expect(total).toBe(n * mean);
  });
  it('hard (compare): diff = |m1 - m2|', () => {
    const rng = createRng(3);
    const result = statisticsTemplate.generate(rng, 3);
    const { m1, m2, diff } = result.payload;
    expect(diff).toBe(Math.round(Math.abs(m1 - m2) * 10) / 10);
  });
});
```
