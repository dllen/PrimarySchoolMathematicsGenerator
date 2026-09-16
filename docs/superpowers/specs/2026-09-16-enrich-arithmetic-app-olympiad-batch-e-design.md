# 算术 / 应用 / 奥数 题目类型扩展（Batch E）

**项目**: PrimarySchoolMathematicsGenerator
**日期**: 2026-09-16
**状态**: Draft
**优先级**: 中（沿用 A/B/C/D 子项目命名风格；本批 = Batch E）
**前置依赖**:
- D（helpers.js band 契约）✅
- B/C 应用/奥数模板调度（`BandAwareStrategy`）✅
- 反向生成混合策略（`ResultProblemStrategy` / `OperandProblemStrategy`）✅
**作者**: Codex (brainstorming)

---

## 1. 背景与目标

### 1.1 现状

经过 Plan A（2026-09-14a）/ B（b）/ C（c）/ D（d）四批扩展后：

| 类 | 模板数 | 覆盖 |
|---|---|---|
| 算术 | 2 个内部策略 | 仅整数四则 + 括号，**缺分数/小数/巧算/数字谜/单位换算** |
| 应用 | 17 个模板 | 主流场景已覆盖，**缺经典小学题型（植树/盈亏/年龄/归一/还原）** |
| 奥数 | 8 个模板 | 已拓展数论/概率/组合深度，**缺经典思维挑战（幻方/火柴棒/等式变换/抽屉原理）** |

### 1.2 目标

新增 **13 个新题目类型**（算术 4 + 应用 5 + 奥数 4），让三类题目在广度上对齐小学数学教学大纲的常见考点。

| 目标 | 验证手段 |
|---|---|
| 算术新增 4 种题型变体 | `src/strategies/` 新增 4 个 strategy 文件 + 单元测试 |
| 应用新增 5 个经典题型模板 | `src/problemTemplates/` 新增 5 个文件 + 测试 |
| 奥数新增 4 个思维挑战模板 | `src/problemTemplates/` 新增 4 个文件 + 测试 |
| 所有新模板按 D 契约实现 band 三档 | `bandCoverage.test.js` 覆盖 |
| 所有新增题型可由 `ProblemGeneratorFactory.createStrategy()` 调用 | 工厂测试覆盖 |
| 不破坏现有 API 与 UI（ConfigWizard/QuestionTypePicker 不动） | 现有测试不修改 |
| 覆盖率保持 ≥ 80% | `npm run test:run` |

---

## 2. 数据模型与契约

### 2.1 算术：新 strategy 类

算术题目变体与现有 `ResultProblemStrategy`（整数求结果）/`OperandProblemStrategy`（整数求运算项）算法差异显著，需要独立的 strategy 类。

```js
// src/strategies/DigitPuzzleStrategy.js
export class DigitPuzzleStrategy extends ProblemGeneratorStrategy {
  generate(rng) {
    // 约束求解：随机生成 □ + □ = 两数和 的形式，
    // 或 □ × □ = 积 的形式；逐位求解并保证解唯一
    return { expression, answer, subtype: 'digit-puzzle', payload: { ... } };
  }
}
```

类似地：`QuickMathStrategy` / `FractionArithmeticStrategy` / `DecimalArithmeticStrategy`。

### 2.2 应用/奥数：模板契约（沿用 D）

```js
{
  id: 'tree-planting',
  gradeRange: ['3', '4', '5'],
  semester: 'all',
  subtemplates: [
    { id: 'tree-both-ends', band: 'easy', generate(rng) { ... } },
    { id: 'tree-one-end',   band: 'medium', generate(rng) { ... } },
    { id: 'tree-circular',  band: 'hard', generate(rng) { ... } },
  ],
  generate(rng, difficultyLevel) { ... }, // 沿用 D helpers.js 的 levelToBand + 过滤 + pickForBand 范式
}
```

每个模板至少 3 个 subtemplates（覆盖 easy/medium/hard）。

---

## 3. 新增清单

### 3.1 算术（4 个新 strategy + 测试）

| # | 名称 | 文件 | 题型描述 | 年级 |
|---|---|---|---|---|
| 1 | 数字谜 □ | `DigitPuzzleStrategy.js` | 形如 `□ + □5 = 81` 逆推填空，每道题解唯一 | 3–6 |
| 2 | 巧算 | `QuickMathStrategy.js` | 凑十/凑百/凑整，把数变形成整十/整百后速算 | 2–4 |
| 3 | 分数运算 | `FractionArithmeticStrategy.js` | 同分母加减；异分母约分后加减；分数 × 整数 | 5–6 |
| 4 | 小数运算 | `DecimalArithmeticStrategy.js` | 1–2 位小数加减乘（除法不引入，避免精度坑） | 4–6 |

**算术契约**：
- 每个 strategy 必须实现 `generate(rng)`，返回 `{ expression, answer, subtype, payload }`
- 接受 `rng` 参数（即使内部用 `Math.random`，接口对齐 `BandAwareStrategy`）
- `subtype` 形如 `arithmetic-digit-puzzle` / `arithmetic-quick-math` / `arithmetic-fraction` / `arithmetic-decimal`
- 题目字符串使用 `□` 表示填空处（数字谜）；分数使用 `a/b`；小数保留末尾 0

### 3.2 应用（5 个新模板 + 测试）

| # | 名称 | 文件 | 题型描述 | 年级 |
|---|---|---|---|---|
| 1 | 植树问题 | `treePlanting.js` | 两端都栽 / 两端不栽 / 环形，三子模板 | 3–6 |
| 2 | 盈亏问题 | `profitLoss.js` | 少分配类 / 多分配类，三子模板 | 4–6 |
| 3 | 年龄问题 | `ageProblem.js` | 年龄差不变 / 几年前后，三子模板 | 4–6 |
| 4 | 归一问题 | `unitary.js` | 先求单一量再求总量，三子模板 | 3–5 |
| 5 | 还原问题 | `reverse.js` | 倒推法求初始量，三子模板 | 4–6 |

**应用模板契约**（沿用 D）：
- 模板结构：`{ id, gradeRange, semester, subtemplates, generate(rng, difficultyLevel) }`
- 每个模板至少 3 个 subtemplate（easy/medium/hard）
- `band` 来自 `helpers.js` 的 `levelToBand()`
- 使用 `pickNumberByBand` / `pickPerson` / `pickPairByBand` 等 helpers（必要时新增 helper）

### 3.3 奥数（4 个新模板 + 测试）

| # | 名称 | 文件 | 题型描述 | 年级 |
|---|---|---|---|---|
| 1 | 幻方 | `magicSquare.js` | 三阶幻方（给定部分数，求剩余）/四阶幻方（较简单结构） | 4–6 |
| 2 | 火柴棒 | `matchstick.js` | 移动/添加/移除一根火柴使等式成立 | 3–6 |
| 3 | 等式变换 | `equationTransform.js` | 保持等式成立的数字重排（如 12+34=46 改成 12+36=48） | 4–6 |
| 4 | 抽屉原理 | `pigeonhole.js` | 鸽巢原理应用题（袜子/座位/抽屉类） | 5–6 |

**奥数契约**：同应用模板。

---

## 4. 注册与集成

### 4.1 `src/problemTemplates/index.js`

```js
// 新增应用模板
import { treePlantingTemplate } from './treePlanting.js';
import { profitLossTemplate } from './profitLoss.js';
import { ageProblemTemplate } from './ageProblem.js';
import { unitaryTemplate } from './unitary.js';
import { reverseTemplate } from './reverse.js';

// 新增奥数模板
import { magicSquareTemplate } from './magicSquare.js';
import { matchstickTemplate } from './matchstick.js';
import { equationTransformTemplate } from './equationTransform.js';
import { pigeonholeTemplate } from './pigeonhole.js';

export const APPLICATION_TEMPLATES = [
  ...existing,
  treePlantingTemplate, profitLossTemplate, ageProblemTemplate,
  unitaryTemplate, reverseTemplate,
];

export const OLYMPIAD_TEMPLATES = [
  ...existing,
  magicSquareTemplate, matchstickTemplate,
  equationTransformTemplate, pigeonholeTemplate,
];
```

### 4.2 `src/strategies/ProblemGeneratorFactory.js`

```js
import { DigitPuzzleStrategy } from './DigitPuzzleStrategy.js';
import { QuickMathStrategy } from './QuickMathStrategy.js';
import { FractionArithmeticStrategy } from './FractionArithmeticStrategy.js';
import { DecimalArithmeticStrategy } from './DecimalArithmeticStrategy.js';

static createStrategy(type, config) {
  switch (type) {
    ...existing cases
    case 'digit-puzzle':           return new DigitPuzzleStrategy(config);
    case 'quick-math':             return new QuickMathStrategy(config);
    case 'fraction-arithmetic':    return new FractionArithmeticStrategy(config);
    case 'decimal-arithmetic':     return new DecimalArithmeticStrategy(config);
    default: throw ...
  }
}

static getSupportedTypes() {
  return [
    ...existing,
    'digit-puzzle', 'quick-math',
    'fraction-arithmetic', 'decimal-arithmetic',
  ];
}
```

### 4.3 `src/constants/options.js`

```js
export const QUESTION_TYPES = [
  ...existing,
  // Batch E: 算术变体
  'digit-puzzle', 'quick-math',
  'fraction-arithmetic', 'decimal-arithmetic',
];
```

注意：UI 层的 `ConfigWizard.vue` 与 `QuestionTypePicker.vue` **不修改**——它们只展示 3 个主类型（`arithmetic`/`application`/`olympiad`），新模板与变体作为「高级配置」走 `PresetManager` / `questionTypes` 数组，已与 A/B/C 风格一致。

### 4.4 测试同步

| 新文件 | 测试文件 |
|---|---|
| `DigitPuzzleStrategy.js` | `DigitPuzzleStrategy.test.js` |
| `QuickMathStrategy.js` | `QuickMathStrategy.test.js` |
| `FractionArithmeticStrategy.js` | `FractionArithmeticStrategy.test.js` |
| `DecimalArithmeticStrategy.js` | `DecimalArithmeticStrategy.test.js` |
| `treePlanting.js` | `treePlanting.test.js` |
| `profitLoss.js` | `profitLoss.test.js` |
| `ageProblem.js` | `ageProblem.test.js` |
| `unitary.js` | `unitary.test.js` |
| `reverse.js` | `reverse.test.js` |
| `magicSquare.js` | `magicSquare.test.js` |
| `matchstick.js` | `matchstick.test.js` |
| `equationTransform.js` | `equationTransform.test.js` |
| `pigeonhole.js` | `pigeonhole.test.js` |

同步更新：
- `src/strategies/ProblemGeneratorFactory.test.js`：新增 4 个 mode 的工厂测试
- `src/constants/options.test.js`：新增 4 个 question type 断言
- `src/problemTemplates/bandCoverage.test.js`：新增 13 个模板的 band 覆盖测试
- `src/problemTemplates/diversity.test.js`：新增 13 个模板的 diversity 验证

---

## 5. 风险与权衡

### 5.1 算术变体的实现复杂度

| Strategy | 算法复杂度 | 备注 |
|---|---|---|
| DigitPuzzle | 中 | 约束求解（回溯枚举 + 唯一性校验），必须保证解唯一 |
| QuickMath | 低 | 在 ResultProblemStrategy 基础上加凑整逻辑 |
| Fraction | 中 | 需要 GCD 约分（helpers 已有）+ 通分；用字符串表达，避免浮点 |
| Decimal | 中低 | 整数化处理（如 0.5+0.3 → 5+3, ÷10），避免 `0.1+0.2≠0.3` |

**对策**：分数/小数 strategy 内部使用整数（最小公倍数 / 10 的幂）计算，仅在字符串拼接时插入 `/` 或 `.`。

### 5.2 数字谜解的唯一性

数字谜生成容易产出多解或无解。**强制约束**：
- 验证函数：解集合大小必须为 1，否则重试（最多 50 次）
- 测试断言：随机生成 100 题，验证每题解唯一

### 5.3 奥数题目的题干可读性

幻方、火柴棒题目涉及特殊字符（`□`、`‖`、`＋`）。**约束**：
- 仅使用通用 Unicode（`□` U+25A1），不依赖字体
- 火柴棒题目用文字描述「移动最左边的 1 到等号右边，使等式成立」而不画图
- 测试中显式断言字符集

### 5.4 测试覆盖率门槛

`vitest.config.js` 阈值 80%。新增 13 个文件，每个文件至少 5 个 `it`（happy + edge），整体覆盖率会上升而非下降。无需调整阈值。

---

## 6. 实施拆分（提交粒度）

按 brainstorming skill 要求进入 `writing-plans` 后落地。预估拆分：

| 阶段 | 内容 | 涉及文件数 |
|---|---|---|
| Plan E.1 | helpers.js 扩展（如需要新增 fraction/decimal helper）+ 测试 | 1–2 |
| Plan E.2 | 算术 4 个新 strategy + 测试 | 8 |
| Plan E.3 | 应用 5 个新模板 + 测试 | 10 |
| Plan E.4 | 奥数 4 个新模板 + 测试 | 8 |
| Plan E.5 | 工厂/常量注册 + 测试 | 3 |
| Plan E.6 | 端到端验证：build + test:run + 启动 dev 抽检 | 0（验证） |

可独立提交，也可合并为一个大 PR（按用户偏好选择）。

---

## 7. 不在范围

- UI 层（ConfigWizard / QuestionTypePicker）的题型下拉新增菜单
- PDF 排版样式适配新题型（如数字谜的方框渲染）
- DSL 引擎扩展
- 数据迁移（IndexedDB schema 不变）
- 国际化（题干仍为中文）

---

## 8. 验收标准

1. `npm run test:run` 全绿，覆盖率 ≥ 80%
2. `npm run build` 成功，无新增 warning
3. `npm run dev` 启动后，在控制台切换「自定义配置 → 应用题 / 奥数 / 算术」能看到新题型被生成
4. 新增 4 个算术 mode 可被 `ProblemGeneratorFactory.create({ mode: 'digit-puzzle' })` 等调用
5. 13 个新模板至少各 5 个单元测试
6. 现有测试不修改、不退化
