# 应用题 / 奥数题 — 子项目 D:难度梯度 + 年级覆盖重构

**项目**: PrimarySchoolMathematicsGenerator
**日期**: 2026-09-14
**状态**: ✅ 已实施 (2026-09-14)
**优先级**: 高 (A/B/C 子项目的地基,必须先做)
**作者**: Codex (brainstorming)
**前置依赖**: 无(可独立实施)

> **范围说明**:本文档只覆盖 A+B+C+D 计划中的 **D 子项目**。
> A(中文经典题型)、B(应用题广度)、C(奥数深度)各为独立 spec,在 D 合并后单独编写。
> D 是基础设施子项目,目标不是"补内容",而是"立契约"。

---

## 1. 背景与目标

### 1.1 现状

`src/problemTemplates/` 下 6 个模板文件 (`shopping`、`time`、`comparison`、`chickenRabbit`、`sequence`、`logic`) 共享一个隐式契约:

```js
{ id, gradeRange, semester, subtemplates: [{ id, generate(rng, difficulty) }] }
generate(rng, difficulty)  // 数字范围用 5 + difficulty * 3 这类内联缩放
```

**问题**:
1. 难度边界不声明 — 每个模板各自决定"easy 长什么样",没有统一规约
2. `shoppingTemplate.generate` 均匀挑子模板,无视 difficulty 参数 — 把 easy 难度下也挑到 hard 子模板
3. UI 无法按难度过滤子模板,因为子模板没标自己是哪一档
4. 跨模板通用的"人物名池"、"数字缩放"、"年级合适区间"散落在每个文件里

### 1.2 重构目标

| 目标 | 验证手段 |
|---|---|
| 每个模板至少有 3 个子模板,分别打 `easy` / `medium` / `hard` band | `bandCoverage.test.js` |
| 难度等级 (1/2/3) 决定生成的子模板所属 band,不再随机 | 现有 `*Strategy.test.js` 行为回归 |
| 数字范围集中到 helper,模板不再手写缩放 | code review + `numbersInBand.test.js` |
| 模板间共享的人物池、年级区间集中到 `helpers.js` | 单一来源 |
| 不引入新题型、不补 5–6 / 1–2 年级覆盖(留给 A/B/C) | PR diff 不出现新 `*Template` 文件 |

---

## 2. 新契约

### 2.1 数据模型

```js
// src/problemTemplates/helpers.js (新文件)
export const BANDS = ['easy', 'medium', 'hard'];

/** @typedef {'easy' | 'medium' | 'hard'} Band */

const LEVEL_TO_BAND = { 1: 'easy', 2: 'medium', 3: 'hard' };
export const levelToBand = (level) => LEVEL_TO_BAND[level] ?? 'medium';
```

#### Subtemplate(新)

```js
{
  id: 'shopping-easy-total-price',  // id 只需在 template 内唯一;现有 id 无需重命名
  band: 'easy',                       // ★ 新增:必填,值 ∈ BANDS
  generate(rng) {                     // ★ 改动:去掉 difficulty 参数
    const unitPrice = pickNumberByBand(rng, 'easy', { min: 1, max: 9 });
    const quantity  = pickNumberByBand(rng, 'easy', { min: 2, max: 5 });
    // ... 返回 { question, answer, subtype, payload }
  }
}
```

#### Template(几乎不变)

```js
{
  id: 'shopping-complex',
  gradeRange: ['1', '2', '3', '4'],
  semester: 'all',
  subtemplates: [/* Subtemplate × ≥ 3,每个 band 各 ≥ 1 */],
  generate(rng, difficultyLevel) {     // ★ 改动:实现改为按 band 过滤
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    if (!pool.length) {
      throw new Error(`No subtemplates for band=${band} in template=${id=${this.id}`);
    }
    return rng.pick(pool).generate(rng);
  }
}
```

### 2.2 为什么这样改

| 旧模型问题 | 新模型解决 |
|---|---|
| `shoppingTemplate.generate` 均匀挑,无视 difficulty | 按 `levelToBand(difficultyLevel)` 过滤后再挑 |
| difficulty=1 与 difficulty=3 在 `5 + difficulty * 3` 里只差 6 | band 标签直接表达语义,模板不需要再把数字翻译回去 |
| UI 没法按"我现在想练哪档"过滤 | 模板元数据里有 `band` 可索引 |
| 数字缩放公式散落 6 个文件 | 集中在 `pickNumberByBand` |

---

## 3. helpers.js API

新文件 `src/problemTemplates/helpers.js`,单一职责"跨模板通用的随机参数生成"。

### 3.1 函数

| 函数 | 签名 | 用途 |
|---|---|---|
| `pickNumberByBand` | `(rng, band, { min, max }) => int` | 在指定区间按 band 缩放后取整数(具体缩放见 §3.2) |
| `pickPairByBand` | `(rng, band, { min, max }) => [int, int]` | 同上但返回两个不等的整数,用于"差题"类 |
| `pickPerson` | `(rng) => string` | 从 12 个中文名池中随机选一个 |
| `assertInRange` | `(value, lo, hi, label) => void` | 单元测试 / debug 用的范围断言 |

### 3.2 Band 缩放表

| Band | 缩放因子 | 调用者传的 `[min, max]` 内部会被乘以 |
|---|---|---|
| `easy`   | 0.5 | 取 `[min * 0.5, max * 0.5]` 再截断到 ≥ 1 |
| `medium` | 1.0 | 原值 `[min, max]` |
| `hard`   | 1.8 | 取 `[min * 1.8, max * 1.8]` |

示例:
- `pickNumberByBand(rng, 'easy', { min: 5, max: 20 })` → 实际取 `[3, 10]` (向下取整)
- `pickNumberByBand(rng, 'hard', { min: 10, max: 30 })` → 实际取 `[18, 54]`

模板无需自己写缩放公式,直接表达"我要 5–20 范围的数字",helper 帮我按当前 band 缩。

### 3.3 不在 helpers 范围

- ❌ 不做题目文本生成(题干文案属于模板自己)
- ❌ 不做国际化字符串
- ❌ 不做"中文字数控制"或"题目长度自动调节"
- ❌ 不做"按年级挑选数字"(那是模板自己的事,helpers 只提供 band-based 数字范围)

---

## 4. 迁移计划

### 4.1 6 个模板的改动

| # | 文件 | 现状子模板数 | 目标子模板数 | 关键改动 |
|---|---|---|---|---|
| 1 | `shopping.js` | 9 | 9 | 每个子模板加 `band` 字段;`shoppingTemplate.generate` 改用 `levelToBand` |
| 2 | `comparison.js` | 11 | 11 | 同上 |
| 3 | `time.js` | 6 | 6 | 同上 |
| 4 | `chickenRabbit.js` | 9 | 9 | 同上 |
| 5 | `sequence.js` | 8 | 8 | 同上 |
| 6 | `logic.js` | 12 | 12 | 同上 |

每文件统一动:
1. 子模板加 `band` 字段(已有则不动)
2. 子模板的 `generate(rng, difficulty)` → `generate(rng)`
3. 数字范围从 `rng.int(min, max)` → `pickNumberByBand(rng, band, { min, max })`
4. 模板的 `generate(rng, difficulty)` 改为 §2.1 描述的按 band 过滤版本
5. 模板底部加 `assertInRange` 验证 payload 数字在 band 范围内(开发期断言;CI 跑 `numbersInBand.test.js` 时实际生效)

### 4.2 不改的文件

- `src/problemTemplates/index.js` — 接口不变,`APPLICATION_TEMPLATES` / `OLYMPIAD_TEMPLATES` / `templatesFor(type, grade)` 都不动
- `src/strategies/ApplicationStrategy.js` / `OlympiadStrategy.js` — 签名不变,继续传 `difficultyLevel`
- `src/strategies/ProblemGeneratorFactory.js` — 不变
- `src/constants/options.js` — `DIFFICULTY_TO_LEVEL` 不变(模板内部 `levelToBand` 复用同一映射)
- 所有 `*Strategy.test.js` — 不变(API 行为相同,只是数据契约变)

---

## 5. 测试

### 5.1 新增测试

| 文件 | 内容 |
|---|---|
| `tests/problemTemplates/helpers.test.js` | `pickNumberByBand` 在各 band 下值落在预期区间;`pickPairByBand` 两值不等;`levelToBand` 边界值 |
| `tests/problemTemplates/bandCoverage.test.js` | 遍历 `APPLICATION_TEMPLATES + OLYMPIAD_TEMPLATES`,断言每个 template 的 `subtemplates.filter(t => t.band === 'easy').length >= 1`,medium/hard 同 |
| `tests/problemTemplates/numbersInBand.test.js` | 跑 200 次 `template.generate(rng, 1/2/3)`,断言返回的 `payload` 数值 ≤ 模板声明的 band 上限(用 `assertInRange`) |

### 5.2 现有测试(不删)

- `src/problemTemplates/*.test.js` — 每个模板的现有单元测试,验证 shape 正确
- `src/strategies/*Strategy.test.js` — 验证 strategy 调用模板时不抛错

---

## 6. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 现有快照测试断言具体数字,迁移后 RNG 序列变化导致失败 | 现有测试只断言 shape(`{q, a, subtype}` 含特定子串),不断言具体数字;迁移前跑一遍验证 |
| `assertInRange` 在边界值上偶发失败(随机数正好 = max) | helper 取 **半开区间** `[min, max)`,测试断言用 `value < hi` 而非 `<=` |
| `time.js` / `chickenRabbit.js` 拆子模板后总数膨胀 | 接受膨胀(从 3 → 9、1 → 3);后续 A/B/C 模板将基于 helper 写,不会回到膨胀 |
| `pickNumberByBand` 缩放公式让"边界值附近"难以预测 | 文档化缩放表(§3.2),测试覆盖边界 |
| 现有 `pickRandom` 内联在每个模板文件里 | 保留,helpers 不强制全局替换;只新增 `pickPerson` 作为公共入口 |

---

## 7. 显式不在范围

以下功能**不在本 spec**,留到后续子项目:

| 不做 | 留给 |
|---|---|
| 新增任何模板类型(中文经典/应用题广度/奥数深度) | A、B、C |
| 5–6 年级应用题覆盖、1–2 年级奥数覆盖;以及 A/B/C 模板 gradeRange 扩展(不"扩种类") | A(中文经典)、B(应用题广度)、C(奥数深度) |
| UI 按 band 过滤题目 | 后续 UI 子项目 |
| 题目 payload 增加 hints / 解析步骤 | A/B/C 顺手 |
| Strategy 类重构、ProblemGeneratorFactory 优化 | 后续 |

---

## 8. 交付物清单

- 新文件:`src/problemTemplates/helpers.js`(≤ 60 行)
- 新测试:
  - `tests/problemTemplates/helpers.test.js`
  - `tests/problemTemplates/bandCoverage.test.js`
  - `tests/problemTemplates/numbersInBand.test.js`
- 修改 6 个模板文件:
  - `src/problemTemplates/shopping.js`
  - `src/problemTemplates/comparison.js`
  - `src/problemTemplates/time.js`
  - `src/problemTemplates/chickenRabbit.js`
  - `src/problemTemplates/sequence.js`
  - `src/problemTemplates/logic.js`
- 不修改:`index.js`、所有 strategy、factory、`constants/options.js`、UI、router、Strategy 测试
