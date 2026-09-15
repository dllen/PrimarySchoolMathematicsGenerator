# Math DSL Engine MVP — Core 引擎 + JSON 模板

**项目**: PrimarySchoolMathematicsGenerator
**日期**: 2026-09-15
**状态**: Draft
**优先级**: 高（开启 v2-tech-docs 落地第一步）
**前置依赖**: BandAwareStrategy ✅ 已完成（commit a278ce9）
**作者**: Codex (brainstorming)
**关联**: v2-tech-docs/ 三份文档（5840 行）

---

## 1. 背景与目标

### 1.1 现状

- 28 个手写 JS 模板（5125 行）位于 `src/problemTemplates/`，每个文件混合了"随机数生成 + 数学计算 + 字符串渲染 + 题型逻辑"
- 5 个 Strategy 类位于 `src/strategies/`，`ProblemGeneratorFactory` 作为统一入口
- 已完成 `BandAwareStrategy` 基类抽取（commit 10798bd / aa6c311 / a278ce9），模板内部仍耦合
- `v2-tech-docs/` 三份文档定义了目标 DSL 形态、变量依赖规则、MVP 范围（用户已落盘到仓库根）

### 1.2 重构目标

| 目标 | 验证手段 |
|---|---|
| 建立独立 `src/core/` 子系统 | 单元测试 + `ProblemGeneratorFactory` 兼容接入 |
| 引入 JSON 模板描述 | 3 个示范 JSON 模板落地到 `src/templates/` |
| 引入 seedable RNG | `random.test.js` 同 seed 必同序列 |
| `ProblemGeneratorFactory` 兼容：新增 `dsl` strategy | UI 端 GeneratorView 不改；测试覆盖 |
| 不破坏现有测试（基线 876 通过 + 2 个 HistoryView 失败不属本 PR） | `npm run test:run` 前后对比 |
| 覆盖率不下降（80% 阈值）| c8 报告 |

### 1.3 非目标（本期不做）

- 迁移全部 28 个模板到 JSON（只迁 docs MVP 中 3 个示范）
- 引入 TypeScript（保持 JS + JSDoc 注解）
- 删除任何现有模板或策略
- LLM 润色（docs §27 第四阶段）
- 50+ 奥数算法（docs §26 第三阶段）
- Proof Tree / Reverse Generation（docs §26 第三阶段；鸡兔同笼反推留 TODO 占位）

---

## 2. 目录结构

新增路径（**纯新增，不删不改**）：

```
src/
  core/
    random.js              # SeedableRNG（mulberry32）+ 采样器
    random.test.js
    expression.js          # Expression 求值器
    expression.test.js
    dependency.js          # 变量 DAG + 拓扑排序 + 循环检测
    dependency.test.js
    constraint.js          # 9 类约束
    constraint.test.js
    solver.js              # 简单求值 + reverse 占位
    solver.test.js
    difficulty.js          # 5 档难度评分
    difficulty.test.js
    renderer.js            # 文本模板渲染
    renderer.test.js
    validator.js           # Math / Answer / Uniqueness 组合
    validator.test.js
    schema.js              # JSON Schema 运行时校验
    schema.test.js
    generate.js            # 顶层编排
    generate.test.js
    index.js               # 公开 API
  templates/
    wordProblems/
      G3_PRICE_001.json    # 单价 × 数量（docs §24）
      G3_MIX_001.json      # 连续加减（docs §25）
    olympiad/
      O23_CHICKEN_RABBIT_001.json  # 鸡兔同笼（docs §28）
    index.js               # 模板注册表

src/strategies/
  DslStrategy.js           # 桥接 JSON 模板 + core/generate.js
  DslStrategy.test.js

tests/
  core-e2e.test.js         # 端到端验证
```

不动的路径：
- `src/strategies/ApplicationStrategy.js` / `ArithmeticStrategy.js` / `OlympiadStrategy.js` / `BandAwareStrategy.js`
- `src/problemTemplates/*.js`（28 个）
- `src/views/*`、`src/components/*`、`src/db.js`

---

## 3. 核心模块设计

### 3.1 random.js — SeedableRNG

```js
export function createRng(seed) {
  return {
    int(min, max) {},       // 闭区间整数
    float(min, max) {},     // [min, max) 浮点
    pick(arr) {},           // 随机取一项
    weighted(picker, weights) {},
    next() {},              // [0, 1)
    stream(name) {},        // docs §42 命名子流
  };
}
```

要点：
- mulberry32 内联实现，~30 行，零外部依赖
- 默认 seed = `Date.now()`；显式传 seed 实现可复现（docs §3.2）
- `stream(name)` 用 `hash(seed + name)` 派生独立子序列，避免变量间随机数干扰

### 3.2 expression.js + dependency.js — 表达式求值

```js
export function evaluate(expr, ctx) {
  // 返回 { ok: true, value } 或 { ok: false, error }
  // 不抛异常（docs §22 undefined variable 安全）
}
```

```js
export function buildDependencyGraph(variables) {
  // 返回 { nodes, edges, order }
  // 检测循环依赖并抛 Error（docs §19-21）
}
```

要点：
- `dependency.js` 编译期构建 DAG；`expression.js` 按拓扑序求值
- 节点：LiteralExpression / VariableExpression / OperationExpression / ConditionalExpression（docs §6）
- 操作符：+ - × ÷ remainder gcd lcm（docs §7）

### 3.3 constraint.js — 9 类约束

| 类型 | DSL 字段 | 验证逻辑 |
|---|---|---|
| `range` | `{ min, max }` | min ≤ value ≤ max |
| `comparison` | `{ op, left, right }` | 比较表达式结果 |
| `divisible` | `{ dividend, divisor }` | dividend % divisor === 0 |
| `integer` | — | Number.isInteger |
| `positive` | — | value > 0 |
| `unique` | `{ scope }` | 当前会话内唯一 |
| `enum` | `{ values }` | value ∈ values |
| `fraction` | `{ denominator, reduced }` | 分母匹配 + 约分 |
| `derived` | predicate expression | 自定义 boolean |

要点：失败时返回 `{ ok: false, reason, hint }`，由 `generate.js` 决定重试。

### 3.4 solver.js — 简单求值

```js
export function solveAnswer(answerDef, vars) {
  // 简单 expression → evaluate
  // 鸡兔同笼等反推留 TODO 注释（第三阶段 reverse generation）
}
```

### 3.5 difficulty.js — 5 档难度评分

按 docs §35：

```text
score = operationScore + variableScore + depthScore
       + knowledgeScore + reasoningScore + numberScore + readingScore
```

```js
export function calculateDifficulty(template, vars, ctx) {}
export function scoreToLevel(score) {
  // 0~20 → 1, 21~40 → 2, ..., 81~100 → 5
}
```

本期 MVP 只算前 3 项；knowledgeScore 等用 0 占位。

默认权重：
- operationScore = unique operators 数 × 5（每个 op 最多 1 次）
- variableScore = variables 数 × 3
- depthScore = 最大 derived 嵌套层数 × 4


### 3.6 renderer.js — 文本渲染

```js
export function render(template, vars) {
  // "{{unitPrice}} × {{quantity}} = {{total}}" → "8 × 6 = 48"
  // 单位从 answer.unit 追加
  // 缺失占位保留原样（不抛错）
}
```

要点：不引 Mustache/Handlebar，用最简 `replaceAll` + regex；包大小优先。

### 3.7 validator.js — 验证器组合

按 docs §39，本期实现：

| 验证器 | 检查 |
|---|---|
| MathValidator | answer 数值 == renderer 表达式结果 |
| AnswerValidator | answer 类型与 DSL 声明一致 |
| UniquenessValidator | 当前 batch 内 `hash = sha1(question + answer + templateId)` 不重复 |

### 3.8 generate.js — 顶层 API

```js
export async function generateQuestion({
  template,        // 已加载的 JSON 模板对象
  seed,            // 可选，默认 Date.now()
  index = 0,       // 题号
  options = {},    // { difficulty, allowDuplicate, count }
}) {
  // 1. createRng(seed + template.id + index)
  // 2. buildDependencyGraph(template.variables)
  // 3. 拓扑序求值（含 maxAttempts=100 重试，docs §17）
  // 4. validateConstraints → 重试
  // 5. solveAnswer
  // 6. calculateDifficulty
  // 7. dedupe (UniquenessValidator)
  // 8. render
  // 9. 返回 Question 对象（docs §37）
}
```

---

## 4. JSON Schema 运行时校验

```js
// src/core/schema.js
export const TEMPLATE_SCHEMA = { /* ... */ };
export function validateTemplate(json) {
  // 加载时校验一次，失败抛 SchemaError
}
```

3 个示范 JSON 模板严格对齐 docs §24/§25/§28 的示例：

- `G3_PRICE_001.json` — 单价 × 数量（最简：1 个 derived + 1 个 range）
- `G3_MIX_001.json` — 连续加减（多层 derived + comparison）
- `O23_CHICKEN_RABBIT_001.json` — 鸡兔同笼（奥数：2 个独立变量 + 1 个 derived + 1 个 divisible）

---

## 5. ProblemGeneratorFactory 兼容接入

```js
// src/strategies/DslStrategy.js
// 注：直接继承 ProblemGeneratorStrategy，不复用 BandAwareStrategy
// （BandAware 针对 JS subtemplates 模型，JSON 模板是声明式结构）
import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { generateQuestion } from '../core/index.js';
import { loadTemplates } from '../templates/index.js';

export class DslStrategy extends ProblemGeneratorStrategy {
  constructor(config) {
    super(config);
    this.type = 'dsl';
    this.templates = loadTemplates();
  }

  generate() {
    // 按 grade 过滤 metadata.grade === config.grade 的模板
    const candidates = this.templates.filter(t => t.metadata.grade === this.config.grade);
    if (candidates.length === 0) {
      throw new Error(`No DSL templates for grade ${this.config.grade}`);
    }
    const template = candidates[Math.floor(Math.random() * candidates.length)];
    return generateQuestion({ template, options: this.config });
  }
}
```

```js
// src/strategies/ProblemGeneratorFactory.js 新增 mode
const strategies = {
  arithmetic: ArithmeticStrategy,
  application: ApplicationStrategy,
  olympiad: OlympiadStrategy,
  dsl: DslStrategy,  // 新增
};
```

UI 端（GeneratorView）**本期不切换**到 `dsl` mode；先通过单元测试 + `core-e2e.test.js` 验证 core 子系统正确性。

---

## 6. 测试策略

| 测试文件 | 内容 |
|---|---|
| `src/core/random.test.js` | 同 seed 必同序列；不同 seed 必不同；stream 隔离 |
| `src/core/expression.test.js` | 4 种 expression 节点 + 7 种 operator 求值 |
| `src/core/dependency.test.js` | 拓扑排序 + 循环依赖抛错 + 多层依赖 |
| `src/core/constraint.test.js` | 9 类约束各 1 case + 边界 |
| `src/core/solver.test.js` | 简单 expression 求值 + 鸡兔同笼 reverse TODO |
| `src/core/difficulty.test.js` | score→level 5 档映射 + 加权计算 |
| `src/core/renderer.test.js` | `{{var}}` 替换 + 单位追加 + 缺失占位 |
| `src/core/validator.test.js` | Math / Answer / Uniqueness 3 类 |
| `src/core/generate.test.js` | 端到端生成 3 个 JSON 模板的 question |
| `tests/core-e2e.test.js` | 模拟 GeneratorView 调用 DslStrategy.generate() |
| `src/strategies/DslStrategy.test.js` | Factory 注册 + mode 路由 |

覆盖率：维持 80% 阈值，`vitest.config.js` 不变。

---

## 7. 风险与回滚

| 风险 | 缓解 |
|---|---|
| 新增路径与老路径并行 | 不删不改老路径；revert PR 即可回滚 |
| `mulberry32` 等算法内联 ~30 行 | 零外部依赖 |
| JSON 模板格式错误导致 UI 崩 | `validateTemplate()` 启动期校验 |
| `DslStrategy` 与现有 strategies 行为不一致 | `core-e2e.test.js` 对比 G3_PRICE_001 JSON 模板的 5 道题输出与手工预期 |
| 覆盖率跌破 80% | 每个 core 模块强制 `.test.js` |

回滚：纯新增 PR，revert 即可。

---

## 8. 后续 PR 路线图（不在本期）

| PR | 内容 |
|---|---|
| 本期 | core + 3 示范 JSON + DslStrategy 兼容接入 |
| 下一期 | 迁 docs MVP 剩余 12 个模板到 JSON（按年级分批） |
| 第三期 | seedable 默认（替换 `Math.random`）+ 知识点图谱 |
| 第四期 | docs §26 Proof Tree / Reverse Generation |
| 第五期 | docs §27 LLM 润色（Optional） |

---

## 9. 工作流约定

按用户同时召唤的 `$brainstorming` + `$finishing-a-development-branch` 两个 skill：

1. 本 spec 用户审阅通过
2. 转入 `writing-plans` skill 出 implementation plan
3. 实施（TDD，每个 core 模块先 test 再实现）
4. 完成后用 `finishing-a-development-branch` skill 处理 merge / PR / 清理
