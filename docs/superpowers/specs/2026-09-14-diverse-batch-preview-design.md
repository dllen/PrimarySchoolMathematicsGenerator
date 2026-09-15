# 应用题 + 奥数题 多样化 batch & 预览 CLI

**项目**: PrimarySchoolMathematicsGenerator
**日期**: 2026-09-14
**状态**: Draft
**优先级**: 中(用户体验改进,非功能 bug)
**前置依赖**: 无(独立于 A/B/C/D,可直接实施)
**作者**: Codex (brainstorming)

---

## 1. 背景与目标

### 1.1 现状

`useProblemGenerator.js` 在生成 N 题时,**唯一**的重复防护是题目文本 `seen: Set`。模板选择是 `rng.pick(this.templates)` 均匀随机 — 一次生成 20 题可能 5 题都是 `shopping-total-price`,2 题都是 `time-hours-later`,体感是「类型单一」。

模板/子模板目录:

| 题型 | 模板数 | subtemplate 总数 |
|---|---|---|
| 应用题 | 19 | ~120 |
| 奥数题 | 8 | ~55 |

`ApplicationStrategy` / `OlympiadStrategy` 接受 `config.difficulty` → `difficultyLevel (1/2/3)` → `pickForBand` 过滤 band,但**不**做模板间或子模板间的去重。

返回对象的 `subtype` 字段是**模板级**(如 `shopping`),不是 `subtemplate.id`(如 `shopping-total-price`)— 即使想做去重也没有合适的 key。

### 1.2 目标

| # | 目标 | 验证手段 |
|---|---|---|
| G1 | 一次 batch 内,任意 `subtemplateId` 出现次数 ≤ `ceil(N/M) + 1` | `useProblemGenerator.test.js` 新增断言 |
| G2 | 生产端生成器对调用方透明 — 同一 `config` 出 N 题,题面文本和数量都不变(只是类型分布更均匀) | 全量 837 个测试回归通过 |
| G3 | 提供一个 `node scripts/preview-questions.mjs` 命令,在终端打印按模板分组的预览,便于肉眼审查类型覆盖 | 手动 `npm run preview:questions` |
| G4 | 新增 `subtemplateId` 与 `band` 两个字段到生成结果上,**向后兼容**(现有测试零修改) | 全量 837 个测试零失败 |

---

## 2. 设计总览

### 2.1 架构

```
┌─────────────────────────────────────────────────────────┐
│  src/problemTemplates/                                   │
│    helpers.js          ← pickForBand 返回 {subtemplateId,band} │
│    diversity.js  (新)   ← enumerateSubtypes / computeCap / pickUnderCap │
│    index.js             ← templatesFor(type, grade)  (已有) │
└─────────────────────────────────────────────────────────┘
                            ▲                ▲
                            │                │
┌───────────────────────────┴────┐  ┌────────┴────────────────┐
│  useProblemGenerator.js        │  │  scripts/preview-questions.mjs (新) │
│  (生产端,接 cap)               │  │  (CLI,同一 dedup 逻辑) │
└────────────────────────────────┘  └─────────────────────────┘
```

**核心**:把"多样化选题"做成**纯 JS 共享模块**,CLI 和生成器都调它,避免重复实现。

### 2.2 涉及文件

| 路径 | 类型 | 说明 |
|---|---|---|
| `src/problemTemplates/helpers.js` | 改 | `pickForBand` 透出 `subtemplateId` + `band` |
| `src/problemTemplates/diversity.js` | 新 | 三个纯函数:`enumerateSubtypes`、`computeCap`、`pickUnderCap` |
| `src/composables/useProblemGenerator.js` | 改 | 引入 cap,主循环跳过超额候选;`buildComposition` 移到 `diversity.js` 后 import 回来 |
| `src/composables/useProblemGenerator.test.js` | 改 | 新增多样化断言 |
| `src/problemTemplates/helpers.test.js` | 改 | 新增 `subtemplateId` / `band` 字段断言(确认契约) |
| `src/problemTemplates/diversity.test.js` | 新 | 三个纯函数单测 |
| `scripts/preview-questions.mjs` | 新 | CLI 脚本 |
| `package.json` | 改 | 加 `"preview:questions"` npm script |

---

## 3. 数据契约

### 3.1 `pickForBand` 返回值变更(向后兼容)

```js
// src/problemTemplates/helpers.js
export function pickForBand(template, difficultyLevel, rng) {
  const band = levelToBand(difficultyLevel);
  const pool = template.subtemplates.filter(t => t.band === band);
  if (pool.length === 0) {
    throw new Error(`No subtemplates for band=${band} in template=${template.id}`);
  }
  const subtemplate = rng.pick(pool);
  const result = subtemplate.generate(rng);
  // 新增字段:让调用方能按 subtemplate 粒度做去重 / 报告
  return { ...result, subtemplateId: subtemplate.id, band };
}
```

**关键不变**:`subtemplate.generate(rng)` 自身一行不改。`{ ...result, subttemplateId, band }` 是 spread 后附加,旧测试断言的字段(`question`、`answer`、`subtype`、`payload`)全部保留。

### 3.2 新增字段的语义

| 字段 | 值 | 用途 |
|---|---|---|
| `subtemplateId` | 字符串,如 `'shopping-total-price'`、`'sequence-arithmetic'` | 生产端 dedup key;CLI 展示 |
| `band` | `'easy'` / `'medium'` / `'hard'` | CLI 展示;未来按 band 过滤可用 |

---

## 4. 共享模块:`src/problemTemplates/diversity.js`

```js
// 新文件,纯函数,无 Vue 依赖
import { templatesFor } from './index.js';

/**
 * 列出某 type + grade 下的全部 subtemplate 三元组。
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
 * M=0 时返回 Infinity(避免下游除零),调用方需先检查 subtype 数。
 */
export function computeCap(shareCount, subtypeCount) {
  if (subtypeCount === 0) return Infinity;
  return Math.ceil(shareCount / subtypeCount) + 1;
}

/**
 * 给定候选 subtype 列表 + 已用计数 Map,挑一个未超额的下标。
 * 全超额时返回 -1(调用方应保留已有 retry 循环兜底)。
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
```

---

## 5. 生产端接入:`useProblemGenerator.js`

### 5.1 改动位置

在 `generate(config)` 函数开头(已有 `composition`、`seen: Set`、`historyCache` 之后),新增**预计算**与**使用计数**:

```js
import { enumerateSubtypes, computeCap, pickUnderCap } from '../problemTemplates/diversity.js';

export function useProblemGenerator() {
  // ...existing imports...

  async function generate(config) {
    const composition = buildComposition(config);
    const seen = new Set();
    const results = [];

    // === 新增:多样化 dedup ===
    const appSubtypes = enumerateSubtypes('application', config.grade);
    const olySubtypes = enumerateSubtypes('olympiad', config.grade);
    const appCap = computeCap(composition.application || 0, appSubtypes.length);
    const olyCap = computeCap(composition.olympiad || 0, olySubtypes.length);
    const usage = {
      application: new Map(),  // subtemplateId -> count
      olympiad: new Map(),
    };
    const capFor = (type) => (type === 'application' ? appCap : olyCap);
    // === 新增结束 ===

    const historyCache = new Map();
    // ...existing historyCache + getHistoryQuestions...

    for (const [type, count] of Object.entries(composition)) {
      if (!count || count <= 0) continue;

      // ...existing history cache prefill + preloaded sampling (these contribute to results
      //    without going through generateOneLive; they don't get subtype cap enforcement.
      //    见 §7.2 已知权衡)...

      // ...existing needFromLive / attempts loop...
      while (produced < needFromLive && attempts < needFromLive * 20) {
        if (Date.now() - generationStart > GENERATION_TIMEOUT_MS) { /* ... */ }

        attempts++;
        try {
          const p = await generateOneLive(type, config);
          if (seen.has(p.question)) continue;

          // === 新增:cap 拒绝 (仅 application/olympiad,arithmetic 不走模板无 subtype) ===
          if ((type === 'application' || type === 'olympiad') && p.subtemplateId) {
            const cap = capFor(type);
            const used = usage[type].get(p.subtemplateId) || 0;
            if (used >= cap) continue;  // 超额,跳过,继续 retry
            usage[type].set(p.subtemplateId, used + 1);
          }
          // === 新增结束 ===

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
      }
    }

    // ...existing persistToLibrary(results, config)...
    return results;
  }
}
```

### 5.2 关键不变

- `buildComposition()` 拆分逻辑 — 不动
- `seen: Set`(题目文本去重)— 不动
- `attempts < needFromLive * 20` 与 5 秒超时 — 不动
- `persistToLibrary` 写入 DB — 不动,只是多写入 `subtemplateId` / `band` 两个字段(Dexie schema 自动兼容)
- 异常 `catch (err)` — 不动

### 5.3 边界情况

| 场景 | 行为 |
|---|---|
| `M = 0`(没有模板适用于该 grade) | `cap = Infinity`;但 `appSubtypes.length === 0` 时 `computeCap` 返回 Infinity,`pickForBand` 抛 `No templates`;沿用现有错误 |
| `M = 1`(只有 1 个模板) | `cap = shareCount + 1`,实际无限制;退化到"同一模板内不同 subtemplate",由 `rng.pick(pool)` 保证 |
| `K > poolSize`(某模板某 band 子模板少于 cap) | 走原 retry 循环;不强行 enforce,DB 文本去重兜底 |
| 用户在 `composition` 里给某 type 0 题 | `shareCount = 0`,`cap = 0 + 1 = 1`(因为 `ceil(0/M)+1=1`),但外层 `if (!count) continue` 已经跳过,实际不进循环 |
| 难度是 `easy` 但某模板没 easy 子模板 | `pickForBand` 已抛 `No subtemplates for band=X`;沿用 |

---

## 6. CLI 脚本:`scripts/preview-questions.mjs`

### 6.1 接口

```
node scripts/preview-questions.mjs [options]

  --count=N               总题数(默认 25)
  --grade=N               年级 1-6(默认 3)
  --difficulty=easy|medium|hard(默认 medium)
  --type=application|olympiad|both(默认 both)
  --seed=N                固定随机种子(默认 Date.now())
  --help                  打印用法
```

参数解析用纯 `process.argv.forEach` + switch,**不**引入 commander/yargs(沿用 `scripts/build-library.mjs` 的零依赖风格)。

### 6.2 输出格式

```
════════════════════════════════════════════════════════════════
应用题 + 奥数题 多样化预览
年级: 3 年级(上册)  难度: medium  题数: 25  种子: 1694698401234
════════════════════════════════════════════════════════════════

[应用题]  共 15 题,触达 11 个 subtype(共 22 个可用,50% 覆盖)
────────────────────────────────────────────────────────────────
   #  subtemplateId             band     题面
  ──  ────────────────────────  ───────  ────────────────────────────
   1  shopping-total-price      easy     小明买了3个铅笔,每个2元,一共多少钱?
   2  time-hours-later          easy     现在是8时,小明起床后再过3小时是几点?
   ...
────────────────────────────────────────────────────────────────
[奥数题]  共 10 题,触达 7 个 subtype(共 15 个可用,46% 覆盖)
────────────────────────────────────────────────────────────────
  16  sequence-arithmetic       easy     找规律:2, 5, 8, 11, ( )
  ...
────────────────────────────────────────────────────────────────
摘要
  · 应用题 + 奥数题 共触达 18 个不同 subtype
  · 每个 subtype 最多出现 2 次(cap = ceil(15/22) + 1 = 2)
════════════════════════════════════════════════════════════════
```

- 题面**截断到 30 字**,超长加 `…`,避免终端换行
- 答案**省略**(CLI 焦点是覆盖度,不是答案核对;改代码可加)
- box-drawing 字符 `═` / `─` 用作分隔线,**不**引入 `chalk`(零依赖)

### 6.3 主循环(复用 §4 + §5 的同一套 dedup)

```js
import { createRng } from '../src/utils/rng.js';
import { ApplicationStrategy } from '../src/strategies/ApplicationStrategy.js';
import { OlympiadStrategy } from '../src/strategies/OlympiadStrategy.js';
import { enumerateSubtypes, computeCap, pickUnderCap } from '../src/problemTemplates/diversity.js';

// 1. parse argv
// 2. 从 diversity.js import buildComposition(已从 useProblemGenerator 移出)
// 3. 预计算 appCap / olyCap / usage Map
// 4. while (produced < count) loop: pickUnderCap → strategy.generate → push
// 5. 格式化为 §6.2 输出
```

**关键**:CLI **不**写 DB(`library.save` 不调),纯输出。

### 6.4 npm script

```jsonc
// package.json (新增一行)
"scripts": {
  // ...已有...
  "preview:questions": "node scripts/preview-questions.mjs"
}
```

---

## 7. 测试计划

### 7.1 新增单测

| 文件 | 用例 |
|---|---|
| `src/problemTemplates/diversity.test.js` | (a) `enumerateSubtypes('application', 3)` 返回扁平三元组; (b) `computeCap(15, 22)` === 2; (c) `computeCap(0, 5)` === 1; (d) `computeCap(15, 0)` === Infinity; (e) `pickUnderCap` 全超额返回 -1; (f) `pickUnderCap` 部分超额只挑未满的 |
| `src/problemTemplates/helpers.test.js` | (新增) `pickForBand` 返回结果包含 `subtemplateId` 和 `band`,值与 pool 里某条匹配 |
| `src/composables/useProblemGenerator.test.js` | (新增) 固定 seed 跑 `generate({questionTypes:['application','olympiad'], problemCount: 30, grade: '3', ...})`,断言: (i) `results.length === 30`; (ii) 任意 `subtemplateId` 出现次数 ≤ `ceil(30 / actualM) + 1`,其中 `actualM = enumerateSubtypes('application', '3').length + enumerateSubtypes('olympiad', '3').length`(测试时动态算,不硬编码); (iii) 题目文本无重复 |
| `scripts/preview-questions.test.js` | (新增,可选) 用 `node --test` 或 vitest 跑子进程:固定 seed 跑脚本,断言 stdout 包含期望的 `[应用题]`、`[奥数题]` 块和「触达 N 个 subtype」摘要行 |

### 7.2 回归测试

跑 `npx vitest run`,期望 837 + 新增 ≈ 850+ 全部通过。重点关注:

- `tests/strategies/ApplicationStrategy.test.js`、`tests/strategies/OlympiadStrategy.test.js` — 字段 spread 不影响现有断言
- `src/problemTemplates/bandCoverage.test.js` — 各模板 band 覆盖未变
- `src/problemTemplates/numbersInBand.test.js` — 数字范围未变
- `useProblemGenerator.test.js` 既有用例(只跑 `application`、`arithmetic`、`olympiad` 的纯路径)— 数量/类型分布不变

### 7.3 手动验证

```bash
# 1. CLI 跑通
npm run preview:questions -- --count=30 --grade=4 --difficulty=hard --seed=42

# 2. 完整测试 + 构建
npm run test:run
npm run build
```

---

## 8. 风险与权衡

### 8.1 已知权衡

1. **历史缓存与预加载采样不强制 cap**:现有的 history-cache-prefill + preloaded-library-sample 路径直接 push results,不经过 `generateOneLive`,所以 cap 不适用。这部分通常贡献 0–5 题,主要靠 live generation 撑场。如果用户体验仍报重复,下一步再考虑把 cap 套到这两层(本次 YAGNI)。
2. **`subtemplateId` 字段未来可能撞名**:目前所有 subtemplate id 形如 `<template>-<verb>` 是唯一的;若未来引入「跨模板共享子模板」,id 需要重新组织。本次不预设。
3. **CLI 题面截断 30 字**:对长情境题(应用题)可能截掉关键信息;只在 CLI 展示用,不影响生产输出。

### 8.2 不做的事(YAGNI)

- ❌ 运行时开关禁用 dedup(默认开启就好)
- ❌ 跨 batch 的去重记忆(每个 batch 独立 dedup 已足够)
- ❌ 把 dedup 做成可插拔策略(strategy 模式)— 现阶段就一个固定公式
- ❌ 给 CLI 加 `--show-answers`、`--format=json|md` 等 — 想要的话自己改
- ❌ 新题型 / 新模板 — 本次**只**做 dedup,不补内容

---

## 9. 验收标准

- [ ] `npx vitest run` 全绿,新增测试覆盖 §7.1 全部用例
- [ ] `npx vite build` 通过
- [ ] `npm run preview:questions -- --count=30 --grade=3 --seed=42` 输出符合 §6.2 格式,触达 ≥ 60% subtype
- [ ] 在 `useProblemGenerator` 路径上固定 seed 跑 30 题,任意 `subtemplateId` 出现次数 ≤ 2
- [ ] 现有 837 测试零失败(回归)
- [ ] 文档更新:`README.md` 的「自定义全部配置」段落或合适位置加一句 `npm run preview:questions` 的引导(可选;若 spec reviewer 认为过度,跳过)

---

## 10. 实施顺序(给 writing-plans 用)

1. `helpers.js` — `pickForBand` 透出 `subtemplateId` / `band`(单点改动)
2. `helpers.test.js` — 新增 1–2 个断言确认新字段
3. `diversity.js` — 新建三个纯函数
4. `diversity.test.js` — 单测
5. `useProblemGenerator.js` — 引入 diversity 模块 + cap 逻辑
6. `useProblemGenerator.test.js` — 新增多样化断言
7. `scripts/preview-questions.mjs` — 新建 CLI
8. `package.json` — 加 npm script
9. 全量 `vitest run` + `vite build` 验证
10. 手动跑一次 `npm run preview:questions` 截图留档

每步独立 commit,便于中途回滚。
