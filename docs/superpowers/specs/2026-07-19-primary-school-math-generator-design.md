# 小学数学练习题生成系统 — 设计文档

> 日期：2026-07-19
> 状态：已批准，待进入实施规划阶段
> 范围：MVP + 难度/知识点扩展 + 应用题/奥数题基础模板

## 一、目标与范围

### 1.1 项目目标

为小学阶段（1-6 年级）学生提供数学练习题自动生成与题库管理能力，支持按年级、学期、题型、难度、知识点生成试卷，并提供预览、打印、PDF 导出功能。

### 1.2 范围内（IN）

- **配置筛选**：年级、学期、题型（多选）、难度、知识点
- **题型**：算术题（已有 + 知识点筛选）、应用题（基础 3 模板）、奥数题（基础 2 模板）
- **题量**：1-100 自定义，沿用现有
- **答案配置**：隐藏 / 题目后 / 单独页
- **题库**：IndexedDB（Dexie）持久化，即时生成 + 缓存入库
- **预览**：在线（沿用现有）
- **PDF 导出**：html2pdf.js
- **打印**：A4，沿用现有 + 增强答案单独页分页
- **历史记录**：沿用现有

### 1.3 范围外（OUT，留待后续版本）

- 错题本
- 知识点题库手工编辑/导入（JSON/Excel）
- 在线同步题库
- 用户账号与多端同步

## 二、架构总览

采用**最小侵入式扩展**方案（方案 A），保留现有 `App.vue` 单组件主体，按职责拆出 composables 与子组件。

```
src/
├── App.vue                       # 主入口，按 viewMode 路由
├── main.js                       # 应用入口
├── style.css                     # 全局样式（含 @media print）
├── composables/
│   ├── useProblemGenerator.js    # 封装 ProblemGeneratorContext
│   ├── useProblemLibrary.js      # 题库读写（IndexedDB）
│   ├── usePdfExport.js           # html2pdf.js 封装
│   └── usePrint.js               # 打印逻辑
├── components/
│   ├── ConfigPanel.vue           # 配置面板
│   ├── ActionBar.vue             # 操作按钮栏
│   ├── ProblemGrid.vue           # 题目网格
│   ├── AnswerPage.vue            # 答案单独页
│   ├── HistoryList.vue           # 历史列表
│   ├── HistoryDetail.vue         # 历史详情
│   └── config/                   # ConfigPanel 子组件
│       ├── GradeSemesterPicker.vue
│       ├── QuestionTypePicker.vue
│       ├── DifficultyPicker.vue
│       ├── KnowledgePointPicker.vue
│       ├── AnswerModePicker.vue
│       └── CompositionEditor.vue
├── strategies/                   # 策略模式
│   ├── ProblemGeneratorStrategy.js     # 基类（已有）
│   ├── ResultProblemStrategy.js        # 已有
│   ├── OperandProblemStrategy.js       # 已有
│   ├── ArithmeticStrategy.js           # 新：算术题编排
│   ├── ApplicationStrategy.js          # 新：应用题
│   ├── OlympiadStrategy.js             # 新：奥数题
│   └── ProblemGeneratorFactory.js      # 工厂扩展
├── problemTemplates/             # 新：应用题/奥数题模板
│   ├── shopping.js
│   ├── time.js
│   ├── comparison.js
│   ├── sequence.js
│   └── logic.js
├── db.js                         # Dexie schema
└── constants/
    └── knowledgePoints.js        # 知识点字典（按年级）
```

## 三、配置模型

```js
{
  // 已有字段（保留）
  problemCount: Number,         // 1-100
  termCount: Number,            // 2-4，仅算术题有效
  operations: { add: Boolean, subtract: Boolean, multiply: Boolean, divide: Boolean },
  digits: { add: Number, subtract: Number, multiply: Number, divide: Number },
  problemType: 'result' | 'operand', // 算术题子类
  useBrackets: Boolean,
  allowRepeatOperators: Boolean,

  // 新增字段
  grade: '1' | '2' | '3' | '4' | '5' | '6',
  semester: '上' | '下',
  questionTypes: ['arithmetic', 'application', 'olympiad'], // 多选
  difficulty: 'easy' | 'medium' | 'hard',
  knowledgePoints: String[],
  answerMode: 'hidden' | 'inline' | 'separate',
  composition: {
    arithmetic: Number,
    application: Number,
    olympiad: Number,
  },
}
```

**互斥规则**：
- `questionTypes` 包含 `arithmetic` 时，`problemType` 生效
- `composition` 缺省时，按 `questionTypes` 顺序均分 `problemCount`（余数分配给第一个选中的题型）
- `grade`/`semester` 对算术题无效；仅影响应用题与奥数题的模板可用性

## 四、题库 Schema（Dexie）

`db.js` 升级到 `version(2)`：

```js
db.version(2).stores({
  // 已有表，保留
  problemSets: '++id, timestamp',

  // 新增题库表
  problemLibrary: '++id, [grade+semester+type], type, grade, semester, difficulty, *knowledgePoints',
});
```

**题目记录结构**：

```js
{
  id: Number,                    // 自增
  grade: '1' | ... | '6',
  semester: '上' | '下',
  type: 'arithmetic' | 'application' | 'olympiad',
  subtype: String,               // 'add-result' | 'shopping' | 'sequence' ...
  difficulty: 1 | 2 | 3,         // 1=简单 2=中等 3=困难
  knowledgePoints: String[],     // 知识点标签
  question: String,              // 题目文本
  answer: String,
  payload: Object,               // 应用题变量或奥数题参数（可选）
  source: 'generated' | 'manual',
  createdAt: String,             // ISO timestamp
}
```

**索引设计**：
- `[grade+semester+type]` 复合索引：按筛选条件快速定位
- `type` / `grade` / `semester` / `difficulty` 单列索引：通用查询
- `*knowledgePoints` multiEntry：数组字段索引

**抽题流程**：

1. 按 `(grade, semester, type, difficulty?)` 在 `problemLibrary` 查询候选
2. 若候选不足目标数 → 触发即时生成补足 → 写入库（`source: 'generated'`）
3. 去重：基于 `question` 字符串 hash 维护 Set，避免同一次生成内重复
4. 三次重试后仍不足 → 放宽 `difficulty`（±1）继续查询；若仍不足则按当前已找到的数量返回并 UI 提示

## 五、策略模式扩展

### 5.1 工厂扩展

```js
// ProblemGeneratorFactory.js
createStrategy(type, config) {
  switch (type) {
    case 'arithmetic':  return new ArithmeticStrategy(config);
    case 'application': return new ApplicationStrategy(config);
    case 'olympiad':    return new OlympiadStrategy(config);
    default: throw new Error(`Unsupported type: ${type}`);
  }
}
```

### 5.2 算术题编排策略（ArithmeticStrategy）

包装现有 `ResultProblemStrategy` / `OperandProblemStrategy`，按 `problemType` 分发：

```js
class ArithmeticStrategy extends ProblemGeneratorStrategy {
  generate() {
    const inner = this.config.problemType === 'result'
      ? new ResultProblemStrategy(this.config)
      : new OperandProblemStrategy(this.config);
    return inner.generate();
  }
}
```

### 5.3 应用题策略（ApplicationStrategy）

- 维护 `templates[]`，每个模板是 `{id, gradeRange, semester, scenario, generate(rng, difficulty)}`
- 实现 3 个基础模板：
  - `shopping-basic`（购物）：所有年级
  - `time-clock`（时间）：1-3 年级
  - `comparison-diff`（比较）：2-4 年级
- 入参：年级 → 过滤可用模板 → 按难度选择参数

### 5.4 奥数题策略（OlympiadStrategy）

- 实现 2 个基础模板：
  - `sequence-arith`（等差数列）：3-6 年级
  - `logic-simple`（简单逻辑）：4-6 年级
- 难度通过模板参数控制（数列长度、规律复杂度）

### 5.5 统一出口

所有策略返回：

```js
{
  question: String,
  answer: String,
  subtype: String,
  payload: Object,
}
```

### 5.6 模板示例

```js
// src/problemTemplates/shopping.js
export const shoppingTemplate = {
  id: 'shopping-basic',
  gradeRange: ['1', '2', '3'],
  semester: 'all',
  generate(rng, difficulty) {
    const unitPrice = rng.int(1, 9);
    const quantity = rng.int(2, 5 + difficulty);
    const total = unitPrice * quantity;
    return {
      question: `小明买了${quantity}支铅笔，每支${unitPrice}元，一共花了多少钱？`,
      answer: `${total}元`,
      subtype: 'shopping',
      payload: { unitPrice, quantity, total },
    };
  },
};
```

## 六、UI 组件与状态流

### 6.1 视图模式

沿用现有 `viewMode` 思路：

```
viewMode: 'generator' | 'history' | 'history-detail'
```

### 6.2 组件划分

```
App.vue
├── <ConfigPanel>
│   ├── <GradeSemesterPicker>
│   ├── <QuestionTypePicker>
│   ├── <DifficultyPicker>
│   ├── <KnowledgePointPicker>
│   ├── <AnswerModePicker>
│   └── <CompositionEditor>      # 多题型时显示
├── <ActionBar>
├── <ProblemGrid>
├── <AnswerPage>                 # answerMode === 'separate' 时
├── <HistoryList>
└── <HistoryDetail>
```

### 6.3 状态流（核心生成路径）

```
ConfigPanel (config)
    ↓ user clicks "生成"
useProblemGenerator.generate(config)
    ↓
ProblemGeneratorContext
    ├─ 按 questionTypes 拆分题量
    ├─ 各类型 Strategy 顺序生成
    ├─ 去重（基于 question hash）
    └─ 写入 problemLibrary
    ↓
ProblemGrid + (AnswerPage if separate)
    ↓
ActionBar
    ├─ PDF: html2pdf.js
    ├─ Print: window.print()
    ├─ Image: html2canvas（保留移动端）
    └─ Share: Web Share API（移动端）
```

### 6.4 答案模式行为

| `answerMode` | `ProblemGrid` | `AnswerPage` |
| --- | --- | --- |
| `hidden` | 题目后无答案 | 不渲染 |
| `inline` | 题目后显示答案 | 不渲染 |
| `separate` | 题目后无答案 | 渲染并分页 |

## 七、PDF 导出与打印

### 7.1 库选择

`html2pdf.js`（= jsPDF + html2canvas）。理由：
- 复用现有 html2canvas-pro 渲染路径
- 无需重写 PDF 排版
- 分页由 html2pdf.js 处理

### 7.2 封装

`composables/usePdfExport.js`：

```js
export function usePdfExport() {
  async function exportPdf(element, filename) {
    const opt = {
      margin: 10,
      filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    };
    return html2pdf().set(opt).from(element).save();
  }
  return { exportPdf };
}
```

### 7.3 PDF 页面装配

导出时构造 offscreen DOM：

```
[试卷标题 + 年级 + 日期]
[题目网格]
─── 分页 ───
[答案页]   (answerMode === 'separate' 时)
```

文件名：`数学练习题_<年级>_<日期>.pdf`

### 7.4 打印

沿用现有 `@media print`，新增：
- `@page { size: A4; margin: 12mm; }`
- `.answer-page { break-before: page; }`

### 7.5 移动端行为

- 保留现有"下载图片"按钮
- 移动端 PDF 导出降级路径：检测 `isMobile === true` 时仅展示图片下载与分享入口，PDF 按钮禁用并显示 tooltip "请在桌面端导出 PDF"

## 八、测试与质量门禁

### 8.1 单元测试（Vitest）

- `strategies/ArithmeticStrategy.test.js`
- `strategies/ApplicationStrategy.test.js`
- `strategies/OlympiadStrategy.test.js`
- `db.test.js`（扩展 Dexie schema v2）
- `composables/useProblemLibrary.test.js`
- `composables/usePdfExport.test.js`（jsdom 限制下，仅验证参数）

### 8.2 模板快照测试

每个应用题/奥数题模板在固定 rng 下生成 100 次：
- 断言答案与变量计算一致（应用题）
- 断言数列规律成立（奥数题）
- 断言无重复

### 8.3 端到端测试（Cypress，已有）

- `e2e/generator.cy.js`：配置 → 生成 → 预览 → PDF 导出
- `e2e/history.cy.js`：历史记录
- `e2e/mobile.cy.js`：移动端图片下载

### 8.4 质量门禁

- `npm run test:run` 必须通过
- `npm run build` 必须通过
- 核心生成/导出路径测试覆盖率 ≥ 70%

## 九、迁移与兼容

### 9.1 Dexie 迁移

`db.version(2)` 升级时，Dexie 自动处理 schema 变更，无需手动迁移脚本（新增表不影响旧表）。

### 9.2 现有代码

- `App.vue` 保留但拆分出 ConfigPanel / ProblemGrid / AnswerPage 子组件
- `db.js` 增加 `problemLibrary` 表与对应 CRUD
- `strategies/` 新增三个策略类 + 工厂注册
- 新增 `composables/` 与 `components/config/`

### 9.3 历史记录

`problemSets` 表保留，结构不变。新表 `problemLibrary` 独立演化。

## 十、风险与决策记录

| 风险 | 缓解 |
| --- | --- |
| PDF 在移动端内存溢出 | 移动端保留图片导出，PDF 仅桌面端 |
| 应用题答案计算与展示不一致 | 模板测试断言答案与 payload 变量一致 |
| 题库无限增长 | 暂不限制，后续版本引入 LRU 淘汰 |
| Dexie schema 升级失败 | Dexie 自带迁移兜底；保留 v1 fallback |
| 算术题与新增的难度/知识点冲突 | 难度通过参数影响数字范围与运算项；知识点通过 grade/operations 隐式推导 |

## 十一、后续迭代（OUT 范围）

- 错题本（收藏 + 错题重练）
- 题库导入（JSON / Excel）
- 在线同步（服务端）
- 知识点手工编辑与增删

## 十二、参考

- 现有策略模式文档：`STRATEGY_PATTERN_README.md`
- 现有移动端文档：`MOBILE_FEATURES.md`
- 原始 PRD：用户消息中提供的 PRD 章节