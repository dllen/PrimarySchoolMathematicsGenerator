# 子项目 B: 应用题广度扩展

**项目**: PrimarySchoolMathematicsGenerator
**日期**: 2026-09-14
**状态**: Draft
**优先级**: 高（A/B/C 子项目的独立一条线）
**前置依赖**: D（helpers.js band 契约）✅ 已完成
**作者**: Codex (brainstorming)

---

## 1. 背景与目标

### 1.1 现状

现有应用题模板覆盖：

| 模板 | 题型方向 | 年级 | 步数 |
|---|---|---|---|
| `shopping` | 购物 | 1–4 | 单步 |
| `time` | 时间推算 | 1–4 | 单步 |
| `comparison` | 比较、身高、年龄 | 2–5 | 单步 |
| `chickenRabbit` | 鸡兔同笼及变种 | 3–6 | 多步 |

缺口：
1. **工程问题**（工作效率×时间=工作量）— 全新结构
2. **浓度问题**（溶质/溶液比）— 全新结构
3. **行程问题**（相遇、追及）— 比 `time.js` 复杂得多
4. **分配比例**（按比分配物品）— 全新结构
5. **统计问题**（平均数、条形统计图）— 全新结构
6. **1–2 年级简单版**应用题 — 年级覆盖缺口
7. **5–6 年级多步骤版** — 年级覆盖缺口

### 1.2 重构目标

| 目标 | 验证手段 |
|---|---|
| 新增 5 个独立模板文件（工程/浓度/行程/比例/统计） | 不改现有模板文件 |
| 1–2 年级有至少 2 个简单版应用题子模板 | `bandCoverage.test.js` 扩展 |
| 5–6 年级有至少 2 个多步骤版子模板 | 同上 |
| 新模板遵循 D 的 band 契约 | `helpers.test.js` 复用 |
| 新增知识点分类映射到 `knowledgePoints.js` | 不改现有知识点结构 |

---

## 2. 数据模型（沿用 D 契约）

新模板与 D 契约完全一致：

```js
{
  id: 'engineering-complex',
  gradeRange: ['3', '4', '5', '6'],   // 视具体模板而定
  semester: 'all',
  subtemplates: [
    {
      id: 'engineering-basic',
      band: 'easy',  // ★ 必有
      generate(rng) {  // ★ 无 difficulty 参数
        // 使用 pickNumberByBand、pickPerson
        return { question, answer, subtype: 'engineering', payload };
      },
    },
  ],
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
}
```

新增 `subtype` 值（须同步到 `constants/options.js` 的 `QUESTION_TYPES` 扩展）：

```js
// constants/options.js 新增
export const QUESTION_TYPES = [
  'arithmetic', 'application', 'olympiad',
  // B 新增：
  'engineering', 'concentration', 'distance',
  'ratio', 'statistics',
];
```

---

## 3. 新模板详情

### 3.1 工程问题 (`engineering.js`)

**核心结构**: 工作效率 × 工作时间 = 工作总量；或 工作总量 ÷ 工作时间 = 工作效率。

| 子模板 | band | 年级 | 描述 |
|---|---|---|---|
| `engineering-single` | easy | 3–4 | 已知两人各自工作效率，求总量 |
| `engineering-together` | medium | 4–5 | 两人合作，求时间 |
| `engineering-complete` | medium | 4–5 | 已知总量和时间，求效率 |
| `engineering-three` | hard | 5–6 | 三人合作效率不同，求时间 |
| `engineering-shift` | hard | 5–6 | 分阶段施工（先甲后乙） |

**数字范围**（由 `pickNumberByBand` 缩放）：
- `easy`: 工作效率 1–5 单位/小时，人数 2
- `medium`: 工作效率 2–10，人数 2–3
- `hard`: 工作效率 3–20，人数 2–3，工作量 50–200

### 3.2 浓度问题 (`concentration.js`)

**核心结构**: 溶质质量 / 溶液质量 = 浓度；溶质不变原则（加水/加糖不变）。

| 子模板 | band | 年级 | 描述 |
|---|---|---|---|
| `concentration-basic` | easy | 5–6 | 已知溶质和溶液质量，求浓度 |
| `concentration-find-solute` | easy | 5–6 | 已知浓度和溶液质量，求溶质 |
| `concentration-dilute` | medium | 5–6 | 加水稀释，溶质不变 |
| `concentration-mix` | hard | 5–6 | 两种溶液混合 |
| `concentration-evaporate` | hard | 5–6 | 蒸发水分，溶质不变 |

**约束**: 浓度一律用百分数表示，范围 easy: 5%–20%，medium: 10%–40%，hard: 15%–60%。

### 3.3 行程问题 (`distance.js`)

**核心结构**: 路程 = 速度 × 时间；相遇（路程和）、追及（路程差）。

> `time.js` 已有简单"再过 N 小时是几点"，`distance.js` 专门处理速度/路程/时间的关系。

| 子模板 | band | 年级 | 描述 |
|---|---|---|---|
| `distance-basic` | easy | 3–4 | 已知速度和时间，求路程 |
| `distance-meet` | medium | 4–5 | 两人相向而行，求相遇时间 |
| `distance-chase` | medium | 4–5 | 两人同向，追及问题 |
| `distance-round` | hard | 5–6 | 环形跑道相遇问题 |
| `distance-bus` | hard | 5–6 | 公交车发车间隔（升级版 time-bus-schedule）|

**数字范围**: 速度 easy: 30–80 m/min，medium: 50–120 m/min，hard: 60–200 m/min。

### 3.4 分配比例 (`ratio.js`)

**核心结构**: 按比分配总量（设公比 k），或已知部分和比求原数。

| 子模板 | band | 年级 | 描述 |
|---|---|---|---|
| `ratio-distribute` | easy | 4–5 | 按 1:2 分糖/苹果等 |
| `ratio-scale` | medium | 4–5 | 已知部分量，求总量（知小求大） |
| `ratio-combine` | medium | 5–6 | 两份混合后新比 |
| `ratio-partnership` | hard | 5–6 | 两人出钱做生意，按比分成 |

**约束**: 比值均为整数，最简比（最大公约数为 1）。

### 3.5 统计问题 (`statistics.js`)

**核心结构**: 平均数 = 总数 ÷ 个数；条形统计图（读图+计算）。

| 子模板 | band | 年级 | 描述 |
|---|---|---|---|
| `statistics-mean` | easy | 3–4 | 3–5 个数求平均数 |
| `statistics-mean-reverse` | medium | 4–5 | 已知平均数和个数，求总数 |
| `statistics-chart-read` | medium | 4–5 | 从给定数据读条形图，说出最高/最低 |
| `statistics-mean-compare` | hard | 5–6 | 两组平均数比较 |

**约束**: 统计数据不超过 10 个数，数值范围 easy: 10–50，medium: 20–80，hard: 30–100。

## 4. 1–2 年级简单版

`shopping.js` / `time.js` / `comparison.js` 各自新增 1–2 年级子模板：

- `shopping-counting`: easy band，只用 1–10 的数，加法（不用找零）
- `time-clock-face`: easy band，整点半点（不用推算"再过"）
- `comparison-fewer-more`: easy band，10 以内谁多谁少

这些子模板 `gradeRange` 设为 `['1', '2']`。

---

## 5. helpers.js 扩展

`helpers.js` 新增两个辅助函数：

| 函数 | 签名 | 用途 |
|---|---|---|
| `pickTwoSpeeds` | `(rng, band) => { speed1, speed2 }` | 行程问题，保证 speed1 ≠ speed2 |
| `pickRatio` | `(rng, band) => { a, b }` | 分配比例，保证 gcd(a,b)=1 |

---

## 6. constants/options.js 变更

```js
// 新增 subtype
export const QUESTION_TYPES = [
  'arithmetic', 'application', 'olympiad',
  'engineering', 'concentration', 'distance',
  'ratio', 'statistics',
];
```

---

## 7. index.js 变更

```js
// 新增
import { engineeringTemplate } from './engineering.js';
import { concentrationTemplate } from './concentration.js';
import { distanceTemplate } from './distance.js';
import { ratioTemplate } from './ratio.js';
import { statisticsTemplate } from './statistics.js';

// APPLICATION_TEMPLATES 扩展
export const APPLICATION_TEMPLATES = [
  shoppingTemplate, timeTemplate, comparisonTemplate, chickenRabbitTemplate,
  engineeringTemplate, concentrationTemplate, distanceTemplate, ratioTemplate, statisticsTemplate,
];
```

---

## 8. 测试

| 文件 | 内容 |
|---|---|
| `tests/problemTemplates/engineering.test.js` | 断言总量 = 效率 × 时间 |
| `tests/problemTemplates/concentration.test.js` | 断言溶质 = 浓度 × 溶液 |
| `tests/problemTemplates/distance.test.js` | 断言相遇时路程和/追及时路程差 |
| `tests/problemTemplates/ratio.test.js` | 断言分配后各部分之和 = 总量 |
| `tests/problemTemplates/statistics.test.js` | 断言平均数计算正确 |
| `bandCoverage.test.js` | 扩展：每个新模板三 band 各 ≥ 1 子模板 |
| `numbersInBand.test.js` | 扩展：每个新模板各难度生成 200 次 |

---

## 9. 显式不在范围

| 不做 | 留给 |
|---|---|
| 新增奥数题型（数论/排列组合/概率） | C |
| UI 按知识点过滤题目 | UI 子项目 |
| 中文经典情境（分糖/划船等）| A |
| 错题本、收藏功能 | 后续版本 |

---

## 10. 交付物清单

- 新文件：`engineering.js`、`concentration.js`、`distance.js`、`ratio.js`、`statistics.js`
- helpers.js 新增 `pickTwoSpeeds`、`pickRatio`
- `constants/options.js` 新增 5 个 subtype
- `index.js` 更新 `APPLICATION_TEMPLATES`
- 每个新模板对应 `*.test.js`
- `bandCoverage.test.js`、`numbersInBand.test.js` 扩展覆盖新模板
