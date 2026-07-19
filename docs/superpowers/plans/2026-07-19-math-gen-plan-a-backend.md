# Plan A — 后端骨架（数据层 + 策略层 + Composables）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 PRD 扩展功能提供数据层（Dexie 题库）、策略层（算术/应用/奥数三类）与四类 composable（题库、生成、PDF 导出、打印）。完成后 UI 可直接接入。

**Architecture:** 在现有 `src/strategies/` 上扩展三类新策略，`src/db.js` 升级到 v2 新增 `problemLibrary` 表，`src/composables/` 新增 4 个文件封装横向能力。所有能力通过单元测试验证，UI 不动。

**Tech Stack:** Vue 3、Vite、Dexie 4、fake-indexeddb（测试）、Vitest、html2pdf.js。

**依赖本计划前置条件：** 无（仅依赖已存在的代码）。

**前置 spec 文档：** `docs/superpowers/specs/2026-07-19-primary-school-math-generator-design.md`

---

## 文件结构

### 新增

| 文件 | 职责 |
| --- | --- |
| `src/constants/options.js` | 年级、学期、题型、难度等枚举常量 |
| `src/constants/knowledgePoints.js` | 按年级组织的知识点字典 |
| `src/utils/rng.js` | 可注入种子的伪随机数工具 |
| `src/problemTemplates/index.js` | 模板注册中心 |
| `src/problemTemplates/shopping.js` | 购物应用题模板 |
| `src/problemTemplates/time.js` | 时间应用题模板 |
| `src/problemTemplates/comparison.js` | 比较应用题模板 |
| `src/problemTemplates/sequence.js` | 等差数列奥数模板 |
| `src/problemTemplates/logic.js` | 简单逻辑奥数模板 |
| `src/composables/useProblemLibrary.js` | 题库 CRUD + 抽题 |
| `src/composables/useProblemGenerator.js` | 生成编排 + 去重 + 缓存入库 |
| `src/composables/usePdfExport.js` | html2pdf.js 封装 |
| `src/composables/usePrint.js` | window.print 封装 |
| `src/strategies/ArithmeticStrategy.js` | 算术题编排（包装现有） |
| `src/strategies/ApplicationStrategy.js` | 应用题策略 |
| `src/strategies/OlympiadStrategy.js` | 奥数题策略 |

### 修改

| 文件 | 改动 |
| --- | --- |
| `src/db.js` | 升级到 `version(2)`，新增 `problemLibrary` 表与 CRUD |
| `src/strategies/ProblemGeneratorFactory.js` | 注册三类新策略 |

### 新增测试

| 文件 | 覆盖 |
| --- | --- |
| `src/constants/options.test.js` | 常量值 |
| `src/utils/rng.test.js` | 种子化随机 |
| `src/problemTemplates/shopping.test.js` | 购物模板 |
| `src/problemTemplates/time.test.js` | 时间模板 |
| `src/problemTemplates/comparison.test.js` | 比较模板 |
| `src/problemTemplates/sequence.test.js` | 等差数列模板 |
| `src/problemTemplates/logic.test.js` | 逻辑推理模板 |
| `src/composables/useProblemLibrary.test.js` | 题库读写 |
| `src/composables/useProblemGenerator.test.js` | 生成 + 入库 + 去重 |
| `src/composables/usePdfExport.test.js` | PDF 参数与降级 |
| `src/composables/usePrint.test.js` | 打印调用 |
| `src/strategies/ArithmeticStrategy.test.js` | 算术编排 |
| `src/strategies/ApplicationStrategy.test.js` | 应用题编排 |
| `src/strategies/OlympiadStrategy.test.js` | 奥数编排 |
| `src/db.test.js` | 扩展：v2 schema 与 library 表 |

---

## Task 1: 选项常量与知识点字典

**Files:**
- Create: `src/constants/options.js`
- Create: `src/constants/knowledgePoints.js`
- Test: `src/constants/options.test.js`

- [ ] **Step 1: 写失败测试 — options 常量**

在 `src/constants/options.test.js`：

```js
import { describe, it, expect } from 'vitest';
import {
  GRADES,
  SEMESTERS,
  QUESTION_TYPES,
  DIFFICULTIES,
  ANSWER_MODES,
  PROBLEM_TYPES,
} from './options.js';

describe('options', () => {
  it('exposes 6 grades 1-6', () => {
    expect(GRADES).toEqual(['1', '2', '3', '4', '5', '6']);
  });
  it('exposes 2 semesters', () => {
    expect(SEMESTERS).toEqual(['上', '下']);
  });
  it('exposes 3 question types', () => {
    expect(QUESTION_TYPES).toEqual(['arithmetic', 'application', 'olympiad']);
  });
  it('exposes 3 difficulties', () => {
    expect(DIFFICULTIES).toEqual(['easy', 'medium', 'hard']);
  });
  it('exposes 3 answer modes', () => {
    expect(ANSWER_MODES).toEqual(['hidden', 'inline', 'separate']);
  });
  it('exposes 2 problem types (arithmetic subtypes)', () => {
    expect(PROBLEM_TYPES).toEqual(['result', 'operand']);
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/constants/options.test.js
```

Expected: FAIL with "Cannot find module './options.js'"

- [ ] **Step 3: 实现 options.js**

```js
// src/constants/options.js
export const GRADES = ['1', '2', '3', '4', '5', '6'];
export const SEMESTERS = ['上', '下'];
export const QUESTION_TYPES = ['arithmetic', 'application', 'olympiad'];
export const DIFFICULTIES = ['easy', 'medium', 'hard'];
export const ANSWER_MODES = ['hidden', 'inline', 'separate'];
export const PROBLEM_TYPES = ['result', 'operand'];

export const DIFFICULTY_TO_LEVEL = {
  easy: 1,
  medium: 2,
  hard: 3,
};
```

- [ ] **Step 4: 写失败测试 — knowledgePoints 字典**

追加到 `src/constants/options.test.js` 末尾：

```js
import { KNOWLEDGE_POINTS_BY_GRADE } from './knowledgePoints.js';

describe('knowledgePoints', () => {
  it('has entries for all 6 grades', () => {
    expect(Object.keys(KNOWLEDGE_POINTS_BY_GRADE).sort()).toEqual(['1','2','3','4','5','6']);
  });

  it('grade 1 contains 100以内加减法', () => {
    expect(KNOWLEDGE_POINTS_BY_GRADE['1']).toContain('100以内加减法');
  });

  it('grade 2 contains 表内乘法', () => {
    expect(KNOWLEDGE_POINTS_BY_GRADE['2']).toContain('表内乘法');
  });

  it('grade 3 contains 分数初步', () => {
    expect(KNOWLEDGE_POINTS_BY_GRADE['3']).toContain('分数初步');
  });

  it('grade 4 contains 小数初步', () => {
    expect(KNOWLEDGE_POINTS_BY_GRADE['4']).toContain('小数初步');
  });

  it('grade 5 contains 简易方程', () => {
    expect(KNOWLEDGE_POINTS_BY_GRADE['5']).toContain('简易方程');
  });

  it('grade 6 contains 几何图形', () => {
    expect(KNOWLEDGE_POINTS_BY_GRADE['6']).toContain('几何图形');
  });

  it('every grade has unit conversion', () => {
    for (const g of ['1','2','3','4','5','6']) {
      expect(KNOWLEDGE_POINTS_BY_GRADE[g]).toContain('单位换算');
    }
  });
});
```

- [ ] **Step 5: 运行测试，确认失败**

```bash
npm run test:run -- src/constants/options.test.js
```

Expected: FAIL with "Cannot find module './knowledgePoints.js'"

- [ ] **Step 6: 实现 knowledgePoints.js**

```js
// src/constants/knowledgePoints.js
export const KNOWLEDGE_POINTS_BY_GRADE = {
  '1': ['10以内加减法', '100以内加减法', '认识图形', '单位换算'],
  '2': ['表内乘法', '表内除法', '100以内加减法', '单位换算', '认识时间'],
  '3': ['万以内加减法', '多位数乘除法', '分数初步', '单位换算', '周长面积'],
  '4': ['大数的认识', '三位数乘除法', '小数初步', '角的度量', '平行四边形', '单位换算'],
  '5': ['小数乘除法', '简易方程', '多边形面积', '因数倍数', '分数加减', '单位换算'],
  '6': ['分数乘除法', '百分数', '圆与圆柱', '比例', '几何图形', '单位换算'],
};
```

- [ ] **Step 7: 运行测试，确认通过**

```bash
npm run test:run -- src/constants/options.test.js
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/constants/
git commit -m "feat(constants): add options enums and knowledge points dictionary"
```

---

## Task 2: 可注入种子的 RNG 工具

**Files:**
- Create: `src/utils/rng.js`
- Test: `src/utils/rng.test.js`

- [ ] **Step 1: 写失败测试**

```js
// src/utils/rng.test.js
import { describe, it, expect } from 'vitest';
import { createRng } from './rng.js';

describe('createRng', () => {
  it('produces same sequence with same seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a.int(1, 100), a.int(1, 100), a.int(1, 100)])
      .toEqual([b.int(1, 100), b.int(1, 100), b.int(1, 100)]);
  });

  it('int(min, max) returns values within bounds', () => {
    const rng = createRng(1);
    for (let i = 0; i < 100; i++) {
      const v = rng.int(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('pick(arr) returns an element of the array', () => {
    const rng = createRng(7);
    const arr = ['a', 'b', 'c', 'd'];
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(rng.pick(arr));
    }
  });

  it('different seeds yield different sequences (probabilistic)', () => {
    const a = createRng(1);
    const b = createRng(2);
    const seqA = Array.from({ length: 20 }, () => a.int(0, 1000));
    const seqB = Array.from({ length: 20 }, () => b.int(0, 1000));
    expect(seqA).not.toEqual(seqB);
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/utils/rng.test.js
```

Expected: FAIL with "Cannot find module './rng.js'"

- [ ] **Step 3: 实现 rng.js**

```js
// src/utils/rng.js
// Mulberry32 — small, fast, seedable PRNG
export function createRng(seed = Date.now()) {
  let s = seed >>> 0;
  const next = () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int(min, max) {
      return Math.floor(next() * (max - min + 1)) + min;
    },
    pick(arr) {
      return arr[Math.floor(next() * arr.length)];
    },
    shuffle(arr) {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
  };
}
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/utils/rng.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/rng.js src/utils/rng.test.js
git commit -m "feat(utils): add seedable Mulberry32 RNG for deterministic problem generation"
```

---

## Task 3: Dexie schema v2 与题库 CRUD

**Files:**
- Modify: `src/db.js`
- Test: `src/db.test.js`（扩展）

- [ ] **Step 1: 写失败测试 — problemLibrary 表与 CRUD**

在 `src/db.test.js` 末尾追加：

```js
import { addToLibrary, getFromLibrary, queryLibrary, removeFromLibrary } from './db.js';

describe('problemLibrary CRUD (Dexie v2)', () => {
  it('adds and retrieves a problem by id', async () => {
    const id = await addToLibrary({
      grade: '3',
      semester: '上',
      type: 'arithmetic',
      subtype: 'add-result',
      difficulty: 1,
      knowledgePoints: ['100以内加减法'],
      question: '23 + 45 = ______',
      answer: '68',
      source: 'generated',
    });
    expect(id).toBeTypeOf('number');

    const fetched = await getFromLibrary(id);
    expect(fetched.question).toBe('23 + 45 = ______');
    expect(fetched.grade).toBe('3');
    expect(fetched.semester).toBe('上');
  });

  it('queries by grade+semester+type composite index', async () => {
    await addToLibrary({ grade: '3', semester: '上', type: 'arithmetic', subtype: 'add-result', difficulty: 1, knowledgePoints: [], question: '1+1=2', answer: '2', source: 'generated' });
    await addToLibrary({ grade: '3', semester: '上', type: 'application', subtype: 'shopping', difficulty: 1, knowledgePoints: [], question: '买2支铅笔', answer: '4元', source: 'generated' });
    await addToLibrary({ grade: '4', semester: '上', type: 'arithmetic', subtype: 'add-result', difficulty: 1, knowledgePoints: [], question: '2+2=4', answer: '4', source: 'generated' });

    const results = await queryLibrary({ grade: '3', semester: '上', type: 'arithmetic' });
    expect(results.length).toBe(1);
    expect(results[0].question).toBe('1+1=2');
  });

  it('removes a problem by id', async () => {
    const id = await addToLibrary({ grade: '1', semester: '下', type: 'application', subtype: 'shopping', difficulty: 1, knowledgePoints: [], question: 'x', answer: 'y', source: 'generated' });
    await removeFromLibrary(id);
    const fetched = await getFromLibrary(id);
    expect(fetched).toBeUndefined();
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/db.test.js
```

Expected: FAIL — `addToLibrary` 未导出

- [ ] **Step 3: 修改 db.js — 升级到 v2 与新增 CRUD**

替换 `src/db.js`：

```js
import Dexie from 'dexie';

export const db = new Dexie('MathProblemsHistory');

db.version(1).stores({
  problemSets: '++id, timestamp',
});

db.version(2).stores({
  problemSets: '++id, timestamp',
  problemLibrary: '++id, [grade+semester+type], type, grade, semester, difficulty, *knowledgePoints',
});

function getFormattedTimestamp() {
  const date = new Date();
  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const DD = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`;
}

export async function addProblemSet(problems, config) {
  try {
    await db.problemSets.add({
      timestamp: getFormattedTimestamp(),
      config,
      problems,
    });
    const count = await db.problemSets.count();
    if (count > 20) {
      const oldest = await db.problemSets.orderBy('timestamp').first();
      if (oldest) await db.problemSets.delete(oldest.id);
    }
  } catch (error) {
    console.error('Failed to add or prune problem sets:', error);
  }
}

export async function getHistory() {
  try {
    return await db.problemSets.orderBy('timestamp').reverse().toArray();
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
}

export async function addToLibrary(partial) {
  return await db.problemLibrary.add({
    createdAt: getFormattedTimestamp(),
    ...partial,
  });
}

export async function getFromLibrary(id) {
  return await db.problemLibrary.get(id);
}

export async function queryLibrary({ grade, semester, type, difficulty, knowledgePoints }) {
  let collection = db.problemLibrary
    .where('[grade+semester+type]')
    .equals([grade, semester, type]);

  if (difficulty !== undefined) {
    collection = collection.and((p) => p.difficulty === difficulty);
  }
  if (Array.isArray(knowledgePoints) && knowledgePoints.length > 0) {
    collection = collection.and((p) =>
      knowledgePoints.every((kp) => p.knowledgePoints.includes(kp))
    );
  }

  return await collection.toArray();
}

export async function removeFromLibrary(id) {
  return await db.problemLibrary.delete(id);
}
```

- [ ] **Step 4: 检查现有 db.test.js 是否需要 fake-indexeddb 设置**

打开 `src/db.test.js`，确认文件顶部包含（若没有则补上）：

```js
import 'fake-indexeddb/auto';
```

- [ ] **Step 5: 运行测试，确认通过**

```bash
npm run test:run -- src/db.test.js
```

Expected: PASS

- [ ] **Step 6: 运行所有测试，确认未回归**

```bash
npm run test:run
```

Expected: ALL PASS

- [ ] **Step 7: Commit**

```bash
git add src/db.js src/db.test.js
git commit -m "feat(db): upgrade Dexie to v2 with problemLibrary table and CRUD helpers"
```

---

## Task 4: 应用题模板 — shopping

**Files:**
- Create: `src/problemTemplates/shopping.js`
- Test: `src/problemTemplates/shopping.test.js`

- [ ] **Step 1: 写失败测试**

```js
// src/problemTemplates/shopping.test.js
import { describe, it, expect } from 'vitest';
import { shoppingTemplate } from './shopping.js';
import { createRng } from '../utils/rng.js';

describe('shoppingTemplate', () => {
  it('has id, gradeRange, semester', () => {
    expect(shoppingTemplate.id).toBe('shopping-basic');
    expect(shoppingTemplate.gradeRange).toEqual(['1', '2', '3']);
    expect(shoppingTemplate.semester).toBe('all');
  });

  it('produces consistent answer for given variables', () => {
    const rng = createRng(1);
    const result = shoppingTemplate.generate(rng, 1);
    expect(result.answer).toBe(`${result.payload.total}元`);
    expect(result.payload.total).toBe(result.payload.unitPrice * result.payload.quantity);
    expect(result.subtype).toBe('shopping');
    expect(result.question).toContain('小明');
  });

  it('is deterministic with the same seed', () => {
    const a = shoppingTemplate.generate(createRng(99), 2);
    const b = shoppingTemplate.generate(createRng(99), 2);
    expect(a).toEqual(b);
  });

  it('quantity grows with difficulty', () => {
    const easy = [];
    const hard = [];
    for (let s = 0; s < 20; s++) {
      easy.push(shoppingTemplate.generate(createRng(s), 1).payload.quantity);
      hard.push(shoppingTemplate.generate(createRng(s), 3).payload.quantity);
    }
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    expect(avg(hard)).toBeGreaterThan(avg(easy));
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/problemTemplates/shopping.test.js
```

Expected: FAIL — 模块不存在

- [ ] **Step 3: 实现 shopping.js**

```js
// src/problemTemplates/shopping.js
export const shoppingTemplate = {
  id: 'shopping-basic',
  gradeRange: ['1', '2', '3'],
  semester: 'all',
  generate(rng, difficulty) {
    const unitPrice = rng.int(1, 5 + difficulty * 2);
    const quantity = rng.int(2, 4 + difficulty * 2);
    const total = unitPrice * quantity;
    return {
      question: `小明买了${quantity}支铅笔，每支${unitPrice}元，一共花了多少钱？`,
      answer: `${total}元`,
      subtype: 'shopping',
      payload: { unitPrice, quantity, total },
    };
  },
};
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/problemTemplates/shopping.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/shopping.js src/problemTemplates/shopping.test.js
git commit -m "feat(templates): add shopping application template"
```

---

## Task 5: 应用题模板 — time

**Files:**
- Create: `src/problemTemplates/time.js`
- Test: `src/problemTemplates/time.test.js`

- [ ] **Step 1: 写失败测试**

```js
// src/problemTemplates/time.test.js
import { describe, it, expect } from 'vitest';
import { timeTemplate } from './time.js';
import { createRng } from '../utils/rng.js';

describe('timeTemplate', () => {
  it('metadata matches spec', () => {
    expect(timeTemplate.id).toBe('time-clock');
    expect(timeTemplate.gradeRange).toEqual(['1', '2', '3']);
  });

  it('computes hours consistently', () => {
    const rng = createRng(5);
    const r = timeTemplate.generate(rng, 1);
    expect(r.payload.hoursLater).toBeGreaterThan(0);
    expect(r.payload.hoursLater).toBeLessThanOrEqual(12);
    expect(r.question).toContain('小时');
    expect(r.subtype).toBe('time');
    expect(r.answer).toBe(`${r.payload.endHour}时`);
  });

  it('endHour wraps within 1-12', () => {
    for (let s = 0; s < 30; s++) {
      const r = timeTemplate.generate(createRng(s), 2);
      expect(r.payload.endHour).toBeGreaterThanOrEqual(1);
      expect(r.payload.endHour).toBeLessThanOrEqual(12);
    }
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/problemTemplates/time.test.js
```

Expected: FAIL

- [ ] **Step 3: 实现 time.js**

```js
// src/problemTemplates/time.js
function wrapHour(h) {
  return ((h - 1) % 12) + 1;
}

export const timeTemplate = {
  id: 'time-clock',
  gradeRange: ['1', '2', '3'],
  semester: 'all',
  generate(rng, difficulty) {
    const startHour = rng.int(1, 12);
    const hoursLater = rng.int(1, 3 + difficulty * 2);
    const endHour = wrapHour(startHour + hoursLater);
    return {
      question: `现在是${startHour}时，再过${hoursLater}小时是几时？`,
      answer: `${endHour}时`,
      subtype: 'time',
      payload: { startHour, hoursLater, endHour },
    };
  },
};
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/problemTemplates/time.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/time.js src/problemTemplates/time.test.js
git commit -m "feat(templates): add time application template"
```

---

## Task 6: 应用题模板 — comparison

**Files:**
- Create: `src/problemTemplates/comparison.js`
- Test: `src/problemTemplates/comparison.test.js`

- [ ] **Step 1: 写失败测试**

```js
// src/problemTemplates/comparison.test.js
import { describe, it, expect } from 'vitest';
import { comparisonTemplate } from './comparison.js';
import { createRng } from '../utils/rng.js';

describe('comparisonTemplate', () => {
  it('metadata matches spec', () => {
    expect(comparisonTemplate.id).toBe('comparison-diff');
    expect(comparisonTemplate.gradeRange).toEqual(['2', '3', '4']);
  });

  it('difference equals payload fields', () => {
    const r = comparisonTemplate.generate(createRng(7), 1);
    expect(r.payload.difference).toBe(Math.abs(r.payload.a - r.payload.b));
    expect(r.answer).toBe(`${r.payload.difference}`);
    expect(r.subtype).toBe('comparison');
    expect(r.question).toMatch(/多|少/);
  });

  it('produces non-negative difference', () => {
    for (let s = 0; s < 30; s++) {
      const r = comparisonTemplate.generate(createRng(s), 3);
      expect(r.payload.difference).toBeGreaterThanOrEqual(0);
    }
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/problemTemplates/comparison.test.js
```

Expected: FAIL

- [ ] **Step 3: 实现 comparison.js**

```js
// src/problemTemplates/comparison.js
export const comparisonTemplate = {
  id: 'comparison-diff',
  gradeRange: ['2', '3', '4'],
  semester: 'all',
  generate(rng, difficulty) {
    const a = rng.int(10, 30 + difficulty * 20);
    const b = rng.int(10, 30 + difficulty * 20);
    const [big, small] = a >= b ? [a, b] : [b, a];
    const difference = big - small;
    return {
      question: `小红有${big}颗糖，小明有${small}颗糖，小红比小明多几颗？`,
      answer: `${difference}`,
      subtype: 'comparison',
      payload: { a: big, b: small, difference },
    };
  },
};
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/problemTemplates/comparison.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/comparison.js src/problemTemplates/comparison.test.js
git commit -m "feat(templates): add comparison application template"
```

---

## Task 7: 奥数题模板 — sequence（等差数列）

**Files:**
- Create: `src/problemTemplates/sequence.js`
- Test: `src/problemTemplates/sequence.test.js`

- [ ] **Step 1: 写失败测试**

```js
// src/problemTemplates/sequence.test.js
import { describe, it, expect } from 'vitest';
import { sequenceTemplate } from './sequence.js';
import { createRng } from '../utils/rng.js';

describe('sequenceTemplate (arithmetic progression)', () => {
  it('metadata matches spec', () => {
    expect(sequenceTemplate.id).toBe('sequence-arith');
    expect(sequenceTemplate.gradeRange).toEqual(['3', '4', '5', '6']);
  });

  it('produces a valid arithmetic sequence and next term', () => {
    const r = sequenceTemplate.generate(createRng(10), 1);
    const { sequence, commonDiff, nextTerm } = r.payload;
    expect(sequence.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < sequence.length; i++) {
      expect(sequence[i] - sequence[i - 1]).toBe(commonDiff);
    }
    expect(nextTerm).toBe(sequence[sequence.length - 1] + commonDiff);
    expect(r.answer).toBe(`${nextTerm}`);
    expect(r.subtype).toBe('sequence');
  });

  it('length scales with difficulty', () => {
    for (let s = 0; s < 10; s++) {
      const easy = sequenceTemplate.generate(createRng(s), 1);
      const hard = sequenceTemplate.generate(createRng(s), 3);
      expect(hard.payload.sequence.length).toBeGreaterThanOrEqual(easy.payload.sequence.length);
    }
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/problemTemplates/sequence.test.js
```

Expected: FAIL

- [ ] **Step 3: 实现 sequence.js**

```js
// src/problemTemplates/sequence.js
export const sequenceTemplate = {
  id: 'sequence-arith',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  generate(rng, difficulty) {
    const length = 4 + difficulty;
    const start = rng.int(1, 20);
    const commonDiff = rng.int(1, 3 + difficulty * 2);
    const sequence = Array.from({ length }, (_, i) => start + i * commonDiff);
    const nextTerm = sequence[sequence.length - 1] + commonDiff;
    return {
      question: `找规律填空：${sequence.join(', ')}, ( )`,
      answer: `${nextTerm}`,
      subtype: 'sequence',
      payload: { sequence, commonDiff, nextTerm },
    };
  },
};
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/problemTemplates/sequence.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/sequence.js src/problemTemplates/sequence.test.js
git commit -m "feat(templates): add arithmetic sequence olympiad template"
```

---

## Task 8: 奥数题模板 — logic（简单逻辑推理）

**Files:**
- Create: `src/problemTemplates/logic.js`
- Test: `src/problemTemplates/logic.test.js`

- [ ] **Step 1: 写失败测试**

```js
// src/problemTemplates/logic.test.js
import { describe, it, expect } from 'vitest';
import { logicTemplate } from './logic.js';
import { createRng } from '../utils/rng.js';

describe('logicTemplate', () => {
  it('metadata matches spec', () => {
    expect(logicTemplate.id).toBe('logic-simple');
    expect(logicTemplate.gradeRange).toEqual(['4', '5', '6']);
  });

  it('total equals sum of items', () => {
    const r = logicTemplate.generate(createRng(11), 1);
    expect(r.payload.total).toBe(r.payload.a + r.payload.b + r.payload.c);
    expect(r.answer).toBe(`${r.payload.total}`);
    expect(r.subtype).toBe('logic');
    expect(r.question).toContain('一共');
  });

  it('uses positive values', () => {
    for (let s = 0; s < 30; s++) {
      const r = logicTemplate.generate(createRng(s), 2);
      expect(r.payload.a).toBeGreaterThan(0);
      expect(r.payload.b).toBeGreaterThan(0);
      expect(r.payload.c).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/problemTemplates/logic.test.js
```

Expected: FAIL

- [ ] **Step 3: 实现 logic.js**

```js
// src/problemTemplates/logic.js
export const logicTemplate = {
  id: 'logic-simple',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  generate(rng, difficulty) {
    const a = rng.int(2, 5 + difficulty * 3);
    const b = rng.int(2, 5 + difficulty * 3);
    const c = rng.int(2, 5 + difficulty * 3);
    const total = a + b + c;
    return {
      question: `小华有${a}支笔，又得到${b}支，后来送给同学${c}支，现在一共有几支笔？`,
      answer: `${total - c}支`,
      subtype: 'logic',
      payload: { a, b, c, total: total - c },
    };
  },
};
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/problemTemplates/logic.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/logic.js src/problemTemplates/logic.test.js
git commit -m "feat(templates): add simple logic olympiad template"
```

---

## Task 9: 模板注册中心

**Files:**
- Create: `src/problemTemplates/index.js`

- [ ] **Step 1: 创建 index.js**

```js
// src/problemTemplates/index.js
import { shoppingTemplate } from './shopping.js';
import { timeTemplate } from './time.js';
import { comparisonTemplate } from './comparison.js';
import { sequenceTemplate } from './sequence.js';
import { logicTemplate } from './logic.js';

export const APPLICATION_TEMPLATES = [shoppingTemplate, timeTemplate, comparisonTemplate];

export const OLYMPIAD_TEMPLATES = [sequenceTemplate, logicTemplate];

export function templatesFor(type, grade) {
  const all = type === 'application' ? APPLICATION_TEMPLATES : OLYMPIAD_TEMPLATES;
  if (!grade) return all;
  return all.filter((t) => t.gradeRange.includes(String(grade)));
}
```

- [ ] **Step 2: 运行所有模板测试，确认通过**

```bash
npm run test:run -- src/problemTemplates/
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/problemTemplates/index.js
git commit -m "feat(templates): register all templates with grade filtering helper"
```

---

## Task 10: ApplicationStrategy

**Files:**
- Create: `src/strategies/ApplicationStrategy.js`
- Test: `src/strategies/ApplicationStrategy.test.js`

- [ ] **Step 1: 写失败测试**

```js
// src/strategies/ApplicationStrategy.test.js
import { describe, it, expect } from 'vitest';
import { ApplicationStrategy } from './ApplicationStrategy.js';
import { createRng } from '../utils/rng.js';

describe('ApplicationStrategy', () => {
  const config = {
    grade: '2',
    semester: '上',
    difficulty: 'easy',
  };

  it('returns problems with application shape', () => {
    const s = new ApplicationStrategy(config);
    const result = s.generate(createRng(1));
    expect(result).toMatchObject({
      question: expect.any(String),
      answer: expect.any(String),
      subtype: expect.any(String),
      payload: expect.any(Object),
    });
  });

  it('respects grade filter — grade 4 cannot use shopping (range 1-3) if strict', () => {
    const s = new ApplicationStrategy({ ...config, grade: '4' });
    const seen = new Set();
    for (let i = 0; i < 30; i++) {
      seen.add(s.generate(createRng(i)).subtype);
    }
    expect(seen.has('shopping')).toBe(false);
  });

  it('is deterministic with same seed', () => {
    const s = new ApplicationStrategy(config);
    const a = s.generate(createRng(42));
    const b = s.generate(createRng(42));
    expect(a).toEqual(b);
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/strategies/ApplicationStrategy.test.js
```

Expected: FAIL

- [ ] **Step 3: 实现 ApplicationStrategy.js**

```js
// src/strategies/ApplicationStrategy.js
import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { templatesFor } from '../problemTemplates/index.js';
import { DIFFICULTY_TO_LEVEL } from '../constants/options.js';

export class ApplicationStrategy extends ProblemGeneratorStrategy {
  constructor(config) {
    super(config);
    this.difficultyLevel = DIFFICULTY_TO_LEVEL[config.difficulty] ?? 2;
    this.templates = templatesFor('application', config.grade);
  }

  generate(rng) {
    if (this.templates.length === 0) {
      throw new Error(`No application templates available for grade ${this.config.grade}`);
    }
    const tpl = rng.pick(this.templates);
    return tpl.generate(rng, this.difficultyLevel);
  }
}
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/strategies/ApplicationStrategy.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/strategies/ApplicationStrategy.js src/strategies/ApplicationStrategy.test.js
git commit -m "feat(strategies): add ApplicationStrategy with grade-filtered templates"
```

---

## Task 11: OlympiadStrategy

**Files:**
- Create: `src/strategies/OlympiadStrategy.js`
- Test: `src/strategies/OlympiadStrategy.test.js`

- [ ] **Step 1: 写失败测试**

```js
// src/strategies/OlympiadStrategy.test.js
import { describe, it, expect } from 'vitest';
import { OlympiadStrategy } from './OlympiadStrategy.js';
import { createRng } from '../utils/rng.js';

describe('OlympiadStrategy', () => {
  const config = {
    grade: '5',
    semester: '上',
    difficulty: 'medium',
  };

  it('returns olympiad-shape problem', () => {
    const s = new OlympiadStrategy(config);
    const r = s.generate(createRng(3));
    expect(r.subtype).toMatch(/sequence|logic/);
  });

  it('grade 2 cannot use olympiad templates (range starts at 3)', () => {
    const s = new OlympiadStrategy({ ...config, grade: '2' });
    expect(() => s.generate(createRng(1))).toThrow(/No olympiad templates/);
  });

  it('difficulty scales with level', () => {
    const easy = new OlympiadStrategy({ ...config, difficulty: 'easy' });
    const hard = new OlympiadStrategy({ ...config, difficulty: 'hard' });
    expect(easy.difficultyLevel).toBe(1);
    expect(hard.difficultyLevel).toBe(3);
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/strategies/OlympiadStrategy.test.js
```

Expected: FAIL

- [ ] **Step 3: 实现 OlympiadStrategy.js**

```js
// src/strategies/OlympiadStrategy.js
import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { templatesFor } from '../problemTemplates/index.js';
import { DIFFICULTY_TO_LEVEL } from '../constants/options.js';

export class OlympiadStrategy extends ProblemGeneratorStrategy {
  constructor(config) {
    super(config);
    this.difficultyLevel = DIFFICULTY_TO_LEVEL[config.difficulty] ?? 2;
    this.templates = templatesFor('olympiad', config.grade);
  }

  generate(rng) {
    if (this.templates.length === 0) {
      throw new Error(`No olympiad templates available for grade ${this.config.grade}`);
    }
    const tpl = rng.pick(this.templates);
    return tpl.generate(rng, this.difficultyLevel);
  }
}
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/strategies/OlympiadStrategy.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/strategies/OlympiadStrategy.js src/strategies/OlympiadStrategy.test.js
git commit -m "feat(strategies): add OlympiadStrategy with grade-filtered templates"
```

---

## Task 12: ArithmeticStrategy（包装现有）

**Files:**
- Create: `src/strategies/ArithmeticStrategy.js`
- Test: `src/strategies/ArithmeticStrategy.test.js`

- [ ] **Step 1: 写失败测试**

```js
// src/strategies/ArithmeticStrategy.test.js
import { describe, it, expect } from 'vitest';
import { ArithmeticStrategy } from './ArithmeticStrategy.js';
import { createRng } from '../utils/rng.js';

describe('ArithmeticStrategy', () => {
  const config = {
    problemType: 'result',
    operations: { add: true, subtract: false, multiply: false, divide: false },
    digits: { add: 1, subtract: 1, multiply: 1, divide: 1 },
    termCount: 2,
    useBrackets: false,
    allowRepeatOperators: true,
  };

  it('delegates to ResultProblemStrategy for result type', () => {
    const s = new ArithmeticStrategy(config);
    const r = s.generate(createRng(1));
    expect(r.question).toMatch(/\d+\s*\+/);
  });

  it('delegates to OperandProblemStrategy for operand type', () => {
    const s = new ArithmeticStrategy({ ...config, problemType: 'operand' });
    const r = s.generate(createRng(2));
    expect(r.question).toMatch(/______/);
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/strategies/ArithmeticStrategy.test.js
```

Expected: FAIL

- [ ] **Step 3: 实现 ArithmeticStrategy.js**

```js
// src/strategies/ArithmeticStrategy.js
import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { ResultProblemStrategy } from './ResultProblemStrategy.js';
import { OperandProblemStrategy } from './OperandProblemStrategy.js';

export class ArithmeticStrategy extends ProblemGeneratorStrategy {
  constructor(config) {
    super(config);
    this.inner =
      config.problemType === 'operand'
        ? new OperandProblemStrategy(config)
        : new ResultProblemStrategy(config);
  }

  generate(rng) {
    const r = this.inner.generate();
    return {
      question: r.question,
      answer: String(r.answer),
      subtype: `arithmetic-${this.config.problemType}`,
      payload: {},
    };
  }
}
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/strategies/ArithmeticStrategy.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/strategies/ArithmeticStrategy.js src/strategies/ArithmeticStrategy.test.js
git commit -m "feat(strategies): add ArithmeticStrategy that wraps result/operand strategies"
```

---

## Task 13: Factory 注册三类新策略

**Files:**
- Modify: `src/strategies/ProblemGeneratorFactory.js`

- [ ] **Step 1: 查看现有 Factory**

```bash
cat src/strategies/ProblemGeneratorFactory.js
```

- [ ] **Step 2: 在 factory 注册新策略**

修改 `createStrategy` switch 与 `getSupportedTypes`，并在文件顶部添加 import：

```js
// src/strategies/ProblemGeneratorFactory.js (top imports)
import { ArithmeticStrategy } from './ArithmeticStrategy.js';
import { ApplicationStrategy } from './ApplicationStrategy.js';
import { OlympiadStrategy } from './OlympiadStrategy.js';
```

修改 `createStrategy`：

```js
static createStrategy(type, config) {
  switch (type) {
    case 'result':
      return new ResultProblemStrategy(config);
    case 'operand':
      return new OperandProblemStrategy(config);
    case 'arithmetic':
      return new ArithmeticStrategy(config);
    case 'application':
      return new ApplicationStrategy(config);
    case 'olympiad':
      return new OlympiadStrategy(config);
    default:
      throw new Error(`Unsupported strategy type: ${type}`);
  }
}
```

修改 `getSupportedTypes`：

```js
static getSupportedTypes() {
  return ['result', 'operand', 'arithmetic', 'application', 'olympiad'];
}
```

- [ ] **Step 3: 运行所有测试**

```bash
npm run test:run
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/strategies/ProblemGeneratorFactory.js
git commit -m "feat(strategies): register arithmetic/application/olympiad strategies in factory"
```

---

## Task 14: useProblemLibrary composable

**Files:**
- Create: `src/composables/useProblemLibrary.js`
- Test: `src/composables/useProblemLibrary.test.js`

- [ ] **Step 1: 写失败测试**

```js
// src/composables/useProblemLibrary.test.js
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia'; // not needed actually, omit if not used
import { useProblemLibrary } from './useProblemLibrary.js';
import { db } from '../db.js';

describe('useProblemLibrary', () => {
  beforeEach(async () => {
    await db.problemLibrary.clear();
  });

  it('save persists to library and is queryable', async () => {
    const lib = useProblemLibrary();
    const id = await lib.save({
      grade: '3',
      semester: '上',
      type: 'arithmetic',
      subtype: 'add-result',
      difficulty: 1,
      knowledgePoints: ['100以内加减法'],
      question: '12 + 34 = ______',
      answer: '46',
      source: 'generated',
    });
    expect(id).toBeTypeOf('number');
    const results = await lib.query({ grade: '3', semester: '上', type: 'arithmetic' });
    expect(results.length).toBe(1);
    expect(results[0].question).toBe('12 + 34 = ______');
  });

  it('query with difficulty filter', async () => {
    const lib = useProblemLibrary();
    await lib.save({ grade: '3', semester: '上', type: 'arithmetic', subtype: 'add-result', difficulty: 1, knowledgePoints: [], question: 'a', answer: 'b', source: 'generated' });
    await lib.save({ grade: '3', semester: '上', type: 'arithmetic', subtype: 'add-result', difficulty: 2, knowledgePoints: [], question: 'c', answer: 'd', source: 'generated' });
    const easy = await lib.query({ grade: '3', semester: '上', type: 'arithmetic', difficulty: 1 });
    expect(easy.length).toBe(1);
    expect(easy[0].question).toBe('a');
  });

  it('remove deletes by id', async () => {
    const lib = useProblemLibrary();
    const id = await lib.save({ grade: '1', semester: '下', type: 'application', subtype: 'shopping', difficulty: 1, knowledgePoints: [], question: 'x', answer: 'y', source: 'generated' });
    await lib.remove(id);
    const results = await lib.query({ grade: '1', semester: '下', type: 'application' });
    expect(results.length).toBe(0);
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/composables/useProblemLibrary.test.js
```

Expected: FAIL

- [ ] **Step 3: 实现 useProblemLibrary.js**

```js
// src/composables/useProblemLibrary.js
import { addToLibrary, queryLibrary, removeFromLibrary } from '../db.js';

export function useProblemLibrary() {
  return {
    save: addToLibrary,
    query: queryLibrary,
    remove: removeFromLibrary,
  };
}
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/composables/useProblemLibrary.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/composables/useProblemLibrary.js src/composables/useProblemLibrary.test.js
git commit -m "feat(composables): add useProblemLibrary thin wrapper over db CRUD"
```

---

## Task 15: useProblemGenerator composable

**Files:**
- Create: `src/composables/useProblemGenerator.js`
- Test: `src/composables/useProblemGenerator.test.js`

- [ ] **Step 1: 写失败测试**

```js
// src/composables/useProblemGenerator.test.js
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { useProblemGenerator } from './useProblemGenerator.js';
import { db } from '../db.js';

describe('useProblemGenerator', () => {
  beforeEach(async () => {
    await db.problemLibrary.clear();
  });

  it('generates arithmetic problems and caches them in library', async () => {
    const gen = useProblemGenerator();
    const config = {
      grade: '3',
      semester: '上',
      questionTypes: ['arithmetic'],
      problemType: 'result',
      difficulty: 'easy',
      problemCount: 5,
      operations: { add: true, subtract: false, multiply: false, divide: false },
      digits: { add: 1, subtract: 1, multiply: 1, divide: 1 },
      termCount: 2,
      useBrackets: false,
      allowRepeatOperators: true,
      knowledgePoints: [],
      composition: { arithmetic: 5, application: 0, olympiad: 0 },
    };
    const problems = await gen.generate(config);
    expect(problems.length).toBe(5);
    const stored = await db.problemLibrary.toArray();
    expect(stored.length).toBeGreaterThanOrEqual(5);
    expect(stored.every((p) => p.type === 'arithmetic')).toBe(true);
  });

  it('deduplicates within a single generation', async () => {
    const gen = useProblemGenerator();
    const config = {
      grade: '2',
      semester: '上',
      questionTypes: ['application'],
      difficulty: 'easy',
      problemCount: 10,
      operations: {},
      digits: {},
      termCount: 2,
      useBrackets: false,
      allowRepeatOperators: true,
      knowledgePoints: [],
      composition: { arithmetic: 0, application: 10, olympiad: 0 },
    };
    const problems = await gen.generate(config);
    const set = new Set(problems.map((p) => p.question));
    expect(set.size).toBe(problems.length);
  });

  it('splits count across multiple question types when composition present', async () => {
    const gen = useProblemGenerator();
    const config = {
      grade: '5',
      semester: '上',
      questionTypes: ['application', 'olympiad'],
      difficulty: 'medium',
      problemCount: 4,
      operations: {},
      digits: {},
      termCount: 2,
      useBrackets: false,
      allowRepeatOperators: true,
      knowledgePoints: [],
      composition: { application: 2, olympiad: 2, arithmetic: 0 },
    };
    const problems = await gen.generate(config);
    const byType = problems.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {});
    expect(byType.application).toBe(2);
    expect(byType.olympiad).toBe(2);
  });

  it('falls back gracefully if composition is missing — distributes remainder to first type', async () => {
    const gen = useProblemGenerator();
    const config = {
      grade: '3',
      semester: '上',
      questionTypes: ['application'],
      difficulty: 'easy',
      problemCount: 3,
      operations: {},
      digits: {},
      termCount: 2,
      useBrackets: false,
      allowRepeatOperators: true,
      knowledgePoints: [],
      composition: { application: 0, olympiad: 0, arithmetic: 0 },
    };
    const problems = await gen.generate(config);
    expect(problems.length).toBe(3);
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/composables/useProblemGenerator.test.js
```

Expected: FAIL

- [ ] **Step 3: 实现 useProblemGenerator.js**

```js
// src/composables/useProblemGenerator.js
import { createRng } from '../utils/rng.js';
import { ProblemGeneratorFactory } from '../strategies/ProblemGeneratorFactory.js';
import { useProblemLibrary } from './useProblemLibrary.js';

const ARITHMETIC_DEFAULT_PROBLEM_TYPE = 'result';

function buildComposition(config) {
  if (config.composition && Object.values(config.composition).some((v) => v > 0)) {
    return { ...config.composition };
  }
  const types = config.questionTypes;
  const base = Math.floor(config.problemCount / types.length);
  const remainder = config.problemCount % types.length;
  const out = { arithmetic: 0, application: 0, olympiad: 0 };
  types.forEach((t, i) => {
    out[t] = base + (i === 0 ? remainder : 0);
  });
  return out;
}

async function generateOne(rng, type, config) {
  const factory = ProblemGeneratorFactory.createStrategy;
  const innerConfig = { ...config };
  if (type === 'arithmetic' && !innerConfig.problemType) {
    innerConfig.problemType = ARITHMETIC_DEFAULT_PROBLEM_TYPE;
  }
  const strategy = factory(type, innerConfig);
  return strategy.generate(rng);
}

export function useProblemGenerator() {
  const library = useProblemLibrary();

  async function generate(config) {
    const composition = buildComposition(config);
    const rng = createRng();
    const seen = new Set();
    const results = [];

    for (const [type, count] of Object.entries(composition)) {
      if (!count || count <= 0) continue;
      let attempts = 0;
      let produced = 0;
      while (produced < count && attempts < count * 5) {
        attempts++;
        try {
          const p = await generateOne(rng, type, config);
          if (seen.has(p.question)) continue;
          seen.add(p.question);
          results.push({
            type,
            subtype: p.subtype,
            question: p.question,
            answer: p.answer,
            payload: p.payload || {},
          });
          produced++;
        } catch (err) {
          // grade/template mismatch — skip
        }
      }
    }

    await persistToLibrary(results, config);
    return results;
  }

  async function persistToLibrary(results, config) {
    const baseRecord = {
      grade: config.grade,
      semester: config.semester,
      difficulty: difficultyToLevel(config.difficulty),
      knowledgePoints: config.knowledgePoints || [],
      source: 'generated',
    };
    for (const r of results) {
      try {
        await library.save({
          ...baseRecord,
          type: r.type,
          subtype: r.subtype,
          question: r.question,
          answer: r.answer,
          payload: r.payload,
        });
      } catch (e) {
        // skip duplicates silently
      }
    }
  }

  return { generate };
}

function difficultyToLevel(d) {
  return { easy: 1, medium: 2, hard: 3 }[d] || 2;
}
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/composables/useProblemGenerator.test.js
```

Expected: PASS（如果出现 `Cannot find module 'pinia'` 等错误，删除测试中的 `setActivePinia` 引用——它未被使用）

- [ ] **Step 5: 运行所有测试**

```bash
npm run test:run
```

Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add src/composables/useProblemGenerator.js src/composables/useProblemGenerator.test.js
git commit -m "feat(composables): add useProblemGenerator with multi-type split, dedupe, library caching"
```

---

## Task 16: usePdfExport composable

**Files:**
- Create: `src/composables/usePdfExport.js`
- Test: `src/composables/usePdfExport.test.js`

- [ ] **Step 1: 写失败测试**

```js
// src/composables/usePdfExport.test.js
import { describe, it, expect, vi } from 'vitest';

// Mock html2pdf.js before importing
vi.mock('html2pdf.js', () => {
  const saveFn = vi.fn();
  const fromFn = vi.fn(() => ({ save: saveFn }));
  const setFn = vi.fn(() => ({ from: fromFn }));
  const html2pdf = vi.fn(() => ({ set: setFn }));
  return { default: html2pdf };
});

import { usePdfExport } from './usePdfExport.js';
import html2pdf from 'html2pdf.js';

describe('usePdfExport', () => {
  it('exports PDF with A4 portrait, scale 2, and Chinese filename', async () => {
    const el = document.createElement('div');
    el.textContent = '题目';
    document.body.appendChild(el);
    const { exportPdf } = usePdfExport();
    await exportPdf(el, '数学练习题_三年级_2026-07-19.pdf');

    expect(html2pdf).toHaveBeenCalled();
    expect(html2pdf().set).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: '数学练习题_三年级_2026-07-19.pdf',
        jsPDF: expect.objectContaining({ format: 'a4', orientation: 'portrait' }),
        html2canvas: expect.objectContaining({ scale: 2 }),
      })
    );
  });

  it('uses jpeg image format with 0.95 quality', async () => {
    const el = document.createElement('div');
    const { exportPdf } = usePdfExport();
    await exportPdf(el, 'test.pdf');
    expect(html2pdf().set).toHaveBeenCalledWith(
      expect.objectContaining({
        image: expect.objectContaining({ type: 'jpeg', quality: 0.95 }),
      })
    );
  });
});
```

- [ ] **Step 2: 安装依赖**

```bash
npm install html2pdf.js
```

- [ ] **Step 3: 运行测试，确认失败**

```bash
npm run test:run -- src/composables/usePdfExport.test.js
```

Expected: FAIL

- [ ] **Step 4: 实现 usePdfExport.js**

```js
// src/composables/usePdfExport.js
import html2pdf from 'html2pdf.js';

export function usePdfExport() {
  async function exportPdf(element, filename) {
    const opt = {
      margin: 10,
      filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    };
    return html2pdf().set(opt).from(element).save();
  }

  function buildFilename({ grade, semester }) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const gradeLabel = grade ? `${grade}年级${semester || ''}` : '练习';
    return `数学练习题_${gradeLabel}_${yyyy}-${mm}-${dd}.pdf`;
  }

  return { exportPdf, buildFilename };
}
```

- [ ] **Step 5: 运行测试，确认通过**

```bash
npm run test:run -- src/composables/usePdfExport.test.js
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/composables/usePdfExport.js src/composables/usePdfExport.test.js
git commit -m "feat(composables): add usePdfExport with html2pdf.js and Chinese filename helper"
```

---

## Task 17: usePrint composable

**Files:**
- Create: `src/composables/usePrint.js`
- Test: `src/composables/usePrint.test.js`

- [ ] **Step 1: 写失败测试**

```js
// src/composables/usePrint.test.js
import { describe, it, expect, vi } from 'vitest';
import { usePrint } from './usePrint.js';

describe('usePrint', () => {
  it('calls window.print exactly once', () => {
    const spy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const { print } = usePrint();
    print();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('applies body class for the print window', () => {
    vi.spyOn(window, 'print').mockImplementation(() => {});
    const { print } = usePrint();
    print({ answerMode: 'separate' });
    expect(document.body.classList.contains('print-with-answer')).toBe(true);
    expect(document.body.classList.contains('print-without-answer')).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/composables/usePrint.test.js
```

Expected: FAIL

- [ ] **Step 3: 实现 usePrint.js**

```js
// src/composables/usePrint.js
export function usePrint() {
  function print({ answerMode = 'hidden' } = {}) {
    document.body.classList.remove('print-with-answer', 'print-without-answer');
    document.body.classList.add(
      answerMode === 'separate' ? 'print-with-answer' : 'print-without-answer'
    );
    window.print();
  }

  return { print };
}
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/composables/usePrint.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/composables/usePrint.js src/composables/usePrint.test.js
git commit -m "feat(composables): add usePrint wrapping window.print with body-class hooks"
```

---

## Task 18: Plan A 质量门禁

- [ ] **Step 1: 运行全部测试**

```bash
npm run test:run
```

Expected: ALL PASS

- [ ] **Step 2: 运行 build**

```bash
npm run build
```

Expected: 成功输出到 `dist/`

- [ ] **Step 3: 验证 dev 服务器能启动（手动验证可选）**

```bash
npm run dev &  # 后台启动
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000
kill %1
```

Expected: 200

- [ ] **Step 4: Commit（若有任何手动调整）**

```bash
git status
# 如果有改动：
git add -A
git commit -m "chore(plan-a): final verification pass"
```

---

## 自审

- ✅ §3 配置模型 → Task 1 常量定义；Task 15 useProblemGenerator 消费
- ✅ §4 Dexie schema → Task 3 schema v2 + CRUD
- ✅ §5.3 应用题模板 → Task 4/5/6（shopping/time/comparison）+ Task 10 ApplicationStrategy
- ✅ §5.4 奥数题模板 → Task 7/8（sequence/logic）+ Task 11 OlympiadStrategy
- ✅ §5.2 算术编排 → Task 12 ArithmeticStrategy
- ✅ §5.1 工厂扩展 → Task 13
- ✅ §4 抽题流程 → Task 15 useProblemGenerator（去重 + 缓存入库 + 重试）
- ✅ §7.1/7.2 PDF → Task 16 usePdfExport
- ✅ §7.4 打印 → Task 17 usePrint
- ✅ §8.1 单元测试 → 每个任务都含 Vitest 测试
- ✅ §8.2 模板快照测试 → Task 4/5/6/7/8 测试断言答案与变量一致
- ⚠️ §8.4 覆盖率 ≥ 70% → Plan A 仅完成后端，UI 集成与端到端在 Plan B；待 Plan B 完成时统一核查

---

## 交付检查清单

- [ ] `npm run test:run` 全绿
- [ ] `npm run build` 成功
- [ ] Dev server 启动正常
- [ ] 16 个新文件 + 2 个修改文件全部提交
- [ ] Dexie v2 升级不破坏现有 `problemSets` 历史表
- [ ] 5 个模板 + 3 个新策略 + 工厂注册全部到位
- [ ] 4 个 composable 全部单元测试通过