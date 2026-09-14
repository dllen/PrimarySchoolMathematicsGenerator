# 子项目 C: 奥数深度扩展

**项目**: PrimarySchoolMathematicsGenerator
**日期**: 2026-09-14
**状态**: Draft
**优先级**: 高（A/B/C 子项目的独立一条线）
**前置依赖**: D（helpers.js band 契约）✅ 已完成
**作者**: Codex (brainstorming)

---

## 1. 背景与目标

### 1.1 现状

现有奥数模板：

| 模板 | 内容方向 | 年级 |
|---|---|---|
| `sequence` | 等差、等比、斐波那契、平方、二级等差数列 | 3–6 |
| `logic` | 植树、抽屉、连续求和、周期、还原 | 4–6 |

缺口（经典奥数体系未覆盖）：

| 方向 | 内容 | 难度层级 |
|---|---|---|
| **数论** | 整除性、余数（同余）、质数合数、倍数关系 | medium–hard |
| **排列组合** | 乘法原理、加法原理、排列、组合 | medium–hard |
| **概率初步** | 古典概率、可能性大小比较 | medium–hard |
| **不等式极值** | 和一定差小积大、积一定差小和小 | hard |
| **几何计数** | 数正方形、数线段、数三角形 | easy–hard |
| **逻辑推理进阶** | 真话假话、比赛胜负、密码破译 | medium–hard |

### 1.2 重构目标

| 目标 | 验证手段 |
|---|---|
| 新增 6 个独立模板文件 | PR diff 不与现有文件重名 |
| 所有奥数模板遵循 D band 契约 | `bandCoverage.test.js` 全覆盖 |
| 数论/排列组合/概率生成答案可验证 | `*.test.js` 内置断言 |
| helpers.js 新增组合数学辅助函数 | `helpers.test.js` |

---

## 2. 数据模型（沿用 D 契约）

与 D 契约完全一致，每个模板：

```js
{
  id: 'number-theory-complex',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    { id: 'nt-divisibility', band: 'easy', generate(rng) { ... } },
    { id: 'nt-remainder', band: 'medium', generate(rng) { ... } },
    { id: 'nt-lcm-gcd', band: 'hard', generate(rng) { ... } },
  ],
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
}
```

新增 `subtype` 值：

```js
// constants/options.js 新增
export const QUESTION_TYPES = [
  'arithmetic', 'application', 'olympiad',
  // C 新增：
  'number-theory', 'combinatorics', 'probability',
  'inequality', 'geometry-count', 'logic-advanced',
];
```

---

## 3. 新模板详情

### 3.1 数论 (`numberTheory.js`)

**核心结构**: 整除判断、余数计算、最大公约数/最小公倍数应用。

| 子模板 | band | 年级 | 描述 |
|---|---|---|---|
| `nt-divisible` | easy | 4–5 | 判断一个数能否被 2/3/5/9 整除 |
| `nt-remainder` | easy | 4–5 | 已知被除数和商、余数，求除数 |
| `nt-lcm` | medium | 5 | 已知两个数及其 LCM，求 GCD 或另一数 |
| `nt-gcd-application` | medium | 5–6 | GCD/LCM 实际应用（分糖、分组） |
| `nt-congruence` | hard | 5–6 | 同余方程：x ≡ a (mod n) |
| `nt-puzzle` | hard | 5–6 | 整除综合应用（一个数同时被 3 和 5 整除，余 2）|

**约束**: 所有数论题答案均为整数，不出现负数。

### 3.2 排列组合 (`combinatorics.js`)

**核心结构**: 乘法原理（分步）、加法原理（分类）、排列 $A_n^m$、组合 $C_n^m$。

> `helpers.js` 新增 `factorial(n)`、`perm(n, r)`、`comb(n, r)` 函数用于答案验证。

| 子模板 | band | 年级 | 描述 |
|---|---|---|---|
| `comb-multiplication` | easy | 5 | 乘法原理（3 步，每步可选 2/3/4 种）|
| `comb-addition` | easy | 5 | 加法原理（两条路，各有几种走法）|
| `comb-permutation` | medium | 5–6 | 排列数计算（从 n 个选 r 个排）|
| `comb-combination` | medium | 5–6 | 组合数计算（从 n 选 r，不排队）|
| `comb-probability-link` | hard | 5–6 | 排列组合综合（计数后求概率）|
| `comb-ball` | hard | 5–6 | 摸球问题（不放回组合）|

**约束**:
- n ≤ 6（factorial 内部约束，6!=720）
- 排列/组合结果 ≤ 1000

### 3.3 概率初步 (`probability.js`)

**核心结构**: 古典概率 P = 目标结果数 / 所有可能结果数。

| 子模板 | band | 年级 | 描述 |
|---|---|---|---|
| `prob-coin` | easy | 5 | 抛硬币正面/反面概率 |
| `prob-dice` | easy | 5 | 掷骰子点数概率 |
| `prob-card` | medium | 5–6 | 从纸牌抽特定花色/数字 |
| `prob-compare` | medium | 5–6 | 比较两个事件概率大小 |
| `prob-two-stage` | hard | 5–6 | 两步概率（先抛再抽）|

**约束**: 所有概率题分子分母均为整数，分母 ≤ 100，答案为最简分数。

### 3.4 不等式极值 (`inequality.js`)

**核心结构**: 和一定，差小积大；积一定，差小和小。

| 子模板 | band | 年级 | 描述 |
|---|---|---|---|
| `ineq-sum-product` | hard | 5–6 | 两数之和固定，求乘积最大值 |
| `ineq-product-sum` | hard | 5–6 | 两数之积固定，求和最小值 |
| `ineq-integer` | hard | 5–6 | 两数和为定值，求整数解的乘积范围 |

### 3.5 几何计数 (`geometryCount.js`)

**核心结构**: 在给定网格/线段中数指定图形数量。

| 子模板 | band | 年级 | 描述 |
|---|---|---|---|
| `gc-square-grid` | easy | 4–5 | 在 N×N 方格中数正方形个数 |
| `gc-line-segment` | easy | 4–5 | 在 n 个点上数线段总数 |
| `gc-triangle` | medium | 5–6 | 在平行线组中数三角形 |
| `gc-rectangle` | hard | 5–6 | 在 m×n 网格中数矩形 |

**公式（用于答案验证）**:
- N×N 方格中正方形：$1^2 + 2^2 + ... + N^2 = N(N+1)(2N+1)/6$
- n 个点内线段：$n(n-1)/2$

### 3.6 逻辑推理进阶 (`advancedLogic.js`)

**核心结构**: 真话假话（三人中一人说谎）、比赛胜负推理、密码破译。

| 子模板 | band | 年级 | 描述 |
|---|---|---|---|
| `logic-truth-teller` | medium | 4–5 | 3 人中 1 人说谎，已知每人发言 |
| `logic-tournament` | medium | 5–6 | 已知比赛胜负关系，推出场次 |
| `logic-lock` | hard | 5–6 | 密码破译（数字条件排除）|
| `logic-seating` | hard | 5–6 | 座位排列（条件约束）|

---

## 4. helpers.js 扩展

新增三个数学辅助函数（用于答案验证，不直接暴露给学生）：

| 函数 | 签名 | 用途 |
|---|---|---|
| `factorial` | `(n) => n!` | 排列组合答案验证 |
| `perm` | `(n, r) => n!/(n-r)!` | 排列数 |
| `comb` | `(n, r) => n!/(r!(n-r)!)` | 组合数 |
| `gcd` | `(a, b) => number` | 数论求最大公约数 |
| `lcm` | `(a, b) => a*b/gcd(a,b)` | 最小公倍数 |
| `isPrime` | `(n) => boolean` | 质数判断 |

---

## 5. constants/options.js 变更

```js
// 新增 subtype
export const QUESTION_TYPES = [
  'arithmetic', 'application', 'olympiad',
  'number-theory', 'combinatorics', 'probability',
  'inequality', 'geometry-count', 'logic-advanced',
];
```

---

## 6. index.js 变更

```js
// 新增
import { numberTheoryTemplate } from './numberTheory.js';
import { combinatoricsTemplate } from './combinatorics.js';
import { probabilityTemplate } from './probability.js';
import { inequalityTemplate } from './inequality.js';
import { geometryCountTemplate } from './geometryCount.js';
import { advancedLogicTemplate } from './advancedLogic.js';

// OLYMPIAD_TEMPLATES 扩展
export const OLYMPIAD_TEMPLATES = [
  sequenceTemplate, logicTemplate,
  numberTheoryTemplate, combinatoricsTemplate, probabilityTemplate,
  inequalityTemplate, geometryCountTemplate, advancedLogicTemplate,
];
```

---

## 7. 测试

| 文件 | 内容 |
|---|---|
| `numberTheory.test.js` | 断言 gcd/lcm/整除关系正确 |
| `combinatorics.test.js` | 断言 perm/comb 计算正确 |
| `probability.test.js` | 断言概率值在 [0,1]，分母 ≤ 100 |
| `inequality.test.js` | 断言极值用二次函数/均值不等式验证 |
| `geometryCount.test.js` | 断言计数公式正确（与枚举结果比对）|
| `advancedLogic.test.js` | 断言推理答案与约束条件一致 |
| `helpers.test.js` | 扩展：factorial/perm/comb/gcd/lcm/isPrime |

---

## 8. 显式不在范围

| 不做 | 留给 |
|---|---|
| 奥数几何证明题（需要画图）| 后续版本 |
| 分数/小数奥数专题 | B（应用题广度） |
| 中文经典情境 | A |
| UI 按奥数分支过滤 | UI 子项目 |

---

## 9. 交付物清单

- 新文件：`numberTheory.js`、`combinatorics.js`、`probability.js`、`inequality.js`、`geometryCount.js`、`advancedLogic.js`
- helpers.js 新增 6 个数学函数
- `constants/options.js` 新增 6 个 subtype
- `index.js` 更新 `OLYMPIAD_TEMPLATES`
- 每个新模板对应 `*.test.js`
- `helpers.test.js` 扩展
- `bandCoverage.test.js`、`numbersInBand.test.js` 扩展覆盖新模板
