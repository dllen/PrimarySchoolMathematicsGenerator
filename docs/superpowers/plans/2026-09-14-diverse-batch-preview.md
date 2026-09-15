# 应用题 + 奥数题 多样化 batch & 预览 CLI 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `useProblemGenerator` 一次 batch 内每个 `subtemplateId` 出现次数 ≤ `ceil(N/M)+1`,并提供 `npm run preview:questions` CLI 在终端按模板分组预览。

**Architecture:** 把"多样化选题"抽成纯 JS 模块 `src/problemTemplates/diversity.js`(`enumerateSubtypes` / `computeCap` / `pickUnderCap` / `buildComposition`),生产端和 CLI 都调它,DRY。`pickForBand` 透出 `subtemplateId` + `band` 字段(向后兼容)作为 dedup key。

**Tech Stack:** Vue 3.3、Vite 4、Tailwind、Vitest 3、ESM。零新依赖。

**Spec:** `docs/superpowers/specs/2026-09-14-diverse-batch-preview-design.md`

---

## File Structure

| 路径 | 类型 | 职责 |
|---|---|---|
| `src/problemTemplates/helpers.js` | 改 | `pickForBand` 返回值新增 `subtemplateId` / `band` |
| `src/problemTemplates/helpers.test.js` | 改 | 断言新增字段 |
| `src/problemTemplates/diversity.js` | 新 | 三个纯函数 + `buildComposition`(从 useProblemGenerator 移入) |
| `src/problemTemplates/diversity.test.js` | 新 | 纯函数单测 |
| `src/composables/useProblemGenerator.js` | 改 | 引入 cap、import buildComposition from diversity |
| `src/composables/useProblemGenerator.test.js` | 改 | 新增多样化上限断言 |
| `scripts/preview-questions.mjs` | 新 | CLI 脚本 |
| `package.json` | 改 | 加 `"preview:questions"` script |

---

## Task 1: `pickForBand` 透出 `subtemplateId` 与 `band`

**Files:**
- Modify: `src/problemTemplates/helpers.js:108-118`
- Modify: `src/problemTemplates/helpers.test.js:125-147`

- [ ] **Step 1: 写失败的测试 — 断言返回结果带 `subtemplateId` 和 `band`**

在 `src/problemTemplates/helpers.test.js` 的 `describe('pickForBand', ...)` 块末尾追加:

```js
  it('返回结果附带 subtemplateId 与 band', () => {
    const template = {
      id: 'fake',
      subtemplates: [
        { id: 'fake-easy-1', band: 'easy', generate: () => ({ tag: 'e1' }) },
        { id: 'fake-easy-2', band: 'easy', generate: () => ({ tag: 'e2' }) },
        { id: 'fake-hard-1', band: 'hard', generate: () => ({ tag: 'h1' }) },
      ],
    };
    const easy = pickForBand(template, 1, createRng(1));
    expect(easy.subtemplateId).toMatch(/^fake-easy-\d$/);
    expect(easy.band).toBe('easy');
    expect(easy.tag).toBeDefined(); // 兼容旧字段
    const hard = pickForBand(template, 3, createRng(2));
    expect(hard.subtemplateId).toBe('fake-hard-1');
    expect(hard.band).toBe('hard');
  });
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
npx vitest run src/problemTemplates/helpers.test.js
```

期望:`Helpers > pickForBand > 返回结果附带 subtemplateId 与 band` FAIL(`Cannot read properties of undefined (reading 'toMatch')`)。

- [ ] **Step 3: 修改 `pickForBand` 返回 spread + 新字段**

在 `src/problemTemplates/helpers.js` 中,把 `pickForBand` 函数体改为:

```js
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
```

- [ ] **Step 4: 跑测试确认通过**

```bash
npx vitest run src/problemTemplates/helpers.test.js
```

期望:`Helpers` 全绿(包括新断言)。

- [ ] **Step 5: 全量回归**

```bash
npx vitest run
```

期望:837 个测试全过(`pickForBand` 的 spread 不破坏现有断言)。

- [ ] **Step 6: 提交**

```bash
git add src/problemTemplates/helpers.js src/problemTemplates/helpers.test.js
git commit -m "feat(helpers): pickForBand exposes subtemplateId and band"
```

---

## Task 2: 新建 `diversity.js` 共享模块

**Files:**
- Create: `src/problemTemplates/diversity.js`
- Create: `src/problemTemplates/diversity.test.js`
- Modify: `src/composables/useProblemGenerator.js:9-22`(把 `buildComposition` 移过来并从 useProblemGenerator 删)

- [ ] **Step 1: 写失败的测试 — `enumerateSubtypes` / `computeCap` / `pickUnderCap`**

新建 `src/problemTemplates/diversity.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { enumerateSubtypes, computeCap, pickUnderCap, buildComposition } from './diversity.js';

describe('enumerateSubtypes', () => {
  it('flattens application templates for grade 3 into (templateId, subtemplateId, band)', () => {
    const out = enumerateSubtypes('application', '3');
    expect(out.length).toBeGreaterThan(0);
    for (const row of out) {
      expect(row).toHaveProperty('templateId');
      expect(row).toHaveProperty('subtemplateId');
      expect(['easy', 'medium', 'hard']).toContain(row.band);
    }
  });

  it('returns [] for a type with no templates matching grade', () => {
    // 所有 application 模板都在 gradeRange 包含 '3';反向检查不存在的 grade
    // (我们用 '0' 模拟越界值,因为 gradeRange 字段语义就是字符串年級)
    const out = enumerateSubtypes('application', '0');
    expect(out).toEqual([]);
  });
});

describe('computeCap', () => {
  it('基本公式: cap = ceil(shareCount / subtypeCount) + 1', () => {
    expect(computeCap(15, 22)).toBe(Math.ceil(15 / 22) + 1); // = 2
    expect(computeCap(30, 10)).toBe(Math.ceil(30 / 10) + 1); // = 4
    expect(computeCap(0, 5)).toBe(1);
    expect(computeCap(5, 5)).toBe(2);
  });

  it('subtypeCount=0 时返回 Infinity,避免除零', () => {
    expect(computeCap(10, 0)).toBe(Infinity);
  });
});

describe('pickUnderCap', () => {
  const subs = [
    { subtemplateId: 'a' },
    { subtemplateId: 'b' },
    { subtemplateId: 'c' },
  ];

  it('全未用时,从全部中随机选一个(100 次都合法)', () => {
    const usage = new Map();
    for (let i = 0; i < 100; i++) {
      const idx = pickUnderCap(subs, usage, 2);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(3);
    }
  });

  it('部分超额时,只从未满的中选', () => {
    const usage = new Map([['a', 2], ['b', 0], ['c', 1]]); // a 已满
    for (let i = 0; i < 50; i++) {
      const idx = pickUnderCap(subs, usage, 2);
      expect(['b', 'c']).toContain(subs[idx].subtemplateId);
    }
  });

  it('全超额时返回 -1(调用方 retry 兜底)', () => {
    const usage = new Map([['a', 2], ['b', 2], ['c', 2]]);
    expect(pickUnderCap(subs, usage, 2)).toBe(-1);
  });
});

describe('buildComposition', () => {
  it('显式 composition 直接返回', () => {
    const config = {
      problemCount: 10,
      composition: { arithmetic: 2, application: 3, olympiad: 5 },
      questionTypes: ['arithmetic', 'application', 'olympiad'],
    };
    expect(buildComposition(config)).toEqual({ arithmetic: 2, application: 3, olympiad: 5 });
  });

  it('无 composition 时按 questionTypes 平分 problemCount,余数加在第一个 type', () => {
    const config = {
      problemCount: 10,
      questionTypes: ['application', 'olympiad'],
    };
    const out = buildComposition(config);
    expect(out.application).toBe(5);
    expect(out.olympiad).toBe(5);
    expect(out.arithmetic).toBe(0);
  });

  it('problemCount 不能被 type 数整除时,余数进入第一个 type', () => {
    const config = {
      problemCount: 7,
      questionTypes: ['application', 'olympiad'],
    };
    const out = buildComposition(config);
    expect(out.application).toBe(4); // 7/2 = 3, 余 1 → 3+1
    expect(out.olympiad).toBe(3);
  });
});
```

- [ ] **Step 2: 跑测试确认失败(模块未存在)**

```bash
npx vitest run src/problemTemplates/diversity.test.js
```

期望:`Failed to resolve import "./diversity.js"`。

- [ ] **Step 3: 新建 `src/problemTemplates/diversity.js`**

```js
// src/problemTemplates/diversity.js
// 多样化 batch 选择工具 —— 纯函数,无 Vue 依赖,可被 CLI 直接 import。
// 所有"单 batch 内不同 subtype 不要超过 X 次"的逻辑都集中在这里。

import { templatesFor } from './index.js';

/**
 * 列出某 type + grade 下的全部 subtemplate 三元组。
 * @param {'application'|'olympiad'} type
 * @param {string} grade
 * @returns {Array<{templateId: string, subtemplateId: string, band: 'easy'|'medium'|'hard'}>}
 */
export function enumerateSubtypes(type, grade) {
  return templatesFor(type, grade).flatMap(t =>
    t.subtemplates.map(st => ({
      templateId: t.id,
      subtemplateId: st.id,
      band: st.band,
    }))
  );
}

/**
 * 单 batch 内每个 subtype 的硬上限。
 *   cap = ceil(shareCount / subtypeCount) + 1
 * subtypeCount=0 时返回 Infinity(避免下游除零,调用方需先检查 subtype 数)。
 */
export function computeCap(shareCount, subtypeCount) {
  if (subtypeCount === 0) return Infinity;
  return Math.ceil(shareCount / subtypeCount) + 1;
}

/**
 * 给定候选 subtype 列表 + 已用计数 Map,挑一个未超额的下标。
 * 全超额时返回 -1(调用方应保留 retry 循环兜底)。
 */
export function pickUnderCap(subtypes, usageMap, cap) {
  const candidates = [];
  for (let i = 0; i < subtypes.length; i++) {
    const used = usageMap.get(subtypes[i].subtemplateId) || 0;
    if (used < cap) candidates.push(i);
  }
  if (candidates.length === 0) return -1;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * 根据 config 算出 application/arithmetic/olympiad 各占多少题。
 * - 显式 composition 优先(且非全 0)
 * - 否则按 questionTypes 平分 problemCount,余数加在第一个 type
 *
 * 与 useProblemGenerator.js 中的 buildComposition 行为完全一致(同一公式);
 * 这里导出供 scripts/preview-questions.mjs 复用,避免 CLI 重复实现。
 */
export function buildComposition(config) {
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
```

- [ ] **Step 4: 在 `useProblemGenerator.js` 删除内嵌 `buildComposition` 并 import 共享版本**

修改 `src/composables/useProblemGenerator.js`:

1. 文件**顶部 import 区**追加:

```js
import { buildComposition, computeCap } from '../problemTemplates/diversity.js';
```

2. 删除**文件内** `function buildComposition(config) { ... }`(位于第 9-22 行,定义到 `return out; }` 结束),整段替换为无 — 函数已搬到 diversity.js。

确认原代码长这样(将整段删除):

```js
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
```

- [ ] **Step 5: 跑新测试**

```bash
npx vitest run src/problemTemplates/diversity.test.js
```

期望:`diversity.test.js` 全绿(11 个测试)。

- [ ] **Step 6: 全量回归(确认 `buildComposition` 移走没破坏 useProblemGenerator 现有测试)**

```bash
npx vitest run
```

期望:837 个测试全过。

- [ ] **Step 7: 提交**

```bash
git add src/problemTemplates/diversity.js src/problemTemplates/diversity.test.js src/composables/useProblemGenerator.js
git commit -m "feat(templates): extract diversity module + buildComposition for CLI reuse"
```

---

## Task 3: `useProblemGenerator.js` 接入 cap

**Files:**
- Modify: `src/composables/useProblemGenerator.js:34-130`(主循环部分)
- Modify: `src/composables/useProblemGenerator.test.js:80-101`(追加测试)

- [ ] **Step 1: 写失败测试 — 单 batch 内 subtype 不超 cap**

在 `src/composables/useProblemGenerator.test.js` 的 `describe('useProblemGenerator', ...)` 块**末尾**(第 101 行 `});` 之前)追加:

```js
  it('单 batch 内每个 subtemplateId 出现次数 ≤ ceil(N/M) + 1', async () => {
    const { enumerateSubtypes, computeCap } = await import('../problemTemplates/diversity.js');
    const gen = useProblemGenerator();
    const config = {
      grade: '3',
      semester: '上',
      questionTypes: ['application', 'olympiad'],
      difficulty: 'medium',
      problemCount: 30,
      operations: {},
      digits: {},
      termCount: 2,
      useBrackets: false,
      allowRepeatOperators: true,
      knowledgePoints: [],
      composition: { application: 15, olympiad: 15, arithmetic: 0 },
    };
    const problems = await gen.generate(config);
    expect(problems.length).toBe(30);

    const counts = new Map();
    for (const p of problems) {
      if (p.subtemplateId) {
        counts.set(p.subtemplateId, (counts.get(p.subtemplateId) || 0) + 1);
      }
    }
    const M = enumerateSubtypes('application', '3').length + enumerateSubtypes('olympiad', '3').length;
    const cap = computeCap(15, M / 2); // 近似(共享 M,各自 cap 等价)
    for (const [, n] of counts) {
      expect(n).toBeLessThanOrEqual(Math.ceil(30 / M) + 1);
    }
    // sanity: 至少触达 5 个不同 subtype(证明多样化了)
    expect(counts.size).toBeGreaterThanOrEqual(5);
  });
```

- [ ] **Step 2: 跑测试确认失败(目前没有 cap,可能某 subtype 出现 ≥ 5 次)**

```bash
npx vitest run src/composables/useProblemGenerator.test.js
```

期望:新增断言 FAIL(很可能 `expect(n).toBeLessThanOrEqual(...)` 失败)。

- [ ] **Step 3: 在 `useProblemGenerator.js` 引入 cap 逻辑**

修改 `src/composables/useProblemGenerator.js`:

1. import 区**追加** `enumerateSubtypes`:

```js
import { buildComposition, computeCap, enumerateSubtypes } from '../problemTemplates/diversity.js';
```

2. 在 `async function generate(config)` 内,**`const composition = buildComposition(config);`** 这一行之后**插入**以下块:

```js
    // === 多样化 dedup:预计算 cap 与使用计数 ===
    const appSubtypes = enumerateSubtypes('application', config.grade);
    const olySubtypes = enumerateSubtypes('olympiad', config.grade);
    const appCap = computeCap(composition.application || 0, appSubtypes.length);
    const olyCap = computeCap(composition.olympiad || 0, olySubtypes.length);
    const usage = {
      application: new Map(),  // subtemplateId -> count
      olympiad: new Map(),
    };
    const capFor = (type) => (type === 'application' ? appCap : olyCap);
    // === 插入结束 ===
```

3. 在主循环 `while (produced < needFromLive && attempts < needFromLive * 20) {` 内,**找到 `if (seen.has(p.question)) continue;` 这一行**,在它**后面**追加:

```js
          // 多样化 dedup:仅 application/olympiad(arithmetic 不走模板)
          if ((type === 'application' || type === 'olympiad') && p.subtemplateId) {
            const cap = capFor(type);
            const used = usage[type].get(p.subtemplateId) || 0;
            if (used >= cap) continue;  // 超额,跳过,继续 retry
            usage[type].set(p.subtemplateId, used + 1);
          }
```

4. **找到 `results.push({` 这一段**,把它替换为:

```js
          seen.add(p.question);
          const result = {
            type,
            subtype: p.subtype,
            question: p.question,
            answer: p.answer,
            payload: p.payload || {},
          };
          if (p.subtemplateId) result.subtemplateId = p.subtemplateId;
          if (p.band) result.band = p.band;
          results.push(result);
```

(原 `results.push({ type, subtype: p.subtype, ... })` 的旧版本完整替换为上面这段。)

- [ ] **Step 4: 跑新测试 + 全量**

```bash
npx vitest run src/composables/useProblemGenerator.test.js
npx vitest run
```

期望:新断言 PASS,837 + 1 全过。

- [ ] **Step 5: 提交**

```bash
git add src/composables/useProblemGenerator.js src/composables/useProblemGenerator.test.js
git commit -m "feat(generator): cap per-subtype usage within a batch for diverse output"
```

---

## Task 4: CLI 脚本 `scripts/preview-questions.mjs`

**Files:**
- Create: `scripts/preview-questions.mjs`

- [ ] **Step 1: 新建文件骨架(只做参数解析 + 占位输出)**

```js
#!/usr/bin/env node
/**
 * 多样化题目预览 CLI
 * 跑法:
 *   node scripts/preview-questions.mjs [--count=25] [--grade=3] [--difficulty=medium]
 *                                      [--type=both] [--seed=N]
 *
 * 按模板分组打印 N 道应用题/奥数题,展示类型覆盖情况。
 */

const ARGS = parseArgs(process.argv.slice(2));

function parseArgs(argv) {
  const out = {
    count: 25,
    grade: '3',
    difficulty: 'medium',
    type: 'both',
    seed: Date.now(),
  };
  for (const a of argv) {
    if (a === '--help') { printHelp(); process.exit(0); }
    const m = a.match(/^--(\w+)=(.+)$/);
    if (!m) continue;
    const [, k, v] = m;
    if (k === 'count') out.count = Math.max(1, parseInt(v, 10) || 25);
    else if (k === 'grade') out.grade = String(v);
    else if (k === 'difficulty') out.difficulty = v;
    else if (k === 'type') out.type = v;
    else if (k === 'seed') out.seed = parseInt(v, 10) || Date.now();
  }
  return out;
}

function printHelp() {
  console.log(`用法: node scripts/preview-questions.mjs [options]

选项:
  --count=N               总题数(默认 25)
  --grade=N               年级 1-6(默认 3)
  --difficulty=easy|medium|hard(默认 medium)
  --type=application|olympiad|both(默认 both)
  --seed=N                固定随机种子(默认 Date.now())
  --help                  打印此帮助`);
}

console.log('(占位) 参数解析 OK:', ARGS);
```

- [ ] **Step 2: 验证骨架可运行**

```bash
node scripts/preview-questions.mjs --count=10 --grade=3 --seed=42
```

期望输出:`(占位) 参数解析 OK: { count: 10, grade: '3', difficulty: 'medium', type: 'both', seed: 42 }`

- [ ] **Step 3: 实现主循环 — 复用生产端 dedup 逻辑**

把 `scripts/preview-questions.mjs` 整个文件**替换**为:

```js
#!/usr/bin/env node
/**
 * 多样化题目预览 CLI
 * 跑法:
 *   node scripts/preview-questions.mjs [--count=25] [--grade=3] [--difficulty=medium]
 *                                      [--type=both] [--seed=N]
 *
 * 按模板分组打印 N 道应用题/奥数题,展示类型覆盖情况。
 */

import { createRng } from '../src/utils/rng.js';
import { ApplicationStrategy } from '../src/strategies/ApplicationStrategy.js';
import { OlympiadStrategy } from '../src/strategies/OlympiadStrategy.js';
import {
  buildComposition,
  enumerateSubtypes,
  computeCap,
} from '../src/problemTemplates/diversity.js';

const ARGS = parseArgs(process.argv.slice(2));

function parseArgs(argv) {
  const out = {
    count: 25,
    grade: '3',
    difficulty: 'medium',
    type: 'both',
    seed: Date.now(),
  };
  for (const a of argv) {
    if (a === '--help') { printHelp(); process.exit(0); }
    const m = a.match(/^--(\w+)=(.+)$/);
    if (!m) continue;
    const [, k, v] = m;
    if (k === 'count') out.count = Math.max(1, parseInt(v, 10) || 25);
    else if (k === 'grade') out.grade = String(v);
    else if (k === 'difficulty') out.difficulty = v;
    else if (k === 'type') out.type = v;
    else if (k === 'seed') out.seed = parseInt(v, 10) || Date.now();
  }
  return out;
}

function printHelp() {
  console.log(`用法: node scripts/preview-questions.mjs [options]

选项:
  --count=N               总题数(默认 25)
  --grade=N               年级 1-6(默认 3)
  --difficulty=easy|medium|hard(默认 medium)
  --type=application|olympiad|both(默认 both)
  --seed=N                固定随机种子(默认 Date.now())
  --help                  打印此帮助`);
}

// ---------- 主循环(复用生产端 dedup 思路) ----------

const config = {
  grade: ARGS.grade,
  semester: '上',
  questionTypes: ARGS.type === 'application' ? ['application']
                : ARGS.type === 'olympiad' ? ['olympiad']
                : ['application', 'olympiad'],
  problemCount: ARGS.count,
  difficulty: ARGS.difficulty,
  operations: {},
  digits: {},
  termCount: 2,
  useBrackets: false,
  allowRepeatOperators: true,
  knowledgePoints: [],
};
const composition = buildComposition(config);

const appSubtypes = enumerateSubtypes('application', ARGS.grade);
const olySubtypes = enumerateSubtypes('olympiad', ARGS.grade);
const appCap = computeCap(composition.application || 0, appSubtypes.length);
const olyCap = computeCap(composition.olympiad || 0, olySubtypes.length);
const usage = { application: new Map(), olympiad: new Map() };
const capFor = (t) => (t === 'application' ? appCap : olyCap);

const rng = createRng(ARGS.seed);
const results = [];
const STRATEGY = { application: ApplicationStrategy, olympiad: OlympiadStrategy };

for (const [type, count] of Object.entries(composition)) {
  if (!count || count <= 0) continue;
  if (!STRATEGY[type]) continue; // arithmetic 跳过
  const strategy = new STRATEGY[type]({ ...config, problemType: 'result' });
  let produced = 0;
  let attempts = 0;
  while (produced < count && attempts < count * 20) {
    attempts++;
    let p;
    try {
      p = strategy.generate(rng);
    } catch {
      continue;
    }
    if (!p) continue;
    if (!p.subtemplateId) continue;
    const cap = capFor(type);
    const used = usage[type].get(p.subtemplateId) || 0;
    if (used >= cap) continue;
    usage[type].set(p.subtemplateId, used + 1);
    results.push({ type, ...p });
    produced++;
  }
}

// ---------- 输出 ----------

const truncate = (s, n = 30) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

const header = `应用题 + 奥数题 多样化预览
年级: ${ARGS.grade} 年级  难度: ${ARGS.difficulty}  题数: ${ARGS.count}  种子: ${ARGS.seed}`;
console.log('═'.repeat(Math.max(60, header.length + 4)));
console.log(header);
console.log('═'.repeat(Math.max(60, header.length + 4)));
console.log();

for (const type of ['application', 'olympiad']) {
  const subset = results.filter((r) => r.type === type);
  if (subset.length === 0) continue;
  const allSubs = type === 'application' ? appSubtypes : olySubtypes;
  const touched = new Set(subset.map((r) => r.subtemplateId));
  const label = type === 'application' ? '应用题' : '奥数题';
  console.log(`[${label}]  共 ${subset.length} 题,触达 ${touched.size} 个 subtype(共 ${allSubs.length} 个可用)`);
  console.log('─'.repeat(64));
  console.log(`   #  subtemplateId${' '.repeat(15)}band     题面`);
  subset.forEach((p, i) => {
    const n = String(i + 1).padStart(3, ' ');
    const id = p.subtemplateId.padEnd(28, ' ');
    const band = String(p.band || '').padEnd(7, ' ');
    console.log(`  ${n}  ${id}  ${band}  ${truncate(p.question)}`);
  });
  console.log('─'.repeat(64));
  console.log();
}

const totalTouched = new Set(results.filter((r) => r.subtemplateId).map((r) => r.subtemplateId)).size;
const maxSeen = Math.max(0, ...[...usage.application.values(), ...usage.olympiad.values()]);
console.log('摘要');
console.log(`  · 共触达 ${totalTouched} 个不同 subtype`);
console.log(`  · 单 subtype 最多出现 ${maxSeen} 次`);
console.log('═'.repeat(64));
```

- [ ] **Step 4: 跑脚本验证**

```bash
node scripts/preview-questions.mjs --count=25 --grade=3 --difficulty=medium --seed=42
```

期望输出形如:

```
════════════════════════════════════════════════════════════════
应用题 + 奥数题 多样化预览
年级: 3 年级  难度: medium  题数: 25  种子: 42
════════════════════════════════════════════════════════════════

[应用题]  共 N 题,触达 M 个 subtype(...)
────────────────────────────────────────────────────────────────
   #  subtemplateId                band    题面
    1  shopping-total-price        easy    小明买了3个铅笔...
    ...
────────────────────────────────────────────────────────────────

[奥数题]  共 K 题,触达 J 个 subtype(...)
────────────────────────────────────────────────────────────────
   ...
────────────────────────────────────────────────────────────────

摘要
  · 共触达 X 个不同 subtype
  · 单 subtype 最多出现 Y 次
════════════════════════════════════════════════════════════════
```

- [ ] **Step 5: 验证 `--type=olympiad` 单类输出**

```bash
node scripts/preview-questions.mjs --count=10 --grade=4 --difficulty=hard --type=olympiad --seed=7
```

期望:只显示 `[奥数题]` 块,`[应用题]` 块不出现。

- [ ] **Step 6: 提交**

```bash
git add scripts/preview-questions.mjs
git commit -m "feat(scripts): preview-questions CLI for diverse batch audit"
```

---

## Task 5: `package.json` 加 npm script + 终极烟测

**Files:**
- Modify: `package.json:6-15`

- [ ] **Step 1: 加 `"preview:questions"` script**

修改 `package.json` 的 `"scripts"` 块(在 `"build:library"` 之后、`"preview"` 之前追加):

```jsonc
    "preview:questions": "node scripts/preview-questions.mjs",
```

最终 `"scripts"` 块看起来像:

```jsonc
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 5000",
    "build": "vite build && cp .nojekyll dist/",
    "build:library": "node scripts/build-library.mjs",
    "preview:questions": "node scripts/preview-questions.mjs",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  },
```

- [ ] **Step 2: 跑 npm script 烟测**

```bash
npm run preview:questions -- --count=20 --grade=3 --seed=100
```

期望:脚本通过 npm 启动,输出符合 §6.2 格式(任务 4 step 4)。

- [ ] **Step 3: 跑全量测试**

```bash
npm run test:run
```

期望:全绿。

- [ ] **Step 4: 跑生产构建**

```bash
npm run build
```

期望:`vite build` 通过(产物在 `dist/`)。

- [ ] **Step 5: 提交**

```bash
git add package.json
git commit -m "chore: add npm script preview:questions"
```

---

## Self-Review

**1. Spec coverage:** spec §1.2 目标 G1–G4 → Task 1 (字段透出) + Task 2 (共享模块) + Task 3 (cap 接入) + Task 4 (CLI) + Task 5 (npm script)。spec §3 数据契约 → Task 1 step 3。spec §4 diversity.js → Task 2 step 3。spec §5 接入 useProblemGenerator → Task 3 step 3。spec §6 CLI → Task 4 step 3。spec §7 测试计划 → 每个 task 的 step 1。

**2. Placeholder scan:** 全文无 TBD/TODO/"implement later"/"add appropriate error handling"。

**3. Type consistency:**
   - `enumerateSubtypes` 返回 `{templateId, subtemplateId, band}` — Task 2 step 1 测试断言一致,Task 2 step 3 实现一致。
   - `computeCap(shareCount, subtypeCount)` — Task 2 内部一致,Task 3 step 1 测试也用此签名。
   - `pickUnderCap(subtypes, usageMap, cap)` — Task 2 一致。
   - `buildComposition(config)` — Task 2 step 3 与原 useProblemGenerator.js 的公式逐字符一致。
   - `pickForBand` 返回 `{...result, subtemplateId, band}` — Task 1 step 3 与 spec §3.1 一致。
   - Task 3 step 3 改动 useProblemGenerator 时引用 `p.subtemplateId` / `p.band`,与 pickForBand 返回字段名一致。
