# 应用题 + 奥数题 — 生成层重构：BandAwareStrategy + 真正的 cap-enforcing 选择

**项目**: PrimarySchoolMathematicsGenerator
**日期**: 2026-09-15
**状态**: Draft
**优先级**: 中（不修不崩,但 A2 范围内工作已经在"反模式"上跑：先 generate 再 cap-check,既低效又会在高年级少 subtype 时锁死）
**前置依赖**: 无（独立 spec,可在 D 子项目之上直接实施）
**作者**: Codex (brainstorming)

> **范围说明**:本文档只覆盖"应用题 / 奥数题生成逻辑优化"的 **A2 范围**,即:
> 1. 抽 `BandAwareStrategy` 父类 + 让 `ApplicationStrategy` / `OlympiadStrategy` 变 3 行子类
> 2. 策略层暴露 `listSubtemplates` / `generateFromSubtemplate`,让 orchestrator 在"挑 subtemplate"前就能 cap 过滤
> 3. `useProblemGenerator` 把"先 generate 再 cap-check"换成"先 cap 挑 subtemplate 再 generate",并加 band advance
> 4. 4 个早期模板的剩余 `rng.int` 中,可 band 缩放的部分迁到 `pickNumberByBand`
>
> **不在范围**:Arithmetic 策略重构、组合编排(Option C)、UI 改动、`usageMap` 跨 batch 持久化。

---

## 1. 背景与目标

### 1.1 现状

**策略层**（`src/strategies/`）:
- `ApplicationStrategy` / `OlympiadStrategy` 各 22 行,差异只在 `type` 字符串和错误消息。
- `generate(rng)` 流程:`rng.pick(this.templates)` → `tpl.generate(rng, difficultyLevel)` → `pickForBand` 过滤 band → 选 subtemplate → 生成题目。
- 策略层**不知道**当前 batch 已有多少同 subtype 题目被挑走 —— 不可能做 cap-enforcing。

**diversity 共享模块**（`src/problemTemplates/diversity.js`）:
- 已存在 `enumerateSubtypes`、`computeCap`、`pickUnderCap`、`buildComposition` 四个纯函数。
- 这些是 Plan C/D 留下的"基础设施",**当前是死代码** —— 唯一的实际使用方是 `pickUnderCap` 自己,生产路径根本不用。

**Composable 层**（`src/composables/useProblemGenerator.js`）:
- 已有的 cap 逻辑是**反模式**:在 `try { generateOneLive() }` 之后才用 `p.subtemplateId` 做 cap 检查,`>= cap` 就 `continue`。问题:
  1. **低效**:已经生成了题目才扔掉。
  2. **死循环风险**:`useProblemGenerator` 现有注释 ("高年级 + 少 subtype 的 band 会算出一个看起来合理但实际永远触不到的天花板") 指出 cap 太紧时 retry 一直失败,触发 5 秒超时。
  3. **没有 band advance**:cap 在 active band 上饱和时,没有 fallback 到 medium/hard。

**4 个早期模板**（shopping/time/comparison/sequence）:
- 大部分数值生成**已经**走 `pickNumberByBand`(D 子项目统一过)。
- 剩余 `rng.int` 调用**多数是约束型第二个值**(`b < a - 5`、`discount ∈ [2,4]`、小时数 `≤ 12`),**不应**再 band 缩放。
- 真正应迁到 `pickNumberByBand` 的只有零星几处(见 §5)。

### 1.2 重构目标

| # | 目标 | 验证手段 |
|---|---|---|
| G1 | 策略层从"pick + return"改为"registry + 工厂"：`listSubtemplates` 暴露可达 subtype,`generateFromSubtemplate` 接收精确 (template, subtemplate) 对 | `BandAwareStrategy.test.js`(新) |
| G2 | `useProblemGenerator` 改为"先 cap 挑 subtemplate 再 generate",cap 在 active band 饱和时自动 advance 到 medium / hard,所有 band 都饱和才走兜底 | `useProblemGenerator.test.js` 新增 cap 行为断言 |
| G3 | `diversity.js` 增加 `pickNextSubtemplate(strategy, band, usageMap, cap, rng)` 高层 helper,作为 G2 的共享实现 | `diversity.test.js` 新增 |
| G4 | 4 个早期模板的 `rng.int` 中,可 band 缩放的全部迁到 `pickNumberByBand`,约束型第二个值保留 `rng.int` | 4 个模板的现有测试零修改 + 新增 band 差异断言 |
| G5 | `ApplicationStrategy.test.js` / `OlympiadStrategy.test.js` 删去被父类覆盖的用例,保留 type-specific 用例 | 全量测试通过 |
| G6 | 现有 837 个测试零失败,`npm run build` 通过 | CI / `vitest run` |

---

## 2. 设计总览

### 2.1 架构

```
                         ┌──────────────────────────────────────────┐
                         │   useProblemGenerator (composable)        │
                         │   - build usageMap, compute cap per band │
                         │   - for each iter: pick next subtemplate │
                         │   - on band saturated: advance band       │
                         │   - call strategy.generateFromSubtemplate │
                         └──────────────────┬───────────────────────┘
                                            │ uses
                                            ▼
                         ┌──────────────────────────────────────────┐
                         │   diversity.js (新增 helper)             │
                         │   - pickNextSubtemplate(strategy, band,   │
                         │       usageMap, cap, rng)                 │
                         │     → listSubtemplates + filter under cap │
                         │     → rng.pick → {templateId, subId, band}│
                         │   - 保留 enumerateSubtypes / computeCap / │
                         │     pickUnderCap / buildComposition       │
                         └──────────────────┬───────────────────────┘
                                            │ uses
                                            ▼
                         ┌──────────────────────────────────────────┐
                         │   BandAwareStrategy (parent, 新)          │
                         │   - type, templates, difficultyLevel      │
                         │   - listSubtemplates({band?})             │
                         │   - generate(rng)           ← 旧 API,行为 │
                         │   - generateFromSubtemplate(rng, picked)  │
                         │                                          │
                         │   extends ProblemGeneratorStrategy        │
                         └─────────┬─────────────────────┬──────────┘
                                   │ extends             │ extends
                                   ▼                     ▼
                  ┌──────────────────────┐  ┌────────────────────────┐
                  │ ApplicationStrategy  │  │ OlympiadStrategy       │
                  │ super(config, type:  │  │ super(config, type:    │
                  │   'application')     │  │   'olympiad')          │
                  └──────────────────────┘  └────────────────────────┘
```

### 2.2 涉及文件

| 路径 | 类型 | 说明 |
|---|---|---|
| `src/strategies/BandAwareStrategy.js` | 新 | 父类,集中 listSubtemplates / generate / generateFromSubtemplate |
| `src/strategies/ApplicationStrategy.js` | 改 | 3 行子类 |
| `src/strategies/OlympiadStrategy.js` | 改 | 3 行子类 |
| `src/strategies/BandAwareStrategy.test.js` | 新 | 共享行为测试 |
| `src/strategies/ApplicationStrategy.test.js` | 改 | 删去共享用例,保留 type-specific |
| `src/strategies/OlympiadStrategy.test.js` | 改 | 同上 |
| `src/problemTemplates/diversity.js` | 改 | 新增 `pickNextSubtemplate` |
| `src/problemTemplates/diversity.test.js` | 新 | 新 helper 单测 |
| `src/composables/useProblemGenerator.js` | 改 | 切换到 pre-generation cap 挑选,加 band advance |
| `src/composables/useProblemGenerator.test.js` | 改 | 新增 cap 行为 + band advance 断言 |
| `src/problemTemplates/{shopping,time,comparison,sequence}.js` | 改 | 剩余 `rng.int` 中可 band 缩放者迁 `pickNumberByBand` |
| `src/problemTemplates/{shopping,time,comparison,sequence}.test.js` | 改 | 加 band 差异断言 |

### 2.3 不在范围

- Arithmetic 策略不动(它不经过模板,没 cap 问题)
- composition 编排(Option C,独立 spec)
- `usageMap` 跨 batch 持久化
- UI 改动(picker 已存在,见 Plan C/D)
- `helpers.js` / `pickForBand` 签名变更(向后兼容)
- 模板 `subtemplates` 数量 / `id` / `band` 标记(本 spec 不新增也不删 subtemplate)

---

## 3. 数据契约

### 3.1 `BandAwareStrategy` 父类 API

```js
// src/strategies/BandAwareStrategy.js
import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { templatesFor } from '../problemTemplates/index.js';
import { DIFFICULTY_TO_LEVEL } from '../constants/options.js';

export class BandAwareStrategy extends ProblemGeneratorStrategy {
  /**
   * @param {Object} config - 同 ProblemGeneratorStrategy
   * @param {{type: 'application'|'olympiad'}} opts - 策略语义类型
   */
  constructor(config, { type }) {
    super(config);
    this.type = type;
    this.difficultyLevel = DIFFICULTY_TO_LEVEL[config.difficulty] ?? 2;
    this.templates = templatesFor(type, config.grade);
  }

  /**
   * 列出当前 (type, grade) 下可达的 subtemplate 三元组。
   * 给 orchestrator 用于 cap 过滤。
   * @param {{band?: 'easy'|'medium'|'hard'}} [opts]
   * @returns {Array<{templateId: string, subtemplateId: string, band: 'easy'|'medium'|'hard'}>}
   */
  listSubtemplates({ band } = {}) {
    return this.templates.flatMap(t =>
      t.subtemplates
        .filter((st) => !band || st.band === band)
        .map((st) => ({ templateId: t.id, subtemplateId: st.id, band: st.band }))
    );
  }

  /** 旧 API:行为零变化,delegates 模板 + pickForBand。 */
  generate(rng) {
    if (this.templates.length === 0) {
      throw new Error(`No ${this.type} templates available for grade ${this.config.grade}`);
    }
    const tpl = rng.pick(this.templates);
    return tpl.generate(rng, this.difficultyLevel);
  }

  /**
   * 新 API:精确 (templateId, subtemplateId) 生成。
   * 抛错:模板未找到 / 模板不匹配 type / subtemplate 未找到。
   * @param {Function} rng
   * @param {{templateId: string, subtemplateId: string}} picked
   */
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

**返回结构(用于 composable 增量 usageMap)**:
`generateFromSubtemplate` 在 `sub.generate(rng)` 既有 `{question, answer, subtype, payload}` 之上,新增 `templateId`(tpl.id,与 picked.templateId 同值)、`subtemplateId`、`band`。

注意:`generateFromSubtemplate` 直接调 `sub.generate(rng)`(**不**经 `tpl.generate(rng, lvl)`,所以不走 `pickForBand` 包装),由本方法自己补 `subtemplateId` / `band` 字段。`band` 取 `sub.band`(与 `picked.band` 一致 —— orchestrator 只从匹配 band 的候选里挑)。

### 3.2 `diversity.js` 新增 helper

```js
// src/problemTemplates/diversity.js (新增函数,保留其它导出)

/**
 * 从 strategy 当前 band 候选里,挑一个未超额 (templateId, subtemplateId) 对。
 * @param {BandAwareStrategy} strategy
 * @param {'easy'|'medium'|'hard'} band
 * @param {Map<string, number>} usageMap - subtemplateId → 已用次数
 * @param {number} cap - computeCap 结果
 * @param {Function} rng
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

### 3.3 `useProblemGenerator` cap 行为契约

| 行为 | 当前实现 | 新实现 |
|---|---|---|
| cap 计算 | `computeCap(count, activeBandSubtypeCount)` | 不变(已在 diversity.js) |
| 应用 cap 位置 | **生成后**(post-check) | **生成前**(pre-pick via `pickNextSubtemplate`) |
| cap 在 active band 饱和 | 静默重试到 5 秒超时 | 主动 advance band:`easy → medium → hard`;全满才走兜底 |
| 兜底行为 | 无;5 秒超时后 `break` | 已 saturate 时回退到"先 generate 再 cap-check"逻辑(保持向后兼容) |
| 传给 UI 的 `subtemplateId` / `band` | 已支持 | 不变 |

**advance 顺序**:`easy → medium → hard`(保持现状,优先 active band)。

---

## 4. 关键算法:composable 的"挑 + 生成"循环

### 4.1 新伪代码

```js
// src/composables/useProblemGenerator.js (节选,仅变化部分)
import { pickNextSubtemplate, computeCap, enumerateSubtypes } from '../problemTemplates/diversity.js';

const BAND_ADVANCE = ['easy', 'medium', 'hard'];

async function generateOneWithCap(type, config, usage, totalForType) {
  const strategy = ProblemGeneratorFactory.createStrategy(type, config);
  // 在三个 band 中尝试;先用 active band,saturate 后 advance
  const activeBand = levelToBand(difficultyToLevel(config.difficulty));
  const order = [activeBand, ...BAND_ADVANCE.filter((b) => b !== activeBand)];

  for (const band of order) {
    const bandSubtypes = strategy.listSubtemplates({ band });
    if (bandSubtypes.length === 0) continue;  // 该 band 无候选,跳过
    const cap = computeCap(totalForType, bandSubtypes.length);
    const picked = pickNextSubtemplate(strategy, band, usage[type], cap, rng);
    if (!picked) continue;  // 该 band cap 全满,advance
    try {
      const p = strategy.generateFromSubtemplate(rng, picked);
      usage[type].set(picked.subtemplateId, (usage[type].get(picked.subtemplateId) || 0) + 1);
      return p;
    } catch (err) {
      // subtemplate 自身生成失败(参数边界 / pickPairByBand 抛错等) — 跳过,继续 retry
      continue;
    }
  }
  // 所有 band 都 saturate / 失败:走原有"先 generate 再 cap-check"兜底
  return await generateOneLive(type, config);
}
```

### 4.2 主循环契约

- 现有 `try { generateOneLive } catch { skip }` 替换为 `try { generateOneWithCap } catch { skip }`。
- 现有 5 秒超时、`attempts < needFromLive * 20`、`seen` 去重 —— 全部保留。
- `subtemplateId` / `band` 字段从 strategy 直接传到 `result`,由 composable 透传到 dexie(已存在)。
- `usageMap` 仍是 batch-local,不持久化。

### 4.3 错误处理

| 错误源 | 当前行为 | 新行为 |
|---|---|---|
| `generateOneLive` 抛 "No X templates for grade" | catch 静默 | 同(advance 前 strategy 已 list 出空数组,不会发生) |
| `pickForBand` 抛 "No subtemplates for band" | catch 静默 | 不再发生:composable 只在 `bandSubtypes.length > 0` 时调 |
| `pickPairByBand` 抛 "cannot draw two distinct values" | catch 静默 | 同(保留 catch,advance 到下个 subtemplate 由 retry 处理) |
| 5 秒超时 | warn + break | 不变 |

---

## 5. 4 个早期模板的"可 band 缩放"项迁移

> **澄清**:这 4 个模板**大部分**数值生成已经在 D 子项目迁到 `pickNumberByBand`。本 spec 只处理剩余 `rng.int` 中**可缩放**的部分,约束型第二个值(`b < a - 5`、`discount ∈ [2,4]`、小时数 `≤ 12`)保留 `rng.int`。

### 5.1 审计结论(基于 grep + 已读代码)

| 文件 | 行号 | 现状 | 处理 |
|---|---|---|---|
| `shopping.js` | L16 | `arr[rng.int(0, arr.length-1)]` | **保留**:数组下标,不是数值 |
| `shopping.js` | L83 | `const discount = rng.int(2, 4)` | **保留**:小整数语义"打 8-9 折",band 缩放无意义 |
| `shopping.js` | L182 | `const price2 = rng.int(2, price1 - 1)` | **保留**:约束型第二个值,`price1` 已是 primary |
| `shopping.js` | L200-201 | `const n1 = rng.int(1, 5); const n2 = rng.int(1, 5)` | **迁移**:`pickNumberByBand(rng, band, {min:1, max:5})` |
| `time.js` | L6, L21, L37, L70, L88, L105, L122 | 小时数 `rng.int` | **保留**:小时天然 ≤ 24,band 缩放无意义 |
| `time.js` | L70-72 | `interval` / `nth` 已用 `pickNumberByBand` | 不动 |
| `comparison.js` | L29, L46, L63, L80, L132, L152-153, L188, L204, L219-221 | 约束型第二个值 | **保留**:`b < a - 5` 等约束优先于 band |
| `sequence.js` | L28 | `const ratio = rng.int(2, 3)` | **保留**:小整数比值,band 缩放无意义 |
| `sequence.js` | L82-83 | `multiply` / `add` | **保留**:同上 |

### 5.2 实际迁移量

- `shopping.js`:L200-201 共 2 行
- 其它 3 个文件:**0 行**
- 总计:**1 个文件,2 行代码** (D 子项目已统一得相当彻底)

### 5.3 测试增补

- 4 个模板的现有测试**应当零修改**通过(数值范围未变)。
- 新增"band 数值差异"断言(仅在 5.1 中标记"迁移"的位置抽样):easy band 下 `n1`、`n2` 的最大值 ≤ hard band 下的最小值(N=200 抽样验证)。

---

## 6. 测试策略

### 6.1 新增测试

**`BandAwareStrategy.test.js`(新)**
- `listSubtemplates({})` 返回当前 (type, grade) 全部 subtype 三元组
- `listSubtemplates({band: 'easy'})` 只返回该 band 的
- `generateFromSubtemplate` 正常路径返回 `{question, answer, subtype, payload, templateId, subtemplateId, band}`
- `generateFromSubtemplate` 模板未找到 → 抛错
- `generateFromSubtemplate` subtemplate 未找到 → 抛错
- `generate(rng)` 旧 API 行为不变(等价于 `pickForBand` 路径)

**`diversity.test.js`(改 / 扩)**
- `pickNextSubtemplate` 全超额 → 返回 null
- `pickNextSubtemplate` 部分超额 → 只从未超额里挑
- `pickNextSubtemplate` 全未用 → 从全候选里随机挑

**`useProblemGenerator.test.js`(改)**
- 新增"batch 内同一 subtemplateId 出现次数 ≤ cap"断言(N=10、cap=2 的小例子)
- 新增"active band 饱和时 advance 到下个 band"断言(用 mock strategy 强制 saturate)
- 新增"兜底:全 band 饱和时仍能返回题目"断言

**4 个模板的测试(改)**
- 现有断言零修改
- 新增 §5.3 的 band 差异断言

### 6.2 删除测试

- `ApplicationStrategy.test.js` 中"returns problems with application shape"等被父类覆盖的 → 移到 `BandAwareStrategy.test.js`
- `OlympiadStrategy.test.js` 同上
- 保留:grade 抛错(type-specific)、subtype 已知集合(type-specific)、band 不泄漏(type-specific 保留,因 hard signature 字符串是 type-specific 的)

### 6.3 回归

- `npm run test:run` 全量通过(目标 837+ 测试,允许 +5 新增、-0 减少因部分上移)
- `npm run build` 通过
- `npm run preview:questions` 跑一次,确认 application/olympiad 输出仍含已知 subtype

---

## 7. 风险与回退

### 7.1 风险

| 风险 | 概率 | 缓解 |
|---|---|---|
| `generateFromSubtemplate` 与 `pickForBand` 行为差异(后者有 `subtemplateId`/`band` 透出) | 低 | 新 API 直接调 `sub.generate(rng)`,**不**走 `pickForBand` 二次包装;`templateId`/`subtemplateId`/`band` 由调用方注入 |
| band advance 后 subtemplate 与"原 difficulty"语义偏离 | 中 | 仅在 active band **饱和**时才 advance,且 advance 顺序 easy→medium→hard;advance 后难度"略升高"是有意的,匹配"用户多要 1 题" |
| `usageMap` 跨 subtemplate 的"subtemplateId 字符串" 与 `pickForBand` 透出的字符串必须一致 | 低 | 同一 `t.subtemplates[].id` 来源,不变;测试断言"同一 strategy 出的 `picked.subtemplateId` ≡ `result.subtemplateId`" |
| 现有 837 个测试因 `generate(rng)` 行为变化挂掉 | 极低 | 旧 API 100% 保留(无新逻辑,只 delegating 父类) |

### 7.2 回退

- `BandAwareStrategy` 用 feature flag 控制是否启用,默认开启,UI 不感知
- 兜底路径(`generateOneLive`)保留,如新路径全 band 饱和,自动回退
- 若生产发现问题,可在 composable 内一行 toggle 关闭 pre-generation cap,回到现有"post-check"行为

---

## 8. 实施拆解(留待 writing-plans 技能细化)

预计 12-15 个 task,大致 3 个阶段:

1. **基础设施**(3 task):`BandAwareStrategy` 父类、`ApplicationStrategy` / `OlympiadStrategy` 3 行化、相关测试
2. **diversity + composable**(4 task):`pickNextSubtemplate` helper、composable pre-pick + band advance、相关测试
3. **模板收尾 + 集成验证**(3-5 task):4 模板剩余迁移(1 个文件 2 行)、4 模板 band 差异测试、`preview:questions` 人工验证、`npm run build` 验证

**前置依赖**:无。可在当前 main 上直接开新分支。
**预计工时**:中等(主要是 composable 测试覆盖需要构造 mock)。
