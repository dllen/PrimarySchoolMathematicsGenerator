# 应用题 / 奥数 题目类型扩展（Batch F）

**项目**: PrimarySchoolMathematicsGenerator
**日期**: 2026-09-16
**状态**: Draft
**优先级**: 中（沿用 A/B/C/D/E 子项目命名风格；本批 = Batch F）
**前置依赖**:
- D（helpers.js band 契约）✅
- B/C 应用/奥数模板调度（`BandAwareStrategy`）✅
- E（应用 5 + 奥数 4 模板扩展）✅
- 反向生成混合策略（`ResultProblemStrategy` / `OperandProblemStrategy`）✅
**作者**: Codex (brainstorming)

---

## 1. 背景与目标

### 1.1 现状

经过 A/B/C/D/E 五批扩展后：

| 类 | 模板数 | 覆盖 |
|---|---|---|
| 算术 | 6 个 strategy | 整数 / 分数 / 小数 / 巧算 / 数字谜 / 单位换算 |
| 应用 | 17 个模板 | 主流场景已覆盖 |
| 奥数 | 12 个模板 | 数论 / 组合 / 概率 / 几何 / 幻方 / 火柴棒 / 抽屉 / 等式变换 |

具体应用/奥数模板见 `src/problemTemplates/index.js` 的 `APPLICATION_TEMPLATES` / `OLYMPIAD_TEMPLATES`。

### 1.2 缺口盘点

对照小学数学教学大纲常见考点，发现以下空白：

**应用题侧**：
- 折扣/优惠（百分比叠加、买几送几）
- 利息/存款（单利）
- 流水行船（顺/逆水速度）
- 火车过桥/隧道（车长+桥长）
- 钟表问题（时针分针夹角）
- 按比例分配（已知总量与比，求各份）
- 平均数（多组加权平均、移多补少）
- 方阵问题（实心方阵/空心方阵）

**奥数侧**：
- 容斥原理（两/三集合重叠）
- 数论进阶（完全平方数、因数个数）
- 染色问题（棋盘/区域染色）
- 最值问题（极端原理）
- 逻辑推理（真假话、条件推理）

**变体侧**（同一题型但问题分支不同）：
- 三变量鸡兔同笼（区别于 2-variable 鸡兔）
- 楼间距/楼梯植树（区别于线性植树）
- 三人/四代同堂年龄（区别于 2 人年龄）
- 环形跑道追及（区别于直道追及）
- 工程归一问题（区别于购物归一）
- 三溶液混合（区别于 2 溶液混合）
- 多重比较（区别于 2 数比较）

### 1.3 目标

新增 **20 个新题目类型**（A 类 13 + D 类 7），覆盖小学课内常见考点与高频思维挑战。

| 目标 | 验证手段 |
|---|---|
| 应用/奥数新增 20 个模板 | `src/problemTemplates/` 新增 20 个文件 + 测试 |
| 所有新模板按 D 契约实现 band 三档 | `bandCoverage.test.js` 覆盖 |
| 13 个 A 类模板覆盖小学课内考点清单 | 单元测试覆盖 happy + edge |
| 7 个 D 类变体与父模板算法分支不同 | 代码 review + payload 字段对比 |
| 不破坏现有 API 与 UI | 现有测试不修改、不退化 |
| 覆盖率保持 ≥ 80% | `npm run test:run` |

---

## 2. 数据模型与契约

### 2.1 模板契约（沿用 D）

```js
{
  id: 'discount',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    { id: 'discount-single',      band: 'easy',   generate(rng) { ... } },
    { id: 'discount-stack',      band: 'medium', generate(rng) { ... } },
    { id: 'discount-buy-get',    band: 'hard',   generate(rng) { ... } },
  ],
  generate(rng, difficultyLevel) { ... }, // 沿用 D helpers.js 的 levelToBand + pickForBand 范式
}
```

每个模板至少 3 个 subtemplates（覆盖 easy/medium/hard）。

### 2.2 返回结构

```js
{
  question: string,
  answer: string,
  subtype: string,        // 与模板 id 对齐，用于 UI 渲染与统计
  payload: { ... },       // 模板自定义字段（如人数、单价、年限等）
}
```

### 2.3 Helpers 扩展

沿用 helpers.js 现有 API，按需新增：

| Helper | 用途 | 使用模板 |
|---|---|---|
| `pickClockTime(rng, band)` | 返回合法 HH:MM，band 控制分钟精度 | clockAngle |
| `pickDiscountRate(rng, band)` | 返回 0.5–0.95 区间的折扣率 | discount |
| `pickSpeedPair(rng, band)` | 返回 2 个合理速度（区间 30–120 km/h） | boatCurrent, distanceCircular, trainBridge |

其余 helper（`pickNumberByBand` / `pickPerson` / `pickPairByBand` / `pickForBand` / `levelToBand`）继续复用，不破坏 D 契约。

---

## 3. 新增清单

### 3.1 A 类 — 经典题型补全（13 个）

| # | 文件 | id | 题型描述 | 年级 | 类别 |
|---|---|---|---|---|---|
| 1 | `discount.js` | `discount` | 打折（8 折/85 折）+ 满减叠加、买几送几 | 5–6 | 应用 |
| 2 | `interest.js` | `interest` | 单利：本金×年利率×年数，求本息和 | 6 | 应用 |
| 3 | `boatCurrent.js` | `boat-current` | 顺水/逆水速度、静水速度与水速 | 5–6 | 应用 |
| 4 | `trainBridge.js` | `train-bridge` | 车长+桥长/隧道，过桥时间与车速 | 5–6 | 应用 |
| 5 | `clockAngle.js` | `clock-angle` | 时针分针夹角、重合、成直线（180°） | 5–6 | 应用 |
| 6 | `proportionDist.js` | `proportion-dist` | 已知总量与比，按比分配各份 | 5–6 | 应用 |
| 7 | `average.js` | `average` | 多组加权平均、移多补少 | 4–6 | 应用 |
| 8 | `formation.js` | `formation` | 实心方阵总人数、周长；空心方阵层数 | 4–6 | 应用 |
| 9 | `inclusionExclusion.js` | `inclusion-exclusion` | 两集合重叠；三集合容斥 | 5–6 | 奥数 |
| 10 | `perfectSquare.js` | `perfect-square` | 完全平方数判定、因数个数 | 4–6 | 奥数 |
| 11 | `coloring.js` | `coloring` | 棋盘染色、区域染色、奇偶格染色 | 5–6 | 奥数 |
| 12 | `extremeValue.js` | `extreme-value` | 极端原理：最大/最小值的存在性 | 5–6 | 奥数 |
| 13 | `logicDeduction.js` | `logic-deduction` | 真假话、条件推理、排除法 | 4–6 | 奥数 |

### 3.2 D 类 — 同一题型变体（7 个）

| # | 文件 | id | 父模板 | 变体说明 | 类别 |
|---|---|---|---|---|---|
| 1 | `chickenRabbit3Var.js` | `chicken-rabbit-3var` | chickenRabbit | 三变量：牛/羊/鸡在 3 个畜栏，3 个方程 | 应用 |
| 2 | `treePlantingBuilding.js` | `tree-planting-building` | treePlanting | 楼间距/楼梯/锯木头（封闭 vs 开放计数） | 应用 |
| 3 | `ageProblemFamily.js` | `age-problem-family` | ageProblem | 三人/四代同堂，父子母子多关系 | 应用 |
| 4 | `distanceCircular.js` | `distance-circular` | distance | 环形跑道追及、相遇次数 | 应用 |
| 5 | `unitaryWork.js` | `unitary-work` | unitary | 工程归一：工效 × 时间 = 工作量 | 应用 |
| 6 | `concentrationTriple.js` | `concentration-triple` | concentration | 三溶液混合、三浓度配比 | 应用 |
| 7 | `comparisonMulti.js` | `comparison-multi` | comparison | 多重比较：3 个及以上对象排序 | 应用 |

---

## 4. 注册与集成

### 4.1 `src/problemTemplates/index.js`

```js
// A 类
import { discountTemplate } from './discount.js';
import { interestTemplate } from './interest.js';
import { boatCurrentTemplate } from './boatCurrent.js';
import { trainBridgeTemplate } from './trainBridge.js';
import { clockAngleTemplate } from './clockAngle.js';
import { proportionDistTemplate } from './proportionDist.js';
import { averageTemplate } from './average.js';
import { formationTemplate } from './formation.js';
import { inclusionExclusionTemplate } from './inclusionExclusion.js';
import { perfectSquareTemplate } from './perfectSquare.js';
import { coloringTemplate } from './coloring.js';
import { extremeValueTemplate } from './extremeValue.js';
import { logicDeductionTemplate } from './logicDeduction.js';

// D 类
import { chickenRabbit3VarTemplate } from './chickenRabbit3Var.js';
import { treePlantingBuildingTemplate } from './treePlantingBuilding.js';
import { ageProblemFamilyTemplate } from './ageProblemFamily.js';
import { distanceCircularTemplate } from './distanceCircular.js';
import { unitaryWorkTemplate } from './unitaryWork.js';
import { concentrationTripleTemplate } from './concentrationTriple.js';
import { comparisonMultiTemplate } from './comparisonMulti.js';

export const APPLICATION_TEMPLATES = [
  ...existing,
  // A 类 - 应用
  discountTemplate, interestTemplate, boatCurrentTemplate, trainBridgeTemplate,
  clockAngleTemplate, proportionDistTemplate, averageTemplate, formationTemplate,
  // D 类 - 应用变体
  chickenRabbit3VarTemplate, treePlantingBuildingTemplate, ageProblemFamilyTemplate,
  distanceCircularTemplate, unitaryWorkTemplate, concentrationTripleTemplate,
  comparisonMultiTemplate,
];

export const OLYMPIAD_TEMPLATES = [
  ...existing,
  // A 类 - 奥数
  inclusionExclusionTemplate, perfectSquareTemplate, coloringTemplate,
  extremeValueTemplate, logicDeductionTemplate,
];
```

### 4.2 `src/constants/options.js`

```js
export const QUESTION_TYPES = [
  ...existing,
  // Batch F: A 类 - 应用 (8)
  'discount', 'interest', 'boat-current', 'train-bridge',
  'clock-angle', 'proportion-dist', 'average', 'formation',
  // Batch F: A 类 - 奥数 (5)
  'inclusion-exclusion', 'perfect-square', 'coloring',
  'extreme-value', 'logic-deduction',
  // Batch F: D 类 - 应用变体 (7)
  'chicken-rabbit-3var', 'tree-planting-building', 'age-problem-family',
  'distance-circular', 'unitary-work', 'concentration-triple',
  'comparison-multi',
];
```

### 4.3 UI 折叠（QuestionTypePicker.vue）

沿用 Batch C/E 的 `kind: 'group'` 折叠模式，把 D 变体归并到父类分组：

```js
{ kind: 'group', label: '鸡兔同笼',
  children: ['chicken-rabbit-complex', 'chicken-rabbit-3var'] }
{ kind: 'group', label: '植树问题',
  children: ['tree-planting', 'tree-planting-building'] }
{ kind: 'group', label: '年龄问题',
  children: ['age-problem', 'age-problem-family'] }
{ kind: 'group', label: '行程问题',
  children: ['distance', 'distance-circular', 'boat-current', 'train-bridge'] }
{ kind: 'group', label: '归一问题',
  children: ['unitary', 'unitary-work'] }
{ kind: 'group', label: '浓度配比',
  children: ['concentration', 'concentration-triple'] }
{ kind: 'group', label: '比较问题',
  children: ['comparison', 'comparison-multi'] }
{ kind: 'group', label: '钟表/方阵',
  children: ['clock-angle', 'formation'] }
```

新单题型（A 类未分组的）直接在 `QUESTION_TYPES` 列表中可见。

### 4.4 测试同步

| 新文件 | 测试文件 |
|---|---|
| `discount.js` | `discount.test.js` |
| `interest.js` | `interest.test.js` |
| `boatCurrent.js` | `boatCurrent.test.js` |
| `trainBridge.js` | `trainBridge.test.js` |
| `clockAngle.js` | `clockAngle.test.js` |
| `proportionDist.js` | `proportionDist.test.js` |
| `average.js` | `average.test.js` |
| `formation.js` | `formation.test.js` |
| `inclusionExclusion.js` | `inclusionExclusion.test.js` |
| `perfectSquare.js` | `perfectSquare.test.js` |
| `coloring.js` | `coloring.test.js` |
| `extremeValue.js` | `extremeValue.test.js` |
| `logicDeduction.js` | `logicDeduction.test.js` |
| `chickenRabbit3Var.js` | `chickenRabbit3Var.test.js` |
| `treePlantingBuilding.js` | `treePlantingBuilding.test.js` |
| `ageProblemFamily.js` | `ageProblemFamily.test.js` |
| `distanceCircular.js` | `distanceCircular.test.js` |
| `unitaryWork.js` | `unitaryWork.test.js` |
| `concentrationTriple.js` | `concentrationTriple.test.js` |
| `comparisonMulti.js` | `comparisonMulti.test.js` |

同步更新：
- `src/problemTemplates/bandCoverage.test.js`：新增 20 个模板的 band 覆盖测试
- `src/problemTemplates/diversity.test.js`：新增 20 个模板的 diversity 验证
- `src/constants/options.test.js`：新增 20 个 question type 断言

---

## 5. 风险与权衡

### 5.1 钟表问题的角度计算

钟表问题角度公式：`θ = |30·H - 5.5·M|`（H 为小时，M 为分钟）。**约束**：
- 只生成整数角度的题目（避开浮点精度坑）
- 答案统一保留角度数值（如 `90°`），不画图

### 5.2 完全平方数与因数个数

生成时需要 `isPerfectSquare` 与 `countDivisors` 的整数运算。**约束**：
- 完全平方数范围限定为 `[1, 144]`（1² 到 12²）
- 因数个数限定为 `[1, 100]` 内的合数，避免生成超大数

### 5.3 火车过桥的整数约束

过桥时间 = (桥长 + 车长) / 车速。**约束**：
- 强制整除：若车速 × 时间 ≠ 桥长 + 车长，重试（最多 20 次）
- 测试断言：随机生成 50 题，验证整除无遗漏

### 5.4 三变量鸡兔同笼

三变量需要 3 个方程才能唯一解。**约束**：
- 总是使用「3 个方程」的标准形式（头数、腿数、某种扩展条件如总价值）
- 保证解为非负整数
- 重试机制：解非整数时重试（最多 50 次）

### 5.5 染色问题的可视化

染色问题通常需要棋盘图形辅助。**约束**：
- 本批只用文字描述（"如图，4×4 棋盘..."），不画图
- 题目结构保持自包含：「将一个 4×4 棋盘黑白交替染色，至少需几格才能保证出现相邻同色？」

### 5.6 测试覆盖率门槛

`vitest.config.js` 阈值 80%。新增 20 个文件，每个文件至少 5 个 `it`（happy + edge），整体覆盖率会上升而非下降。无需调整阈值。

---

## 6. 实施拆分（提交粒度）

按 brainstorming skill 要求进入 `writing-plans` 后落地。预估拆分：

| 阶段 | 内容 | 涉及文件数 |
|---|---|---|
| Plan F.0 | helpers.js 扩展（pickClockTime / pickDiscountRate / pickSpeedPair）+ 测试 | 2 |
| Plan F.1 | A 类 8 个应用模板 + 测试（discount, interest, boatCurrent, trainBridge, clockAngle, proportionDist, average, formation） | 16 |
| Plan F.2 | A 类 5 个奥数模板 + 测试（inclusionExclusion, perfectSquare, coloring, extremeValue, logicDeduction） | 10 |
| Plan F.3 | D 类 7 个应用变体模板 + 测试 | 14 |
| Plan F.4 | 注册：`problemTemplates/index.js` + `constants/options.js` + 折叠分组 + 测试 | 4 |
| Plan F.5 | 端到端验证：build + test:run + 启动 dev 抽检 | 0（验证） |

可独立提交，也可合并为一个大 PR（按用户偏好选择）。

---

## 7. 不在范围

- UI 大改：ConfigWizard / GeneratorView 不重构，仅追加 QUESTION_TYPES 与折叠分组
- Strategy 类改造：A + D 全是模板，沿用 `ApplicationStrategy` / `OlympiadStrategy`
- 渲染层增强：钟表、方阵、棋盘题目只用文字描述，不画图
- DSL 引擎扩展
- 数据迁移（IndexedDB schema 不变）
- 国际化（题干仍为中文）

---

## 8. 验收标准

1. `npm run test:run` 全绿，覆盖率 ≥ 80%
2. `npm run build` 成功，无新增 warning
3. `npm run dev` 启动后，在控制台切换「自定义配置 → 应用题 / 奥数」能看到新题型被生成
4. 20 个新模板至少各 5 个单元测试，覆盖 happy + edge + band 缩放
5. `bandCoverage.test.js` 覆盖 20 个新模板
6. `diversity.test.js` 验证 20 个新模板的 subtype 不重复
7. 现有测试不修改、不退化
