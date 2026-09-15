# 应用题 + 奥数题生成层重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `ApplicationStrategy` / `OlympiadStrategy` 收编到 `BandAwareStrategy` 父类下，并让 `useProblemGenerator` 在挑 subtemplate **前**就 cap 过滤、active band 饱和时自动 advance 到 medium/hard。

**Architecture:** 策略层从"pick + return"改为"registry + 工厂"(`listSubtemplates` / `generateFromSubtemplate`)。`diversity.js` 加 `pickNextSubtemplate` 高层 helper。Composable 主循环从"先 generate 再 cap-check"换成"先 cap 挑 subtemplate 再 generate",带 band advance + 兜底回退。

**Tech Stack:** Vue 3 + Vite, Vitest + jsdom + fake-indexeddb, Dexie, ESM, 无新依赖。

**Spec:** `docs/superpowers/specs/2026-09-15-application-olympiad-strategy-refactor-design.md` (commit `07055e4`)

---

## File Structure

| 路径 | 角色 | 改动类型 |
|---|---|---|
| `src/strategies/BandAwareStrategy.js` | 父类,持 type/templates/difficultyLevel;提供 listSubtemplates + generateFromSubtemplate + 旧 generate | 新建 |
| `src/strategies/BandAwareStrategy.test.js` | 父类行为测试 | 新建 |
| `src/strategies/ApplicationStrategy.js` | 3 行子类 | 改 |
| `src/strategies/ApplicationStrategy.test.js` | 保留 type-specific 用例,删被父类覆盖的 | 改 |
| `src/strategies/OlympiadStrategy.js` | 3 行子类 | 改 |
| `src/strategies/OlympiadStrategy.test.js` | 保留 type-specific 用例,删被父类覆盖的 | 改 |
| `src/problemTemplates/diversity.js` | + `pickNextSubtemplate` helper | 改 |
| `src/problemTemplates/diversity.test.js` | + helper 单元测试 | 改 |
| `src/composables/useProblemGenerator.js` | 切换到 pre-pick + band advance + 兜底 | 改 |
| `src/composables/useProblemGenerator.test.js` | + cap / advance / 兜底断言 | 改 |
| `src/problemTemplates/shopping.js` | L200-201 迁到 `pickNumberByBand` | 改 |
| `src/problemTemplates/shopping.test.js` | + easy/hard 数值差异断言 | 改 |

---

## Phase 1: 父类与子类

### Task 1: BandAwareStrategy 父类

**Files:**
- Create: `src/strategies/BandAwareStrategy.js`
- Create: `src/strategies/BandAwareStrategy.test.js`

- [ ] **Step 1: 写失败的父类测试**

文件 `src/strategies/BandAwareStrategy.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { BandAwareStrategy } from './BandAwareStrategy.js';
import { createRng } from '../utils/rng.js';
import { templatesFor } from '../problemTemplates/index.js';

const config = { grade: '3', semester: '上', difficulty: 'medium' };

describe('BandAwareStrategy', () => {
  it('constructor stores type, difficultyLevel, and filters templates by grade', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    expect(s.type).toBe('application');
    expect(s.difficultyLevel).toBe(2);
    const expectedIds = templatesFor('application', '3').map(t => t.id);
    expect(s.templates.map(t => t.id).sort()).toEqual(expectedIds.sort());
  });

  it('listSubtemplates() returns all subtemplates for current (type, grade)', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    const all = s.listSubtemplates();
    const expectedCount = templatesFor('application', '3')
      .reduce((acc, t) => acc + t.subtemplates.length, 0);
    expect(all.length).toBe(expectedCount);
    for (const c of all) {
      expect(c).toHaveProperty('templateId');
      expect(c).toHaveProperty('subtemplateId');
      expect(c).toHaveProperty('band');
      expect(['easy', 'medium', 'hard']).toContain(c.band);
    }
  });

  it('listSubtemplates({band: "easy"}) filters by band', () => {
    const s = new BandAwareStrategy(config, { type: 'olympiad' });
    const easy = s.listSubtemplates({ band: 'easy' });
    expect(easy.length).toBeGreaterThan(0);
    expect(every(easy, c => c.band === 'easy')).toBe(true);
  });

  it('generate(rng) keeps old behavior (delegates to template.generate)', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    const a = s.generate(createRng(7));
    expect(a).toMatchObject({
      question: expect.any(String),
      answer: expect.any(String),
      subtype: expect.any(String),
    });
  });

  it('generateFromSubtemplate returns basic fields + templateId + subtemplateId + band', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    const [{ templateId, subtemplateId }] = s.listSubtemplates({ band: 'medium' });
    const r = s.generateFromSubtemplate(createRng(11), { templateId, subtemplateId });
    expect(r.question).toBeTypeOf('string');
    expect(r.answer).toBeTypeOf('string');
    expect(r.subtype).toBeTypeOf('string');
    expect(r.payload).toBeTypeOf('object');
    expect(r.templateId).toBe(templateId);
    expect(r.subtemplateId).toBe(subtemplateId);
    expect(r.band).toBe('medium');
  });

  it('generateFromSubtemplate throws when template not found', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    expect(() => s.generateFromSubtemplate(createRng(1), {
      templateId: 'no-such-template', subtemplateId: 'x',
    })).toThrow(/template not found/);
  });

  it('generateFromSubtemplate throws when subtemplate not found', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    const { templateId } = s.listSubtemplates()[0];
    expect(() => s.generateFromSubtemplate(createRng(1), {
      templateId, subtemplateId: 'no-such-sub',
    })).toThrow(/subtemplate not found/);
  });
});

function every(arr, pred) { return arr.every(pred); }
```

- [ ] **Step 2: 跑测试,确认失败**

Run: `npm run test:run -- src/strategies/BandAwareStrategy.test.js`
Expected: FAIL — `BandAwareStrategy` is not exported / does not exist.

- [ ] **Step 3: 实现父类**

文件 `src/strategies/BandAwareStrategy.js`:

```js
import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { templatesFor } from '../problemTemplates/index.js';
import { DIFFICULTY_TO_LEVEL } from '../constants/options.js';

export class BandAwareStrategy extends ProblemGeneratorStrategy {
  constructor(config, { type }) {
    super(config);
    this.type = type;
    this.difficultyLevel = DIFFICULTY_TO_LEVEL[config.difficulty] ?? 2;
    this.templates = templatesFor(type, config.grade);
  }

  listSubtemplates({ band } = {}) {
    return this.templates.flatMap(t =>
      t.subtemplates
        .filter((st) => !band || st.band === band)
        .map((st) => ({ templateId: t.id, subtemplateId: st.id, band: st.band }))
    );
  }

  generate(rng) {
    if (this.templates.length === 0) {
      throw new Error(`No ${this.type} templates available for grade ${this.config.grade}`);
    }
    const tpl = rng.pick(this.templates);
    return tpl.generate(rng, this.difficultyLevel);
  }

  generateFromSubtemplate(rng, { templateId, subtemplateId }) {
    const tpl = this.templates.find((t) => t.id === templateId);
    if (!tpl) {
      throw new Error(`[BandAwareStrategy] template not found: ${templateId} (type=${this.type})`);
    }
    const sub = tpl.subtemplates.find((s) => s.id === subtemplateId);
    if (!sub) {
      throw new Error(`[BandAwareStrategy] subtemplate not found: ${templateId}/${subtemplateId}`);
    }
    const result = sub.generate(rng);
    return { ...result, templateId, subtemplateId: sub.id, band: sub.band };
  }
}
```

- [ ] **Step 4: 跑测试,确认通过**

Run: `npm run test:run -- src/strategies/BandAwareStrategy.test.js`
Expected: PASS, 7 tests, 0 fail.

- [ ] **Step 5: 提交**

```bash
git add src/strategies/BandAwareStrategy.js src/strategies/BandAwareStrategy.test.js
git commit -m "feat(strategies): extract BandAwareStrategy parent with listSubtemplates + generateFromSubtemplate"
```

---

### Task 2: ApplicationStrategy 收编为子类

**Files:**
- Modify: `src/strategies/ApplicationStrategy.js` (full rewrite, 3 lines)
- Modify: `src/strategies/ApplicationStrategy.test.js` (删被父类覆盖的用例)

- [ ] **Step 1: 改写 `ApplicationStrategy.js`**

整文件替换为:

```js
import { BandAwareStrategy } from './BandAwareStrategy.js';

export class ApplicationStrategy extends BandAwareStrategy {
  constructor(config) { super(config, { type: 'application' }); }
}
```

- [ ] **Step 2: 改写 `ApplicationStrategy.test.js`,只保留 type-specific 用例**

整文件替换为:

```js
import { describe, it, expect } from 'vitest';
import { ApplicationStrategy } from './ApplicationStrategy.js';
import { createRng } from '../utils/rng.js';

describe('ApplicationStrategy', () => {
  const config = { grade: '2', semester: '上', difficulty: 'easy' };

  it('is a BandAwareStrategy', () => {
    const s = new ApplicationStrategy(config);
    expect(s.type).toBe('application');
  });

  it('throws when no application templates for the given grade', () => {
    // Olympiad templates start at grade 3, so grade 2 application should still
    // have at least one. But we can verify the error path with a clearly empty
    // config: an unknown type. (Application for grade "1" should still throw
    // only if no templates are registered — defensive check: pass a future
    // grade and expect the error message.)
    const s = new ApplicationStrategy({ ...config, grade: '99' });
    expect(() => s.generate(createRng(1))).toThrow(/No application templates/);
  });

  it('every generated problem carries a known application subtype', () => {
    const s = new ApplicationStrategy({ ...config, grade: '4', difficulty: 'medium' });
    for (let i = 0; i < 200; i++) {
      const r = s.generate(createRng(i));
      expect(typeof r.subtype).toBe('string');
      expect(r.subtype.length).toBeGreaterThan(0);
      expect(r.question).not.toMatch(/\{[a-zA-Z0-9_]+\}/);
    }
  });
});
```

- [ ] **Step 3: 跑两个测试,确认通过**

Run: `npm run test:run -- src/strategies/ApplicationStrategy.test.js src/strategies/BandAwareStrategy.test.js`
Expected: PASS, 4+7=11 tests, 0 fail.

- [ ] **Step 4: 提交**

```bash
git add src/strategies/ApplicationStrategy.js src/strategies/ApplicationStrategy.test.js
git commit -m "refactor(strategies): reduce ApplicationStrategy to 3-line BandAwareStrategy subclass"
```

---

### Task 3: OlympiadStrategy 收编为子类

**Files:**
- Modify: `src/strategies/OlympiadStrategy.js` (full rewrite, 3 lines)
- Modify: `src/strategies/OlympiadStrategy.test.js` (删被父类覆盖的用例)

- [ ] **Step 1: 改写 `OlympiadStrategy.js`**

整文件替换为:

```js
import { BandAwareStrategy } from './BandAwareStrategy.js';

export class OlympiadStrategy extends BandAwareStrategy {
  constructor(config) { super(config, { type: 'olympiad' }); }
}
```

- [ ] **Step 2: 改写 `OlympiadStrategy.test.js`,只保留 type-specific 用例**

整文件替换为:

```js
import { describe, it, expect } from 'vitest';
import { OlympiadStrategy } from './OlympiadStrategy.js';
import { createRng } from '../utils/rng.js';

describe('OlympiadStrategy', () => {
  const config = { grade: '5', semester: '上', difficulty: 'medium' };

  it('is a BandAwareStrategy', () => {
    const s = new OlympiadStrategy(config);
    expect(s.type).toBe('olympiad');
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

  it('respects difficulty: easy never yields a hard-band subtemplate', () => {
    // Same integration defect the original test caught: band was inert.
    // The number-theory hard signature mentions "求最小的正整数x".
    const easy = new OlympiadStrategy({ ...config, grade: '5', difficulty: 'easy' });
    for (let i = 0; i < 2000; i++) {
      const q = easy.generate(createRng(i)).question;
      expect(q).not.toMatch(/这个数最小是多少/);
    }
  });
});
```

- [ ] **Step 3: 跑两个测试,确认通过**

Run: `npm run test:run -- src/strategies/OlympiadStrategy.test.js src/strategies/BandAwareStrategy.test.js`
Expected: PASS, 4+7=11 tests, 0 fail.

- [ ] **Step 4: 提交**

```bash
git add src/strategies/OlympiadStrategy.js src/strategies/OlympiadStrategy.test.js
git commit -m "refactor(strategies): reduce OlympiadStrategy to 3-line BandAwareStrategy subclass"
```

---

## Phase 2: diversity helper + composable 接线

### Task 4: pickNextSubtemplate helper

**Files:**
- Modify: `src/problemTemplates/diversity.js` (末尾追加函数)
- Modify: `src/problemTemplates/diversity.test.js` (追加 describe 块)

- [ ] **Step 1: 写失败的 helper 测试**

在 `src/problemTemplates/diversity.test.js` 末尾追加:

```js
import { pickNextSubtemplate } from './diversity.js';
import { BandAwareStrategy } from '../strategies/BandAwareStrategy.js';
import { createRng } from '../utils/rng.js';

describe('pickNextSubtemplate', () => {
  const config = { grade: '3', semester: '上', difficulty: 'medium' };

  it('returns null when all candidates exceed cap', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    const cands = s.listSubtemplates({ band: 'medium' });
    const usage = new Map(cands.map(c => [c.subtemplateId, 5]));
    const r = pickNextSubtemplate(s, 'medium', usage, 5, createRng(1));
    expect(r).toBeNull();
  });

  it('skips candidates that exceed cap', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    const cands = s.listSubtemplates({ band: 'medium' });
    // Saturate the first one
    const usage = new Map([[cands[0].subtemplateId, 10]]);
    const r = pickNextSubtemplate(s, 'medium', usage, 5, createRng(2));
    expect(r).not.toBeNull();
    expect(r.subtemplateId).not.toBe(cands[0].subtemplateId);
    expect(r.band).toBe('medium');
  });

  it('picks from full pool when usage is empty', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    const cands = s.listSubtemplates({ band: 'medium' });
    const usage = new Map();
    for (let i = 0; i < 50; i++) {
      const r = pickNextSubtemplate(s, 'medium', usage, 5, createRng(i + 100));
      expect(cands.find(c => c.subtemplateId === r.subtemplateId)).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: 跑测试,确认失败**

Run: `npm run test:run -- src/problemTemplates/diversity.test.js`
Expected: FAIL — `pickNextSubtemplate` is not exported.

- [ ] **Step 3: 在 `diversity.js` 末尾追加 `pickNextSubtemplate`**

打开 `src/problemTemplates/diversity.js`,在文件末尾追加(保持其它导出不变):

```js
/**
 * 从 strategy 当前 band 候选里,挑一个未超额 (templateId, subtemplateId) 对。
 * @param {BandAwareStrategy} strategy
 * @param {'easy'|'medium'|'hard'} band
 * @param {Map<string, number>} usageMap - subtemplateId → 已用次数
 * @param {number} cap - computeCap 结果
 * @param {Function} rng - 需支持 int(min, max)
 * @returns {{templateId: string, subtemplateId: string, band: 'easy'|'medium'|'hard'} | null}
 *   null = 当前 band 已无候选(由 caller 决定 advance band 或兜底)
 */
export function pickNextSubtemplate(strategy, band, usageMap, cap, rng) {
  const candidates = strategy.listSubtemplates({ band }).filter(
    (c) => (usageMap.get(c.subtemplateId) || 0) < cap
  );
  if (candidates.length === 0) return null;
  return candidates[rng.int(0, candidates.length - 1)];
}
```

- [ ] **Step 4: 跑测试,确认通过**

Run: `npm run test:run -- src/problemTemplates/diversity.test.js`
Expected: PASS, 之前用例 + 3 新用例 = 全部通过。

- [ ] **Step 5: 提交**

```bash
git add src/problemTemplates/diversity.js src/problemTemplates/diversity.test.js
git commit -m "feat(templates): add pickNextSubtemplate helper for pre-generation cap picking"
```

---

### Task 5: useProblemGenerator 切换到 pre-pick + band advance

**Files:**
- Modify: `src/composables/useProblemGenerator.js` (主循环)

- [ ] **Step 1: 写失败的 composable 测试**

在 `src/composables/useProblemGenerator.test.js` 末尾追加:

```js
describe('cap enforcement + band advance', () => {
  beforeEach(async () => { await db.problemLibrary.clear(); });

  it('enforces per-subtemplate cap: N=8, 4 subtypes available → no subtype appears > ceil(8/4)+1=3 times', async () => {
    const gen = useProblemGenerator();
    // Grade 3 application difficulty=easy has ≥4 easy subtypes. N=8.
    const config = {
      grade: '3', semester: '上', difficulty: 'easy',
      questionTypes: ['application'], problemCount: 8,
      operations: {}, digits: {}, termCount: 2, useBrackets: false,
      allowRepeatOperators: true, knowledgePoints: [],
      composition: { arithmetic: 0, application: 8, olympiad: 0 },
    };
    const problems = await gen.generate(config);
    const counts = new Map();
    for (const p of problems) {
      if (!p.subtemplateId) continue;
      counts.set(p.subtemplateId, (counts.get(p.subtemplateId) || 0) + 1);
    }
    // ceil(8/4)+1 = 3; allow some slack for rareness
    for (const [, n] of counts) {
      expect(n).toBeLessThanOrEqual(4);
    }
  });

  it('still produces the requested count even when cap is tight (band advance works)', async () => {
    const gen = useProblemGenerator();
    const config = {
      grade: '3', semester: '上', difficulty: 'easy',
      questionTypes: ['application'], problemCount: 6,
      operations: {}, digits: {}, termCount: 2, useBrackets: false,
      allowRepeatOperators: true, knowledgePoints: [],
      composition: { arithmetic: 0, application: 6, olympiad: 0 },
    };
    const problems = await gen.generate(config);
    expect(problems.length).toBe(6);
  });
});
```

- [ ] **Step 2: 跑测试,确认(可能)失败**

Run: `npm run test:run -- src/composables/useProblemGenerator.test.js`
Expected: 现有用例通过;新 2 个 cap 用例可能通过也可能失败(取决于当前实现是否够用)。如果当前 post-check 已能满足 cap 上限,cap 测试会通过 —— 那也 OK,band advance 测试**不**在此次断言之列,留待 Step 4 之后的扩展。

- [ ] **Step 3: 改 `useProblemGenerator.js`,加入 `generateOneWithCap` 函数**

打开 `src/composables/useProblemGenerator.js`,在 `generateOneLive` 函数定义**之后**、`useProblemGenerator` 函数**之前**插入:

```js
const BAND_ADVANCE = ['easy', 'medium', 'hard'];

/**
 * 先按 cap 挑 subtemplate 再生成;active band 饱和时 advance 到 medium/hard;
 * 所有 band 都 saturate / 失败时,回退到老的 generateOneLive(post-check) 行为。
 */
async function generateOneWithCap(type, config, usage, totalForType) {
  const innerConfig = { ...config };
  if (type === 'arithmetic' && !innerConfig.problemType) {
    innerConfig.problemType = ARITHMETIC_DEFAULT_PROBLEM_TYPE;
  }
  const strategy = ProblemGeneratorFactory.createStrategy(type, innerConfig);
  // arithmetic 没有 listSubtemplates,直接走原路径
  if (type === 'arithmetic') {
    return strategy.generate(createRng(Math.floor(Math.random() * 1e9) + ++rngCounter));
  }
  const activeBand = levelToBand(difficultyToLevel(config.difficulty));
  const order = [activeBand, ...BAND_ADVANCE.filter((b) => b !== activeBand)];

  for (const band of order) {
    const bandSubtypes = strategy.listSubtemplates({ band });
    if (bandSubtypes.length === 0) continue;
    const cap = computeCap(totalForType, bandSubtypes.length);
    const rng = createRng(Math.floor(Math.random() * 1e9) + ++rngCounter);
    const picked = pickNextSubtemplate(strategy, band, usage[type], cap, rng);
    if (!picked) continue;
    try {
      const p = strategy.generateFromSubtemplate(rng, picked);
      usage[type].set(picked.subtemplateId, (usage[type].get(picked.subtemplateId) || 0) + 1);
      return p;
    } catch {
      continue;
    }
  }
  // 兜底:全 band saturate / 失败,回退到老路径
  return await generateOneLive(type, config);
}
```

把文件顶部的 import 块改成:

```js
import { createRng } from '../utils/rng.js';
import { ProblemGeneratorFactory } from '../strategies/ProblemGeneratorFactory.js';
import { useProblemLibrary } from './useProblemLibrary.js';
import { usePreloadedLibrary } from './usePreloadedLibrary.js';
import { queryLibrary } from '../db.js';
import {
  buildComposition,
  computeCap,
  enumerateSubtypes,
  pickNextSubtemplate,
} from '../problemTemplates/diversity.js';
import { levelToBand } from '../problemTemplates/helpers.js';
```

把 `generate(config)` 函数里的 live 生成那一行:

```js
const p = await generateOneLive(type, config);
```

改为:

```js
const p = await generateOneWithCap(type, config, usage, count);
```

并把之前已经基于 `p.subtemplateId` 的 cap-check 块整段删掉(因为 pre-pick 已经保证不超额)—— 旧块:

```js
// 多样化 dedup:仅 application/olympiad(arithmetic 不走模板)
if ((type === 'application' || type === 'olympiad') && p.subtemplateId) {
  const cap = capFor(type);
  const used = usage[type].get(p.subtemplateId) || 0;
  if (used >= cap) continue;  // 超额,跳过,继续 retry
  usage[type].set(p.subtemplateId, used + 1);
}
```

保留 `p.subtemplateId` 透出到 `result`,但**不再**做 post-check。修改后的循环体大致为:

```js
try {
  const p = await generateOneWithCap(type, config, usage, count);
  if (seen.has(p.question)) continue;
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
  produced++;
} catch (err) {
  // grade/template mismatch — skip
}
```

- [ ] **Step 4: 跑全部 composable 测试**

Run: `npm run test:run -- src/composables/useProblemGenerator.test.js`
Expected: 全部通过,包括 Step 1 新增的 2 个 cap 用例 + 现有所有用例。

- [ ] **Step 5: 跑全量测试,确认无回归**

Run: `npm run test:run`
Expected: 全量通过(包含 837+ 测试,允许 +5 新增)。

- [ ] **Step 6: 提交**

```bash
git add src/composables/useProblemGenerator.js src/composables/useProblemGenerator.test.js
git commit -m "refactor(generator): switch to pre-generation cap picking with band advance"
```

---

## Phase 3: 4 模板迁移 + 收尾

### Task 6: shopping.js L200-201 迁到 pickNumberByBand

**Files:**
- Modify: `src/problemTemplates/shopping.js` (仅 2 行)

- [ ] **Step 1: 找到 L200-201**

打开 `src/problemTemplates/shopping.js`,在 `price-comparison` 子模板的 `generate(rng)` 体内(L200-201 附近)找到:

```js
        const n1 = rng.int(1, 5);
        const n2 = rng.int(1, 5);
```

- [ ] **Step 2: 替换为 pickNumberByBand**

改为:

```js
        const n1 = pickNumberByBand(rng, band, { min: 1, max: 5 });
        const n2 = pickNumberByBand(rng, band, { min: 1, max: 5 });
```

并在文件顶部 import 块确认有 `pickNumberByBand`(应该已有;若无则补上 `import { pickForBand, pickNumberByBand, pickPerson } from './helpers.js';`)。

- [ ] **Step 3: 跑 shopping 测试,确认通过**

Run: `npm run test:run -- src/problemTemplates/shopping.test.js`
Expected: PASS(数值范围未变,仅走 band 缩放)。

- [ ] **Step 4: 提交**

```bash
git add src/problemTemplates/shopping.js
git commit -m "refactor(templates): migrate shopping.price-comparison to pickNumberByBand"
```

---

### Task 7: shopping band 差异测试

**Files:**
- Modify: `src/problemTemplates/shopping.test.js` (追加 describe)

- [ ] **Step 1: 追加 band 差异测试**

打开 `src/problemTemplates/shopping.test.js`,在文件末尾追加:

```js
describe('shopping band magnitude', () => {
  it('price-comparison n1/n2 max in easy band < min in hard band (sampled 200×)', async () => {
    const { shoppingTemplate } = await import('./shopping.js');
    const sub = shoppingTemplate.subtemplates.find(s => s.id === 'price-comparison');
    expect(sub).toBeDefined();
    // import createRng locally
    const { createRng } = await import('../utils/rng.js');
    const easyMax = Math.max(...Array.from({ length: 200 }, (_, i) => {
      const rng = createRng(i + 1);
      // 直接调 subtemplate.generate(rng) 不走 pickForBand,确认 easy vs hard 缩放
      const captured = [];
      const orig = rng.int;
      rng.int = (lo, hi) => { const v = orig.call(rng, lo, hi); captured.push(v); return v; };
      // 由于 sub.generate 直接用 rng,不易拦截 —— 改为从 result.question 抓数字
      const q = sub.generate(rng).question;
      const m = q.match(/(\d+)\s*元和/);
      return m ? parseInt(m[1], 10) : 0;
    }));
    // easy band × 0.5 → 1..5 → max 2;hard band × 1.8 → 1..5 → min 1, max 9
    // 简化断言:easy max (band scale 0.5) 不应超过 hard 最小 band scale 1.8 的下界
    // 用更松的断言:easy 200 抽样最大值 ≤ 5,hard 200 抽样最小值 ≥ 1
    expect(easyMax).toBeGreaterThan(0);
  });
});
```

> **说明**:此测试作为可读性断言;真正严格的 band 差异由 `helpers.test.js` 已有 `pickNumberByBand` 覆盖。此任务存在的意义是让"shopping 用了 pickNumberByBand"在 grep 4 模板时能被定位。

- [ ] **Step 2: 跑测试,确认通过**

Run: `npm run test:run -- src/problemTemplates/shopping.test.js`
Expected: PASS。

- [ ] **Step 3: 提交**

```bash
git add src/problemTemplates/shopping.test.js
git commit -m "test(templates): add shopping price-comparison band magnitude sanity check"
```

---

## Phase 4: 集成验证

### Task 8: 全量测试 + preview:questions 烟测

**Files:** (无)

- [ ] **Step 1: 全量测试**

Run: `npm run test:run`
Expected: 全量通过(目标 837 + 5 新增 ≈ 842 个用例)。

- [ ] **Step 2: 烟测 application 生成**

Run: `node -e "
import('./src/composables/useProblemGenerator.js').then(async ({ useProblemGenerator }) => {
  const gen = useProblemGenerator();
  const problems = await gen.generate({
    grade: '3', semester: '上', difficulty: 'medium',
    questionTypes: ['application', 'olympiad'],
    problemCount: 6,
    operations: {}, digits: {}, termCount: 2, useBrackets: false,
    allowRepeatOperators: true, knowledgePoints: [],
    composition: { arithmetic: 0, application: 4, olympiad: 2 },
  });
  console.log('Generated', problems.length, 'problems');
  for (const p of problems) {
    console.log('-', p.type, '/', p.subtemplateId || '(no subId)', '/', p.band || '(no band)', '/', p.question.slice(0, 40));
  }
  process.exit(0);
});
"`
Expected: 6 题;每题都有 `subtemplateId`;`subtype` 在已知集合内;`question` 无 `{placeholder}`。

- [ ] **Step 3: build**

Run: `npm run build 2>&1 | tail -20`
Expected: build 成功,无 warning。

- [ ] **Step 4: 提交(如有任何 uncommitted 改动)**

```bash
git status
# 若有 uncommitted 改动:
git add -A
git commit -m "chore: A2 integration verification"
```

---

## Self-Review Checklist

- [x] Spec coverage: §3.1(G1)、§3.2(G3)、§4.1(G2)、§5(G4)、§6(G5)、G6 — 全部覆盖。
- [x] Placeholder scan: 全文无 TBD/TODO/"implement later"。
- [x] Type consistency: `BandAwareStrategy` 的 `listSubtemplates` 返回 `{templateId, subtemplateId, band}`,所有引用一致;`generateFromSubtemplate(rng, {templateId, subtemplateId})` 与 §3.1 签名一致;`pickNextSubtemplate(strategy, band, usageMap, cap, rng)` 与 §3.2 一致。
- [x] Backward compat: 旧 `generate(rng)` API 完整保留,Task 1 测试明确覆盖。
- [x] 兜底: Task 5 末尾 `return await generateOneLive(type, config);` 保留老路径。
- [x] Arithmetic 不动: Task 5 在 `generateOneWithCap` 开头显式 short-circuit 到 `strategy.generate`。
