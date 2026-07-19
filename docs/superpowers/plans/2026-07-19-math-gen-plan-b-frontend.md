# Plan B — 前端集成（UI 拆分 + App.vue 重构 + PDF/打印接线）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 App.vue 拆为 ConfigPanel + 子组件，把 PDF 导出、打印、图片下载、移动端分享能力接到 UI 上，并补 Cypress 端到端测试。

**Architecture:** 在 Plan A 提供的 composables 与新策略基础上做 UI 重构。新增 9 个 Vue 组件 + 1 个 cypress e2e 目录。状态仍保留在 App.vue 中（最小侵入式），通过 props/emit 与子组件通信。

**Tech Stack:** Vue 3、Vite、Vitest、Cypress、html2pdf.js、html2canvas-pro、Web Share API。

**前置条件：** Plan A 已完成（`useProblemGenerator` / `useProblemLibrary` / `usePdfExport` / `usePrint` 可用）。

**前置 spec 文档：** `docs/superpowers/specs/2026-07-19-primary-school-math-generator-design.md`

---

## 文件结构

### 新增

| 文件 | 职责 |
| --- | --- |
| `src/components/config/GradeSemesterPicker.vue` | 年级 + 学期 联动选择 |
| `src/components/config/QuestionTypePicker.vue` | 算术/应用/奥数 多选；展开子配置 |
| `src/components/config/DifficultyPicker.vue` | 简单/中等/困难 radio |
| `src/components/config/KnowledgePointPicker.vue` | 多选 chip，按年级加载 |
| `src/components/config/AnswerModePicker.vue` | 隐藏/题目后/单独页 radio |
| `src/components/config/CompositionEditor.vue` | 多题型时按类型分配题数 |
| `src/components/ConfigPanel.vue` | 配置面板聚合 |
| `src/components/ProblemGrid.vue` | 题目网格（从 App.vue 抽出） |
| `src/components/AnswerPage.vue` | 答案单独页 |
| `src/components/ActionBar.vue` | 操作按钮栏（PDF/打印/图片/分享） |
| `src/components/HistoryList.vue` | 历史列表（拆出） |
| `src/components/HistoryDetail.vue` | 历史详情（拆出） |
| `cypress/e2e/generator.cy.js` | 配置 → 生成 → 预览 → PDF 导出 |
| `cypress/e2e/history.cy.js` | 历史记录流程 |
| `cypress/e2e/mobile.cy.js` | 移动端图片下载 |

### 修改

| 文件 | 改动 |
| --- | --- |
| `src/App.vue` | 重构为只包含 viewMode 切换与状态聚合 |
| `src/style.css` | 新增 `@page`、`.answer-page` 打印样式 |

---

## Task 1: GradeSemesterPicker

**Files:**
- Create: `src/components/config/GradeSemesterPicker.vue`

- [ ] **Step 1: 实现组件**

```vue
<!-- src/components/config/GradeSemesterPicker.vue -->
<template>
  <div class="picker">
    <label>年级：</label>
    <select :value="grade" @change="onGrade">
      <option v-for="g in GRADES" :key="g" :value="g">{{ g }}年级</option>
    </select>
    <label>学期：</label>
    <select :value="semester" @change="onSemester">
      <option v-for="s in SEMESTERS" :key="s" :value="s">{{ s }}册</option>
    </select>
  </div>
</template>

<script setup>
import { GRADES, SEMESTERS } from '../../constants/options.js';

const props = defineProps({
  grade: { type: String, required: true },
  semester: { type: String, required: true },
});
const emit = defineEmits(['update:grade', 'update:semester']);

function onGrade(e) {
  emit('update:grade', e.target.value);
}
function onSemester(e) {
  emit('update:semester', e.target.value);
}
</script>

<style scoped>
.picker { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
</style>
```

- [ ] **Step 2: 手动验证（在 App.vue 临时挂载后再移除，本计划 Task 12 接入）**

跳过——后续 Task 12 接入时一并验证。

- [ ] **Step 3: Commit**

```bash
git add src/components/config/GradeSemesterPicker.vue
git commit -m "feat(ui): add GradeSemesterPicker component"
```

---

## Task 2: QuestionTypePicker

**Files:**
- Create: `src/components/config/QuestionTypePicker.vue`

- [ ] **Step 1: 实现组件**

```vue
<!-- src/components/config/QuestionTypePicker.vue -->
<template>
  <div class="picker">
    <span class="label">题型：</span>
    <label v-for="t in QUESTION_TYPES" :key="t" class="checkbox-item">
      <input
        type="checkbox"
        :checked="modelValue.includes(t)"
        @change="toggle(t)"
      />
      <span>{{ labels[t] }}</span>
    </label>
  </div>
</template>

<script setup>
import { QUESTION_TYPES } from '../../constants/options.js';

const props = defineProps({
  modelValue: { type: Array, required: true },
});
const emit = defineEmits(['update:modelValue']);

const labels = {
  arithmetic: '算术题',
  application: '应用题',
  olympiad: '奥数题',
};

function toggle(t) {
  const set = new Set(props.modelValue);
  if (set.has(t)) set.delete(t); else set.add(t);
  emit('update:modelValue', QUESTION_TYPES.filter((x) => set.has(x)));
}
</script>

<style scoped>
.picker { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.label { font-weight: 500; }
.checkbox-item { display: inline-flex; gap: 4px; align-items: center; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/config/QuestionTypePicker.vue
git commit -m "feat(ui): add QuestionTypePicker multi-select"
```

---

## Task 3: DifficultyPicker

**Files:**
- Create: `src/components/config/DifficultyPicker.vue`

- [ ] **Step 1: 实现组件**

```vue
<!-- src/components/config/DifficultyPicker.vue -->
<template>
  <div class="picker">
    <span class="label">难度：</span>
    <label v-for="d in DIFFICULTIES" :key="d" class="radio-item">
      <input
        type="radio"
        :checked="modelValue === d"
        @change="emit('update:modelValue', d)"
      />
      <span>{{ labels[d] }}</span>
    </label>
  </div>
</template>

<script setup>
import { DIFFICULTIES } from '../../constants/options.js';

defineProps({
  modelValue: { type: String, required: true },
});
const emit = defineEmits(['update:modelValue']);

const labels = { easy: '简单', medium: '中等', hard: '困难' };
</script>

<style scoped>
.picker { display: flex; gap: 12px; align-items: center; }
.radio-item { display: inline-flex; gap: 4px; align-items: center; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/config/DifficultyPicker.vue
git commit -m "feat(ui): add DifficultyPicker radio group"
```

---

## Task 4: KnowledgePointPicker

**Files:**
- Create: `src/components/config/KnowledgePointPicker.vue`

- [ ] **Step 1: 实现组件**

```vue
<!-- src/components/config/KnowledgePointPicker.vue -->
<template>
  <div class="picker">
    <span class="label">知识点：</span>
    <button
      v-for="kp in available"
      :key="kp"
      type="button"
      class="chip"
      :class="{ active: modelValue.includes(kp) }"
      @click="toggle(kp)"
    >
      {{ kp }}
    </button>
    <span v-if="modelValue.length === 0" class="hint">不选则全部</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { KNOWLEDGE_POINTS_BY_GRADE } from '../../constants/knowledgePoints.js';

const props = defineProps({
  modelValue: { type: Array, required: true },
  grade: { type: String, required: true },
});
const emit = defineEmits(['update:modelValue']);

const available = computed(() => KNOWLEDGE_POINTS_BY_GRADE[props.grade] || []);

function toggle(kp) {
  const set = new Set(props.modelValue);
  if (set.has(kp)) set.delete(kp); else set.add(kp);
  emit('update:modelValue', Array.from(set));
}
</script>

<style scoped>
.picker { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.label { font-weight: 500; }
.chip {
  padding: 4px 10px;
  border: 1px solid #ccc;
  border-radius: 16px;
  background: #fff;
  cursor: pointer;
}
.chip.active { background: #1976d2; color: #fff; border-color: #1976d2; }
.hint { color: #888; font-size: 12px; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/config/KnowledgePointPicker.vue
git commit -m "feat(ui): add KnowledgePointPicker with grade-driven chips"
```

---

## Task 5: AnswerModePicker

**Files:**
- Create: `src/components/config/AnswerModePicker.vue`

- [ ] **Step 1: 实现组件**

```vue
<!-- src/components/config/AnswerModePicker.vue -->
<template>
  <div class="picker">
    <span class="label">答案：</span>
    <label v-for="m in ANSWER_MODES" :key="m" class="radio-item">
      <input
        type="radio"
        :checked="modelValue === m"
        @change="emit('update:modelValue', m)"
      />
      <span>{{ labels[m] }}</span>
    </label>
  </div>
</template>

<script setup>
import { ANSWER_MODES } from '../../constants/options.js';

defineProps({
  modelValue: { type: String, required: true },
});
const emit = defineEmits(['update:modelValue']);

const labels = {
  hidden: '不显示',
  inline: '题目后显示',
  separate: '单独答案页',
};
</script>

<style scoped>
.picker { display: flex; gap: 12px; align-items: center; }
.radio-item { display: inline-flex; gap: 4px; align-items: center; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/config/AnswerModePicker.vue
git commit -m "feat(ui): add AnswerModePicker radio group"
```

---

## Task 6: CompositionEditor

**Files:**
- Create: `src/components/config/CompositionEditor.vue`

- [ ] **Step 1: 实现组件**

```vue
<!-- src/components/config/CompositionEditor.vue -->
<template>
  <div class="composition" v-if="questionTypes.length > 1">
    <span class="label">各题型题数：</span>
    <label v-for="t in questionTypes" :key="t" class="row">
      <span>{{ labels[t] }}</span>
      <input
        type="number"
        min="0"
        :max="maxFor(t)"
        :value="modelValue[t]"
        @input="update(t, $event.target.value)"
      />
    </label>
    <span class="hint">合计 {{ total }} / {{ problemCount }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Object, required: true },
  questionTypes: { type: Array, required: true },
  problemCount: { type: Number, required: true },
});
const emit = defineEmits(['update:modelValue']);

const labels = { arithmetic: '算术', application: '应用', olympiad: '奥数' };

const total = computed(() => Object.values(props.modelValue).reduce((a, b) => a + (b || 0), 0));

function update(t, raw) {
  const n = Math.max(0, parseInt(raw, 10) || 0);
  emit('update:modelValue', { ...props.modelValue, [t]: n });
}

function maxFor(t) {
  const others = props.questionTypes
    .filter((x) => x !== t)
    .reduce((acc, x) => acc + (props.modelValue[x] || 0), 0);
  return Math.max(0, props.problemCount - others);
}
</script>

<style scoped>
.composition { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.label { font-weight: 500; }
.row { display: inline-flex; gap: 4px; align-items: center; }
.row input { width: 60px; }
.hint { color: #888; font-size: 12px; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/config/CompositionEditor.vue
git commit -m "feat(ui): add CompositionEditor for per-type count distribution"
```

---

## Task 7: ConfigPanel（聚合）

**Files:**
- Create: `src/components/ConfigPanel.vue`

- [ ] **Step 1: 实现组件**

```vue
<!-- src/components/ConfigPanel.vue -->
<template>
  <div class="config-panel">
    <div class="config-row">
      <div class="config-item">
        <label>题目数量：</label>
        <input
          type="number"
          :value="config.problemCount"
          min="1"
          max="100"
          @input="update('problemCount', Number($event.target.value))"
        />
      </div>
      <div class="config-item">
        <label>计算项个数：</label>
        <select
          :value="config.termCount"
          :disabled="!config.questionTypes.includes('arithmetic')"
          @change="update('termCount', Number($event.target.value))"
        >
          <option v-for="n in [2,3,4]" :key="n" :value="n">{{ n }}项</option>
        </select>
      </div>
    </div>

    <div class="config-row">
      <GradeSemesterPicker
        :grade="config.grade"
        :semester="config.semester"
        @update:grade="update('grade', $event)"
        @update:semester="update('semester', $event)"
      />
    </div>

    <div class="config-row">
      <QuestionTypePicker
        :model-value="config.questionTypes"
        @update:model-value="update('questionTypes', $event)"
      />
    </div>

    <div v-if="config.questionTypes.includes('arithmetic')" class="config-row">
      <div class="config-item">
        <label>运算类型：</label>
        <div class="checkbox-group">
          <div v-for="op in ['add','subtract','multiply','divide']" :key="op" class="checkbox-item">
            <input
              type="checkbox"
              :id="op"
              :checked="config.operations[op]"
              @change="updateOp(op, $event.target.checked)"
            />
            <label :for="op">{{ opLabels[op] }}</label>
            <select
              v-if="config.operations[op]"
              :value="config.digits[op]"
              @change="updateDigit(op, Number($event.target.value))"
            >
              <option v-for="n in digitsRange(op)" :key="n" :value="n">{{ n }}位数</option>
            </select>
          </div>
        </div>
      </div>
      <div class="config-item">
        <label>题目子类：</label>
        <select :value="config.problemType" @change="update('problemType', $event.target.value)">
          <option value="result">求结果</option>
          <option value="operand">求运算项</option>
        </select>
      </div>
    </div>

    <div class="config-row">
      <DifficultyPicker
        :model-value="config.difficulty"
        @update:model-value="update('difficulty', $event)"
      />
    </div>

    <div class="config-row">
      <KnowledgePointPicker
        :model-value="config.knowledgePoints"
        :grade="config.grade"
        @update:model-value="update('knowledgePoints', $event)"
      />
    </div>

    <div class="config-row">
      <AnswerModePicker
        :model-value="config.answerMode"
        @update:model-value="update('answerMode', $event)"
      />
    </div>

    <CompositionEditor
      :model-value="config.composition"
      :question-types="config.questionTypes"
      :problem-count="config.problemCount"
      @update:model-value="update('composition', $event)"
    />
  </div>
</template>

<script setup>
import GradeSemesterPicker from './config/GradeSemesterPicker.vue';
import QuestionTypePicker from './config/QuestionTypePicker.vue';
import DifficultyPicker from './config/DifficultyPicker.vue';
import KnowledgePointPicker from './config/KnowledgePointPicker.vue';
import AnswerModePicker from './config/AnswerModePicker.vue';
import CompositionEditor from './config/CompositionEditor.vue';

const props = defineProps({
  config: { type: Object, required: true },
});
const emit = defineEmits(['update:config']);

const opLabels = { add: '加法 (+)', subtract: '减法 (-)', multiply: '乘法 (×)', divide: '除法 (÷)' };

function digitsRange(op) {
  return op === 'multiply' ? [1, 2] : [1, 2, 3];
}

function update(key, value) {
  emit('update:config', { ...props.config, [key]: value });
}

function updateOp(op, checked) {
  emit('update:config', {
    ...props.config,
    operations: { ...props.config.operations, [op]: checked },
  });
}

function updateDigit(op, n) {
  emit('update:config', {
    ...props.config,
    digits: { ...props.config.digits, [op]: n },
  });
}
</script>

<style scoped>
.config-panel { display: flex; flex-direction: column; gap: 12px; }
.config-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
.config-item { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.checkbox-group { display: inline-flex; gap: 8px; flex-wrap: wrap; }
.checkbox-item { display: inline-flex; gap: 4px; align-items: center; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ConfigPanel.vue
git commit -m "feat(ui): aggregate all config pickers into ConfigPanel"
```

---

## Task 8: ProblemGrid 与 AnswerPage

**Files:**
- Create: `src/components/ProblemGrid.vue`
- Create: `src/components/AnswerPage.vue`

- [ ] **Step 1: 实现 ProblemGrid.vue**

```vue
<!-- src/components/ProblemGrid.vue -->
<template>
  <div class="problem-grid" :style="`--cols: ${cols}`">
    <div v-for="(p, i) in problems" :key="i" class="problem-item">
      <span class="num">{{ i + 1 }}.</span>
      <span class="expr">{{ p.question }}</span>
      <span v-if="showAnswer" class="answer">{{ p.answer }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  problems: { type: Array, required: true },
  showAnswer: { type: Boolean, default: false },
  cols: { type: Number, default: 3 },
});
</script>

<style scoped>
.problem-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 3), 1fr);
  gap: 12px 24px;
  padding: 16px 0;
}
.problem-item {
  display: flex;
  gap: 6px;
  align-items: baseline;
  font-size: 16px;
}
.num { font-weight: 500; min-width: 24px; }
.expr { flex: 1; }
.answer { color: #d32f2f; margin-left: 6px; }
@media print {
  .problem-item { break-inside: avoid; }
}
</style>
```

- [ ] **Step 2: 实现 AnswerPage.vue**

```vue
<!-- src/components/AnswerPage.vue -->
<template>
  <div class="answer-page">
    <h3 class="answer-title">参考答案</h3>
    <div class="answer-grid" :style="`--cols: ${cols}`">
      <div v-for="(p, i) in problems" :key="i" class="answer-item">
        <span class="num">{{ i + 1 }}.</span>
        <span class="answer">{{ p.answer }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  problems: { type: Array, required: true },
  cols: { type: Number, default: 4 },
});
</script>

<style scoped>
.answer-page {
  padding-top: 16px;
}
.answer-title {
  text-align: center;
  margin-bottom: 12px;
  font-size: 18px;
}
.answer-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 4), 1fr);
  gap: 8px 24px;
}
.answer-item { display: flex; gap: 6px; font-size: 14px; }
@media print {
  .answer-page { break-before: page; }
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ProblemGrid.vue src/components/AnswerPage.vue
git commit -m "feat(ui): extract ProblemGrid and AnswerPage components"
```

---

## Task 9: ActionBar

**Files:**
- Create: `src/components/ActionBar.vue`

- [ ] **Step 1: 实现组件**

```vue
<!-- src/components/ActionBar.vue -->
<template>
  <div class="action-bar">
    <button class="btn btn-primary" @click="$emit('generate')">生成题目</button>
    <button
      class="btn btn-secondary"
      :disabled="!problems.length || isMobile"
      :title="isMobile ? '请在桌面端导出 PDF' : ''"
      @click="$emit('export-pdf')"
    >
      导出 PDF
    </button>
    <button
      class="btn btn-secondary"
      :disabled="!problems.length"
      @click="$emit('print')"
    >
      {{ isMobile ? '下载图片' : '打印题目' }}
    </button>
    <button
      v-if="isMobile && problems.length"
      class="btn btn-secondary"
      @click="$emit('share')"
    >
      分享题目
    </button>
    <button class="btn btn-link" @click="$emit('show-history')">查看历史</button>
  </div>
</template>

<script setup>
defineProps({
  problems: { type: Array, required: true },
  isMobile: { type: Boolean, default: false },
});
defineEmits(['generate', 'export-pdf', 'print', 'share', 'show-history']);
</script>

<style scoped>
.action-bar { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
.btn { padding: 6px 12px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background: #fff; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: #1976d2; color: #fff; border-color: #1976d2; }
.btn-secondary { background: #f5f5f5; }
.btn-link { background: transparent; border: none; color: #1976d2; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ActionBar.vue
git commit -m "feat(ui): add ActionBar with PDF/print/image/share wiring"
```

---

## Task 10: HistoryList 与 HistoryDetail

**Files:**
- Create: `src/components/HistoryList.vue`
- Create: `src/components/HistoryDetail.vue`

- [ ] **Step 1: 实现 HistoryList.vue**

```vue
<!-- src/components/HistoryList.vue -->
<template>
  <div class="history-list">
    <h3>历史记录</h3>
    <ul v-if="items.length">
      <li v-for="item in items" :key="item.id">
        <span class="ts">{{ item.timestamp }}</span>
        <span class="meta">{{ item.config.problemCount }}题 · {{ item.config.grade }}年级{{ item.config.semester }}册</span>
        <button class="btn-link" @click="$emit('open', item)">查看</button>
        <button class="btn-link danger" @click="$emit('delete', item)">删除</button>
      </li>
    </ul>
    <p v-else class="empty">暂无历史记录</p>
    <button class="btn btn-secondary" @click="$emit('back')">返回生成器</button>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
});
defineEmits(['open', 'delete', 'back']);
</script>

<style scoped>
.history-list { padding: 16px 0; }
ul { list-style: none; padding: 0; }
li {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.ts { color: #666; min-width: 160px; }
.meta { flex: 1; }
.btn-link { background: transparent; border: none; color: #1976d2; cursor: pointer; }
.btn-link.danger { color: #d32f2f; }
.empty { color: #999; }
</style>
```

- [ ] **Step 2: 实现 HistoryDetail.vue**

```vue
<!-- src/components/HistoryDetail.vue -->
<template>
  <div class="history-detail">
    <h3>历史详情（{{ item.timestamp }}）</h3>
    <p class="meta">{{ item.config.grade }}年级{{ item.config.semester }}册 · {{ item.config.problemCount }}题</p>
    <ProblemGrid :problems="item.problems" :show-answer="false" />
    <button class="btn btn-secondary" @click="$emit('back')">返回列表</button>
  </div>
</template>

<script setup>
import ProblemGrid from './ProblemGrid.vue';
defineProps({
  item: { type: Object, required: true },
});
defineEmits(['back']);
</script>

<style scoped>
.history-detail { padding: 16px 0; }
.meta { color: #666; margin-bottom: 12px; }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/HistoryList.vue src/components/HistoryDetail.vue
git commit -m "feat(ui): split HistoryView into HistoryList and HistoryDetail"
```

---

## Task 11: 打印 CSS

**Files:**
- Modify: `src/style.css`

- [ ] **Step 1: 在 style.css 末尾追加打印样式**

打开 `src/style.css`，在文件末尾追加：

```css
/* === Print styles for MVP+扩展 === */
@page {
  size: A4;
  margin: 12mm;
}

@media print {
  body {
    background: #fff !important;
  }
  .config-panel,
  .action-bar,
  .header-actions,
  .history-list,
  .picker-row,
  .config-row {
    display: none !important;
  }
  body.print-with-answer .answer-page {
    display: block !important;
  }
  body.print-without-answer .answer-page {
    display: none !important;
  }
  .problem-item {
    break-inside: avoid;
  }
}
```

- [ ] **Step 2: 验证 style.css 不破坏现有打印行为**

```bash
grep -n "media print" src/style.css
```

Expected: 至少两处 `@media print` 命中（旧的 + 新的合并块）

- [ ] **Step 3: Commit**

```bash
git add src/style.css
git commit -m "style(print): add @page rules and hide controls in print mode"
```

---

## Task 12: App.vue 重构

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: 备份并阅读现有 App.vue 关键段落**

```bash
wc -l src/App.vue
```

期望 ~935 行。

- [ ] **Step 2: 替换 App.vue 为新实现**

**整文件覆盖** `src/App.vue`：

```vue
<template>
  <div class="container">
    <div class="header">
      <h2>小学数学口算题生成器</h2>
      <p style="color: red; font-weight: bolder" v-if="!isMobile">
        配置参数，生成数学练习题
      </p>
      <p style="color: red; font-weight: bolder" v-else>
        配置参数，生成数学练习题，可下载图片或分享
      </p>
    </div>

    <div v-if="viewMode === 'generator'">
      <ConfigPanel :config="config" @update:config="config = $event" />
      <ActionBar
        :problems="problems"
        :is-mobile="isMobile"
        @generate="generateProblems"
        @export-pdf="exportPdf"
        @print="handlePrint"
        @share="handleShare"
        @show-history="viewMode = 'history'"
      />

      <div ref="printRoot" class="print-root">
        <div class="worksheet-header">
          <h3>数学练习题</h3>
          <p>{{ config.grade }}年级{{ config.semester }}册 · {{ today }}</p>
        </div>
        <ProblemGrid
          :problems="problems"
          :show-answer="config.answerMode === 'inline'"
          :cols="3"
        />
        <AnswerPage
          v-if="config.answerMode === 'separate'"
          :problems="problems"
          :cols="4"
        />
      </div>
    </div>

    <HistoryList
      v-else-if="viewMode === 'history'"
      :items="history"
      @open="openHistory"
      @delete="deleteHistory"
      @back="viewMode = 'generator'"
    />

    <HistoryDetail
      v-else-if="viewMode === 'history-detail'"
      :item="selectedHistory"
      @back="viewMode = 'history'"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import ConfigPanel from './components/ConfigPanel.vue';
import ActionBar from './components/ActionBar.vue';
import ProblemGrid from './components/ProblemGrid.vue';
import AnswerPage from './components/AnswerPage.vue';
import HistoryList from './components/HistoryList.vue';
import HistoryDetail from './components/HistoryDetail.vue';
import { useProblemGenerator } from './composables/useProblemGenerator.js';
import { usePdfExport } from './composables/usePdfExport.js';
import { usePrint } from './composables/usePrint.js';
import { addProblemSet, getHistory, db } from './db.js';

export default {
  components: {
    ConfigPanel,
    ActionBar,
    ProblemGrid,
    AnswerPage,
    HistoryList,
    HistoryDetail,
  },
  setup() {
    const today = new Date().toISOString().slice(0, 10);
    const isMobile = ref(false);
    const viewMode = ref('generator');
    const problems = ref([]);
    const history = ref([]);
    const selectedHistory = ref(null);
    const printRoot = ref(null);

    const config = ref({
      problemCount: 20,
      termCount: 2,
      operations: { add: true, subtract: true, multiply: false, divide: false },
      digits: { add: 1, subtract: 1, multiply: 1, divide: 1 },
      problemType: 'result',
      useBrackets: false,
      allowRepeatOperators: true,
      grade: '3',
      semester: '上',
      questionTypes: ['arithmetic'],
      difficulty: 'easy',
      knowledgePoints: [],
      answerMode: 'hidden',
      composition: { arithmetic: 20, application: 0, olympiad: 0 },
    });

    const generator = useProblemGenerator();
    const pdf = usePdfExport();
    const printer = usePrint();

    onMounted(() => {
      isMobile.value = /Mobi|Android|iPhone/i.test(navigator.userAgent);
      refreshHistory();
    });

    async function refreshHistory() {
      history.value = await getHistory();
    }

    async function generateProblems() {
      const list = await generator.generate(config.value);
      problems.value = list;
      await addProblemSet(list, config.value);
      await refreshHistory();
    }

    async function exportPdf() {
      if (!printRoot.value) return;
      const filename = pdf.buildFilename({
        grade: config.value.grade,
        semester: config.value.semester,
      });
      await pdf.exportPdf(printRoot.value, filename);
    }

    function handlePrint() {
      if (isMobile.value) {
        // mobile uses image download path
        downloadImage();
        return;
      }
      printer.print({ answerMode: config.value.answerMode });
    }

    async function downloadImage() {
      const html2canvas = (await import('html2canvas-pro')).default;
      if (!printRoot.value) return;
      const canvas = await html2canvas(printRoot.value, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `数学练习题_${config.value.grade}年级_${today}.png`;
      link.click();
    }

    async function handleShare() {
      const html2canvas = (await import('html2canvas-pro')).default;
      if (!printRoot.value) return;
      const canvas = await html2canvas(printRoot.value, { scale: 2, useCORS: true });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `数学练习题_${today}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: '数学练习题',
          });
        } else {
          alert('当前浏览器不支持分享，请使用下载功能');
        }
      });
    }

    async function openHistory(item) {
      selectedHistory.value = item;
      viewMode.value = 'history-detail';
    }

    async function deleteHistory(item) {
      await db.problemSets.delete(item.id);
      await refreshHistory();
    }

    return {
      today,
      isMobile,
      viewMode,
      config,
      problems,
      history,
      selectedHistory,
      printRoot,
      generateProblems,
      exportPdf,
      handlePrint,
      handleShare,
      openHistory,
      deleteHistory,
    };
  },
};
</script>

<style scoped>
.container { max-width: 960px; margin: 0 auto; padding: 16px; }
.header { display: flex; flex-direction: column; gap: 4px; }
.print-root { padding: 16px 0; }
.worksheet-header { text-align: center; margin-bottom: 12px; }
.worksheet-header h3 { margin: 0; }
.worksheet-header p { color: #666; margin: 4px 0; }
</style>
```

- [ ] **Step 3: 运行所有测试**

```bash
npm run test:run
```

Expected: ALL PASS

- [ ] **Step 4: 启动 dev 服务器手动验证**

```bash
npm run dev &  # 后台启动
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000
kill %1
```

Expected: 200

- [ ] **Step 5: 构建验证**

```bash
npm run build
```

Expected: 成功输出

- [ ] **Step 6: Commit**

```bash
git add src/App.vue
git commit -m "refactor(app): extract components, wire PDF/print/share to new composables"
```

---

## Task 13: Cypress 端到端测试 — generator 流程

**Files:**
- Modify: `cypress.config.js`
- Create: `cypress/e2e/generator.cy.js`

- [ ] **Step 1: 修正 cypress.config.js 的 baseUrl 与 viewport**

`vite.config.js` 使用 port 5000，但 `cypress.config.js` 指向 5173。先修正：

```js
// cypress.config.js (replace whole file)
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',
    supportFile: false,
    viewportWidth: 1280,
    viewportHeight: 800,
    setupNodeEvents(on, config) {},
  },
});
```

- [ ] **Step 2: 创建 e2e/generator.cy.js**

```js
// cypress/e2e/generator.cy.js
describe('Generator flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('shows config panel and action bar', () => {
    cy.contains('题目数量').should('be.visible');
    cy.contains('生成题目').should('be.visible');
  });

  it('generates arithmetic problems for default config', () => {
    cy.get('input[type=number]').first().clear().type('5');
    cy.contains('生成题目').click();
    cy.get('.problem-item').should('have.length', 5);
  });

  it('supports application problems when selected', () => {
    cy.get('input[type=number]').first().clear().type('3');
    cy.contains('应用题').click();
    cy.contains('生成题目').click();
    cy.get('.problem-item').should('have.length.at.least', 3);
  });

  it('toggles answer mode and renders answers inline', () => {
    cy.get('input[type=number]').first().clear().type('3');
    cy.contains('题目后显示').click();
    cy.contains('生成题目').click();
    cy.get('.problem-item .answer').should('have.length', 3);
  });
});
```

- [ ] **Step 3: 启动 dev server 并运行 cypress（headed 或 headless）**

```bash
npm run dev &
sleep 3
npx cypress run --spec cypress/e2e/generator.cy.js
kill %1
```

Expected: 4 tests pass

- [ ] **Step 4: Commit**

```bash
git add cypress.config.js cypress/e2e/generator.cy.js
git commit -m "test(e2e): align cypress baseUrl to vite port 5000 + generator coverage"
```

---

## Task 14: Cypress 端到端测试 — 历史

**Files:**
- Create: `cypress/e2e/history.cy.js`

- [ ] **Step 1: 创建 history.cy.js**

```js
// cypress/e2e/history.cy.js
describe('History flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  it('saves a problem set and shows it in history', () => {
    cy.get('input[type=number]').first().clear().type('3');
    cy.contains('生成题目').click();
    cy.contains('查看历史').click();
    cy.get('.history-list li').should('have.length.at.least', 1);
  });

  it('opens history detail and renders problems', () => {
    cy.get('input[type=number]').first().clear().type('3');
    cy.contains('生成题目').click();
    cy.contains('查看历史').click();
    cy.contains('查看').first().click();
    cy.get('.problem-item').should('have.length.at.least', 3);
    cy.contains('返回列表').click();
  });

  it('deletes a history entry', () => {
    cy.get('input[type=number]').first().clear().type('2');
    cy.contains('生成题目').click();
    cy.contains('查看历史').click();
    cy.contains('删除').first().click();
    cy.get('.history-list li').should('have.length', 0);
  });
});
```

- [ ] **Step 2: 运行**

```bash
npm run dev &
sleep 3
npx cypress run --spec cypress/e2e/history.cy.js
kill %1
```

Expected: 3 tests pass

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/history.cy.js
git commit -m "test(e2e): add history list flow coverage"
```

---

## Task 15: Cypress 端到端测试 — 移动端

**Files:**
- Create: `cypress/e2e/mobile.cy.js`

- [ ] **Step 1: 创建 mobile.cy.js**（mobile viewport 已由 Task 13 在 cypress.config.js 中通过 cy.viewport 命令切换）

```js
// cypress/e2e/mobile.cy.js
describe('Mobile flow', () => {
  beforeEach(() => {
    cy.viewport(375, 667); // iPhone SE
    cy.visit('/');
    cy.clearLocalStorage();
  });

  it('shows mobile hint and download image button', () => {
    cy.contains('下载图片').should('exist');
  });

  it('disables PDF button on mobile with tooltip', () => {
    cy.contains('生成题目').click();
    cy.get('button[title*="桌面端"]').should('be.disabled');
  });
});
```

- [ ] **Step 3: 运行**

```bash
npm run dev &
sleep 3
npx cypress run --spec cypress/e2e/mobile.cy.js
kill %1
```

Expected: 2 tests pass

- [ ] **Step 4: Commit**

```bash
git add cypress/e2e/mobile.cy.js
git commit -m "test(e2e): add mobile viewport and share fallback coverage"
```

---

## Task 16: Plan B 质量门禁

- [ ] **Step 1: 运行单元测试**

```bash
npm run test:run
```

Expected: ALL PASS

- [ ] **Step 2: 运行 build**

```bash
npm run build
```

Expected: 成功

- [ ] **Step 3: 运行所有 cypress e2e**

```bash
npm run dev &
sleep 3
npx cypress run
kill %1
```

Expected: 9 tests pass（4 generator + 3 history + 2 mobile）

- [ ] **Step 4: 验证 dev server 启动**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000
kill %1
```

Expected: 200

- [ ] **Step 5: 提交任何遗漏的修改**

```bash
git status
# 若有：
git add -A
git commit -m "chore(plan-b): final verification pass"
```

---

## 自审

- ✅ §3 配置字段 → Task 7 ConfigPanel 聚合 + 6 picker 子组件
- ✅ §6 UI 拆分 → Task 7-10（ConfigPanel、ProblemGrid、AnswerPage、ActionBar、HistoryList、HistoryDetail）
- ✅ §6.3 状态流 → Task 12 App.vue 重构
- ✅ §6.4 答案模式 → Task 8 ProblemGrid + AnswerPage + Task 5 AnswerModePicker
- ✅ §7.2 usePdfExport → Plan A Task 16；Task 9 ActionBar + Task 12 接线
- ✅ §7.3 PDF 装配 → Task 12 `printRoot` + `worksheet-header` + AnswerPage `v-if`
- ✅ §7.4 打印 → Plan A Task 17；Task 11 CSS `@page` + `.answer-page` break
- ✅ §7.5 移动端降级 → Task 9 PDF 禁用 + tooltip；Task 12 downloadImage / handleShare 路径
- ✅ §8.3 e2e → Task 13/14/15（generator / history / mobile）
- ✅ §10 风险（PDF 移动端内存） → Task 9 禁用 PDF + Task 12 image fallback
- ✅ §10 风险（应用题答案不一致） → Plan A Task 4-8 模板断言
- ⚠️ §8.4 覆盖率 ≥ 70% → 待最终核查（建议：`npx vitest run --coverage`）

---

## 交付检查清单

- [ ] `npm run test:run` 全绿
- [ ] `npm run build` 成功
- [ ] `npx cypress run` 9 tests pass
- [ ] Dev server 200
- [ ] App.vue 行数显著减少（< 250 行）
- [ ] 13 个新组件全部提交
- [ ] 3 个 cypress e2e 文件提交
- [ ] style.css 包含 `@page` + `.answer-page` 规则
- [ ] Plan A 与 Plan B 集成无冲突（共同依赖的 composable 已存在）