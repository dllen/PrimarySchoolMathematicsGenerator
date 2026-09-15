# 题型选择器 UI 优化 — 多选按钮组(去除复选框)

**项目**: PrimarySchoolMathematicsGenerator
**日期**: 2026-09-14
**状态**: ✅ 已实施 (2026-09-14)
**优先级**: 中(UX 一致性改进)
**前置依赖**: 无
**作者**: Codex (UI 优化)

> **回顾性 spec**: 实现早于 spec 落地。文件 `src/components/config/QuestionTypePicker.vue` 在 turn 1 已完成,本 spec 用于事后留档与评审追溯。

---

## 1. 背景与目标

### 1.1 现状

`src/components/config/QuestionTypePicker.vue` 之前用浏览器原生 checkbox + label 渲染 3 个题型选项(算术/应用/奥数)。问题:

| 问题 | 影响 |
|---|---|
| 浏览器原生 checkbox 视觉与项目 paper-warm 主题不一致 | UI 像未加工 |
| 原生 checkbox 触摸目标过小(尤其移动端) | 可点击性差 |
| 缺少题目描述(只显示题类型名) | 用户不知道每个题型具体是什么样 |
| 缺少 `aria-pressed` / `role=group` 等无障碍属性 | 屏幕阅读器不友好 |

### 1.2 重构目标

| 目标 | 验证 |
|---|---|
| 题型选择 UI 与 `ConfigWizard` 第 1 步的年级/学期按钮组视觉一致(同一设计 token) | 视觉对比 |
| 触摸目标 ≥ 44px(WCAG / Apple HIG) | CSS `min-h-[44px]` |
| 选中态用 ember 实色 + paper-card 文字 | 颜色对比度 ≥ 4.5:1 |
| 完整无障碍属性(`role=group` / `aria-label` / `aria-pressed` / `focus-visible`) | 8 个测试覆盖 |
| 多选时给出即时反馈(已选 N 项提示) | 测试断言 `已选 N 项` |
| 保留 `v-model` 契约不变(父组件零改动) | `ConfigPanel.vue` 不动 |

---

## 2. 设计

### 2.1 数据契约(向后兼容)

```js
// Props:  Array<string>   — 选中的题型 values(顺序任意)
// Emits: 'update:modelValue'  — 新数组(按 PICKER_TYPES 声明的稳定顺序)
```

`ConfigPanel.vue` 第 31-34 行已用:
```vue
<QuestionTypePicker
  :model-value="config.questionTypes"
  @update:model-value="update('questionTypes', $event)"
/>
```
契约**不变**,父组件零改动。

### 2.2 PICKER_TYPES(仅展示 3 个核心题型)

```js
const PICKER_TYPES = [
  { value: 'arithmetic',  label: '算术', hint: '基础四则运算' },
  { value: 'application', label: '应用', hint: '文字情境题' },
  { value: 'olympiad',    label: '奥数', hint: '拓展思维题' },
];
```

`QUESTION_TYPES` 常量在 `options.js` 中有 ~25 个细分值(boat-crossing、share-candy、number-theory 等),但这些**不**在此选择器展示 — 它们在策略层处理(grade-specific 模板自动选用)。

### 2.3 视觉设计

复用 `tailwind.config.js` 已有的 paper-warm token:

| 状态 | 边框 | 背景 | 文字 |
|---|---|---|---|
| 默认(`type-btn--off`) | `#E8DFD2` (rule-soft) | `#FFFCF7` (paper-card) | `#2B1F1A` (ink-deep) 主 / `#8A7A6A` (ink-faint) hint |
| Hover | `#C2410C` (ember) | 同上 | 同上 |
| 选中(`type-btn--on`) | `#C2410C` (ember) | `#C2410C` (ember) | `#FFFCF7` (paper-card) |
| Focus-visible | outline 2px ember + offset 2px | — | — |

每个按钮是 vertical flex 列:`label` (14px / 500) + `hint` (12px / faint)。`min-height: 44px` 满足触摸目标。

布局:`grid grid-cols-1 sm:grid-cols-3 gap-2`,移动端单列,sm 以上三列。

### 2.4 多选反馈

```vue
<p v-if="modelValue.length > 1" class="text-xs text-ink-faint">
  已选 {{ modelValue.length }} 项 · 下方「各题型题数」可继续细分题量
</p>
```

提示用户下面有 CompositionEditor 可以细分题量。

---

## 3. 涉及文件

| 路径 | 类型 |
|---|---|
| `src/components/config/QuestionTypePicker.vue` | 重写(checkbox → 按钮组) |
| `src/components/config/QuestionTypePicker.test.js` | 新增(8 测试) |

`ConfigPanel.vue` 不动(契约不变)。

---

## 4. 测试覆盖(`QuestionTypePicker.test.js`)

| # | 用例 | 验证点 |
|---|---|---|
| 1 | 渲染三个题型按钮(算术/应用/奥数) | DOM 结构 |
| 2 | 已选中的按钮带有 aria-pressed=true | 多选状态映射 |
| 3 | 未选中时不显示多选提示 | 条件渲染 |
| 4 | 选中多项时显示多选提示 | 条件渲染 |
| 5 | 点击未选中的按钮 → emit 追加 | 交互 |
| 6 | 点击已选中的按钮 → emit 移除 | 交互 |
| 7 | 发射数组保持 PICKER_TYPES 声明的稳定顺序 | 顺序一致性 |
| 8 | a11y: `role=group` + `aria-label` | 无障碍 |

---

## 5. 不做的事(YAGNI)

- ❌ 不改 `ConfigWizard.vue` 内嵌的同款 checkbox 选择器(它有自己的步骤卡片设计,YAGNI)
- ❌ 不加键盘快捷键 / 过滤搜索(纯 UI 优化范围)
- ❌ 不改 `PICKER_TYPES` 为 6+ 个细分题型(它们在策略层处理)
- ❌ 不引入新依赖(纯 CSS + 已有 Tailwind token)

---

## 6. 验收

- [x] 全量测试通过(原 837 + 本任务 8 = 845,后被 diversity 任务叠加到 849)
- [x] `vite build` 通过
- [x] `ConfigPanel.vue` 契约不变,父组件零改动
- [x] 触摸目标 ≥ 44px
- [x] WCAG 对比度满足
- [x] 视觉与 `ConfigWizard` 年级/学期按钮组一致
