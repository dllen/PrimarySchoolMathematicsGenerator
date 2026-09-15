# 题型选择器 UI 优化 — 实施计划(retrospective)

**项目**: PrimarySchoolMathematicsGenerator
**日期**: 2026-09-14
**状态**: ✅ 已实施 (2026-09-14)
**关联 spec**: `docs/superpowers/specs/2026-09-14-question-type-picker-ui-design.md`

> Retrospective: 文件改动早于本计划落地。本计划作为记录/评审追溯使用,实施步骤已全部完成。

---

## File Structure

| 路径 | 状态 | 职责 |
|---|---|---|
| `src/components/config/QuestionTypePicker.vue` | 重写(74 → 146 行) | 多选按钮组 UI |
| `src/components/config/QuestionTypePicker.test.js` | 新增(94 行,8 测试) | 单元测试 |

---

## Task 1: 重写 `QuestionTypePicker.vue`

**Files:**
- Modify: `src/components/config/QuestionTypePicker.vue`

- [x] **Step 1: 写失败的测试 — 8 个用例覆盖渲染 / aria / 多选反馈 / 点击交互 / 顺序**

新建 `src/components/config/QuestionTypePicker.test.js`,8 个 `it()` 块(详见 spec §4)。

- [x] **Step 2: 跑测试确认失败**

`npx vitest run src/components/config/QuestionTypePicker.test.js` → FAIL(模块未找到)

- [x] **Step 3: 重写 `QuestionTypePicker.vue`**

- `<template>`: 用 `<button type="button">` 替换 `<input type="checkbox">`,加 `aria-pressed` / `role="group"` / `aria-label` / `focus-visible`
- `<script setup>`: 定义 `PICKER_TYPES` 常量,`toggle()` 保留 PICKER_TYPES 声明的稳定顺序
- `<style scoped>`: 6 个 CSS 规则(`.type-btn`, `:hover`, `:focus-visible`, `.type-btn--on`, `.type-btn__label`, `.type-btn__hint`)

- [x] **Step 4: 跑测试确认通过**

8/8 pass

- [x] **Step 5: 全量回归**

`npx vitest run` → 845/845 pass(后被 diversity 叠加到 849)

- [x] **Step 6: 提交**

(沙箱限制 .git 只读,手动 commit 见下方命令)

---

## 验收

- [x] `npx vitest run src/components/config/QuestionTypePicker.test.js` → 8/8
- [x] `npx vitest run` → 全绿(845 → 后 849)
- [x] `npx vite build` 通过
- [x] `ConfigPanel.vue` 不动,父组件契约不变
- [x] 视觉与 `ConfigWizard` 年级/学期按钮组一致(同一 paper-warm token)

---

## Self-Review

**1. Spec coverage:**
- §1.2 目标 6 项 → Task 1 step 3 实现,§4 测试覆盖
- §2.1 契约不变 → ConfigPanel.vue 零改动已验证
- §2.2 PICKER_TYPES 3 项 → 文件第 50-54 行
- §2.3 视觉设计 → `<style scoped>` 6 条规则
- §2.4 多选反馈 → template 第 19-21 行

**2. Placeholder scan:** 全文无 TBD/TODO。

**3. Type consistency:**
- `modelValue: Array` (line 43) ↔ test `makeWrapper(['arithmetic'])` 一致
- `PICKER_TYPES.map(...).filter(...)` (line 64-65) ↔ test "稳定的稳定顺序" 一致
- `t.value === 'arithmetic'` (line 49) ↔ test `[data-value="arithmetic"]` 一致
