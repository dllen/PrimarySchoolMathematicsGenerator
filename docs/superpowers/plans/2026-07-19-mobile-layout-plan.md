# 移动端布局优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化小学数学练习题生成器在手机（< 640px）上的布局：响应式断点 + 重排 + sticky 操作栏 + 触控目标 + worksheet 打印头部增强 + iPad UA 修复。

**Architecture:** 纯样式与少量模板变更，不动 composable / strategy / data layer。CSS 用 mobile-first（min-width）写法重构；组件 DOM 顺序不变，通过 CSS `order` 与 `display` 控制移动端布局；新增 e2e 测试验证。

**Tech Stack:** Vue 3、Vite、Vitest、Cypress、原生 CSS 媒体查询。

**前置 spec 文档：** `docs/superpowers/specs/2026-07-19-mobile-layout-design.md`

---

## 文件结构

### 修改

| 文件 | 改动 |
| --- | --- |
| `src/style.css` | 重构 `@media` 断点为 mobile-first；响应式 problem-grid 列数；sticky 底部操作栏；触控目标 ≥ 44px；worksheet header print 规则 |
| `src/App.vue` | 移除 `:cols="3"` 硬编码；worksheet header 模板增姓名/得分行；提取 iPad UA 检测函数 |
| `src/components/ConfigPanel.vue` | 调整 `.config-row` 顺序（高频项置顶）；新增 `arithmeticSelected` computed |
| `src/components/ActionBar.vue` | 「导出 PDF」按钮加 `.desktop-only` class |
| `src/components/ProblemGrid.vue` | 移除 scoped `grid-template-columns`，由全局 style.css 响应式决定 |

### 新增

| 文件 | 职责 |
| --- | --- |
| `cypress/e2e/mobile-layout.cy.js` | 移动端布局回归测试（6 个用例） |

### 新增测试

| 文件 | 覆盖 |
| --- | --- |
| `cypress/e2e/mobile-layout.cy.js` | 移动端断点 / sticky / 列数 / 触控目标 / PDF 隐藏 / 打印 info-row |

---

## Task 1: 重构 style.css 响应式 + sticky + 触控目标 + 打印规则

**Files:**
- Modify: `src/style.css`

- [ ] **Step 1: 备份并查看当前 style.css 末尾结构**

```bash
wc -l src/style.css && tail -50 src/style.css
```

确认末尾有 `@media print` 块（设计文档要求保留）。

- [ ] **Step 2: 删除旧的两档移动端规则（@media 768 / 480）**

在 `src/style.css` 中**整段删除**以下两块（保留 `@media print`）：

```css
/* 移动端适配 */
@media screen and (max-width: 768px) {
  .container { padding: 10px; }
  /* ...整个块... */
}

/* 针对小屏幕手机的额外优化 */
@media screen and (max-width: 480px) {
  /* ...整个块... */
}
```

- [ ] **Step 3: 在文件末尾（`@media print` 之前）追加新的响应式规则**

```css

/* === Mobile-first responsive overrides (MVP+移动端) === */
@media screen and (max-width: 639px) {
  .container {
    padding: 12px;
  }

  .header h2 {
    font-size: 1.4em;
  }

  .header p {
    font-size: 0.9em;
  }

  /* 问题网格：1 列 */
  .problem-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .problem-item {
    font-size: 16px;
    padding: 12px;
  }

  /* 答案网格：2 列 */
  .answer-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Sticky 底部操作栏 */
  .action-bar {
    position: sticky;
    bottom: 0;
    z-index: 10;
    background: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
    padding: 8px;
    margin: 0 -12px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }

  .action-bar .btn-primary {
    width: 100%;
    order: -1;
  }

  .action-bar .desktop-only {
    display: none !important;
  }

  /* 触控目标 ≥ 44px */
  .btn,
  .checkbox-item,
  .radio-item,
  .chip,
  input[type="number"],
  select {
    min-height: 44px;
    padding: 12px 16px;
  }

  input[type="checkbox"],
  input[type="radio"] {
    width: 22px;
    height: 22px;
  }

  /* ConfigPanel 单列 */
  .config-panel {
    padding: 12px;
  }

  .config-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .config-item {
    width: 100%;
  }

  .config-item input,
  .config-item select {
    width: 100%;
  }

  /* KnowledgePointPicker chips: 加间距、强化选中 */
  .chip {
    font-size: 15px;
    padding: 6px 14px;
  }

  .chip.active {
    font-weight: 600;
  }

  /* print-root padding 避免 sticky 遮挡 */
  .print-root {
    padding-bottom: 80px;
  }

  /* 历史列表 */
  .history-list li {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media screen and (min-width: 640px) and (max-width: 1023px) {
  .container {
    padding: 16px;
  }

  .problem-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .answer-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (min-width: 1024px) {
  .container {
    max-width: 960px;
    margin: 0 auto;
    padding: 16px;
  }

  .problem-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .answer-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

- [ ] **Step 4: 保留/合并 worksheet header print 规则**

确认 `.worksheet-header .info-row` 仅在打印时显示。在 `@media print` 块内**追加**（不要删除现有 print 规则）：

```css

@media print {
  /* ...existing print rules... */

  .worksheet-header .info-row {
    display: flex !important;
    justify-content: space-between;
    padding: 0 24px;
    font-size: 14px;
    margin: 8px 0;
  }
}
```

- [ ] **Step 5: 验证 build 通过**

```bash
npm run build 2>&1 | tail -5
```

Expected: `✓ built in ...`

- [ ] **Step 6: 提交**

```bash
git add src/style.css
git commit -m "style(mobile): mobile-first responsive breakpoints, sticky action bar, 44px touch targets"
```

---

## Task 2: ConfigPanel.vue 重排 + arithmeticSelected

**Files:**
- Modify: `src/components/ConfigPanel.vue`

- [ ] **Step 1: 读取现有 ConfigPanel.vue 当前结构**

```bash
grep -n "config-row\|<template>\|<script setup>\|defineEmits" src/components/ConfigPanel.vue | head -20
```

定位每个 `.config-row` 与 `defineEmits`。

- [ ] **Step 2: 在 `<script setup>` 顶部导入 computed 并新增 arithmeticSelected**

在现有 `import` 之后、现有 `defineProps` 之前添加：

```js
import { computed } from 'vue';

const arithmeticSelected = computed(() => props.config.questionTypes.includes('arithmetic'));
```

- [ ] **Step 3: 在 template 中重排 `.config-row` 顺序**

将 ConfigPanel 的 template 中 `.config-row` 顺序按以下排列（高频 → 低频）：

```vue
<template>
  <div class="config-panel">
    <!-- 高频（按使用频率） -->
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

    <div class="config-row">
      <DifficultyPicker
        :model-value="config.difficulty"
        @update:model-value="update('difficulty', $event)"
      />
    </div>

    <div class="config-row">
      <AnswerModePicker
        :model-value="config.answerMode"
        @update:model-value="update('answerMode', $event)"
      />
    </div>

    <!-- 算术题子配置（条件渲染） -->
    <div v-if="arithmeticSelected" class="config-row">
      <div class="config-item">
        <label>计算项个数：</label>
        <select
          :value="config.termCount"
          @change="update('termCount', Number($event.target.value))"
        >
          <option v-for="n in [2,3,4]" :key="n" :value="n">{{ n }}项</option>
        </select>
      </div>
    </div>

    <div v-if="arithmeticSelected" class="config-row">
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

    <!-- 高级筛选 -->
    <div class="config-row">
      <KnowledgePointPicker
        :model-value="config.knowledgePoints"
        :grade="config.grade"
        @update:model-value="update('knowledgePoints', $event)"
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
```

- [ ] **Step 4: 验证 build 与单元测试**

```bash
npm run build 2>&1 | tail -3 && npm run test:run 2>&1 | tail -3
```

Expected: build success + 323/323 tests

- [ ] **Step 5: 提交**

```bash
git add src/components/ConfigPanel.vue
git commit -m "refactor(ui): reorder ConfigPanel rows by frequency (high-first)"
```

---

## Task 3: ActionBar.vue 加 desktop-only 类 + ProblemGrid 移除 scoped cols

**Files:**
- Modify: `src/components/ActionBar.vue`
- Modify: `src/components/ProblemGrid.vue`

- [ ] **Step 1: 在 ActionBar 中给导出 PDF 按钮加 `.desktop-only` class**

定位导出 PDF 按钮（约第 5-9 行），加 class：

```vue
<button
  class="btn btn-secondary desktop-only"
  :disabled="!problems.length || isMobile"
  :title="isMobile ? '请在桌面端导出 PDF' : ''"
  @click="$emit('export-pdf')"
>
  导出 PDF
</button>
```

- [ ] **Step 2: 移除 ProblemGrid 的 scoped grid-template-columns**

打开 `src/components/ProblemGrid.vue`，找到 scoped style 中的：

```css
.problem-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 3), 1fr);
  gap: 12px 24px;
  padding: 16px 0;
}
```

替换为：

```css
.problem-grid {
  display: grid;
  gap: 12px 24px;
  padding: 16px 0;
  /* grid-template-columns 由全局 style.css 响应式控制 */
}
```

- [ ] **Step 3: 同时移除 props 中的 cols 默认值（保留类型）**

找到：

```js
defineProps({
  problems: { type: Array, required: true },
  showAnswer: { type: Boolean, default: false },
  cols: { type: Number, default: 3 },
});
```

替换为（移除 cols 默认值，类型保留以兼容旧用法）：

```js
defineProps({
  problems: { type: Array, required: true },
  showAnswer: { type: Boolean, default: false },
});
```

- [ ] **Step 4: 在 App.vue 中移除 ProblemGrid 的 `:cols="3"` 属性**

打开 `src/App.vue`，找到 `<ProblemGrid>` 元素（约第 30-34 行）：

```vue
<ProblemGrid
  :problems="problems"
  :show-answer="config.answerMode === 'inline'"
  :cols="3"
/>
```

替换为：

```vue
<ProblemGrid
  :problems="problems"
  :show-answer="config.answerMode === 'inline'"
/>
```

对 AnswerPage 同样处理（可选，仅影响 AnswerPage 桌面端的列数，仍用 cols=4）：

```vue
<AnswerPage
  v-if="config.answerMode === 'separate'"
  :problems="problems"
  :cols="4"
/>
```

**保留**：因为 AnswerPage 在移动端由 style.css 覆盖为 2 列，`:cols="4"` 仅作用于桌面 fallback。

- [ ] **Step 5: 验证 build 与测试**

```bash
npm run build 2>&1 | tail -3 && npm run test:run 2>&1 | tail -3
```

Expected: build success + 323/323 tests

- [ ] **Step 6: 提交**

```bash
git add src/components/ActionBar.vue src/components/ProblemGrid.vue src/App.vue
git commit -m "refactor(ui): add .desktop-only class + remove hardcoded grid columns (CSS-driven responsive)"
```

---

## Task 4: App.vue worksheet header + iPad UA 检测

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: 在 App.vue template 的 `.worksheet-header` 中插入 info-row**

定位 `<div class="worksheet-header">` 块（约第 26-29 行）：

```vue
<div class="worksheet-header">
  <h3>数学练习题</h3>
  <p>{{ config.grade }}年级{{ config.semester }}册 · {{ today }}</p>
</div>
```

替换为：

```vue
<div class="worksheet-header">
  <h3>数学练习题</h3>
  <div class="info-row print-only">
    <span>{{ config.grade }}年级{{ config.semester }}册</span>
    <span>姓名：_____________</span>
    <span>得分：_____________</span>
  </div>
  <p class="date">{{ today }}</p>
</div>
```

- [ ] **Step 2: 替换 App.vue 中 worksheet header 的样式**

定位 App.vue `<style scoped>` 块（约第 202-209 行）：

```css
.worksheet-header { text-align: center; margin-bottom: 12px; }
.worksheet-header h3 { margin: 0; }
.worksheet-header p { color: #666; margin: 4px 0; }
```

**追加**：

```css
.worksheet-header .info-row {
  display: none; /* 默认隐藏（屏幕视图），@media print 切到 display: flex */
  justify-content: space-between;
  padding: 0 8px;
  font-size: 14px;
}
.worksheet-header .date {
  color: #666;
  font-size: 13px;
  margin: 4px 0;
}
```

- [ ] **Step 3: 在 `<script>` 块中提取 iPad UA 检测函数**

定位 `onMounted` 中的 UA 检测（约第 112 行）：

```js
isMobile.value = /Mobi|Android|iPhone/i.test(navigator.userAgent);
```

替换为（先定义函数再调用）：

```js
function detectMobile() {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone/i.test(ua)) return true;
  if (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform)) return true;
  return false;
}

onMounted(() => {
  isMobile.value = detectMobile();
  refreshHistory();
});
```

- [ ] **Step 4: 验证 build**

```bash
npm run build 2>&1 | tail -3
```

Expected: build success

- [ ] **Step 5: 提交**

```bash
git add src/App.vue
git commit -m "feat(ui): worksheet header info-row (print-only) + iPad UA detection"
```

---

## Task 5: Cypress mobile-layout e2e

**Files:**
- Create: `cypress/e2e/mobile-layout.cy.js`

- [ ] **Step 1: 创建 mobile-layout.cy.js**

```js
// cypress/e2e/mobile-layout.cy.js
describe('Mobile layout', () => {
  beforeEach(() => {
    cy.viewport(375, 667);
    cy.visit('/');
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('ConfigPanel shows all rows without folding', () => {
    cy.get('.config-row').its('length').should('be.gte', 9);
  });

  it('ActionBar sticks to bottom when scrolling', () => {
    cy.get('.config-panel').then(($el) => {
      const offset = $el.offset().top + $el.outerHeight() + 500;
      cy.scrollTo(0, offset);
      cy.get('.action-bar').should('be.visible');
    });
  });

  it('ProblemGrid is single-column on phone', () => {
    cy.get('.problem-grid').first().then(($el) => {
      const cols = window.getComputedStyle($el[0]).gridTemplateColumns;
      expect(cols.trim().split(/\s+/).length).to.equal(1);
    });
  });

  it('touch targets are ≥ 44px', () => {
    cy.get('.btn').first().invoke('css', 'minHeight').then((h) => {
      expect(parseInt(h, 10)).to.be.at.least(44);
    });
  });

  it('PDF button (desktop-only) is hidden on mobile', () => {
    cy.get('.action-bar .desktop-only').should('not.be.visible');
  });

  it('worksheet header info-row hidden on screen, shown on print', () => {
    cy.get('.worksheet-header .info-row').should('not.be.visible');
    cy.emulateMedia({ media: 'print' });
    cy.get('.worksheet-header .info-row').should('be.visible');
    cy.emulateMedia({ media: 'screen' });
  });
});
```

- [ ] **Step 2: 运行 mobile-layout e2e**

```bash
npx vite --port 5183 &>/dev/null &
sleep 3
CYPRESS_baseUrl=http://localhost:5183 npx cypress run --spec cypress/e2e/mobile-layout.cy.js
kill %1 2>/dev/null
```

Expected: 6 tests pass

- [ ] **Step 3: 提交**

```bash
git add cypress/e2e/mobile-layout.cy.js
git commit -m "test(e2e): add mobile-layout regression coverage"
```

---

## Task 6: 整体验证

- [ ] **Step 1: 运行全部单元测试**

```bash
npm run test:run 2>&1 | tail -5
```

Expected: PASS (N/N) — 应仍为 323/323

- [ ] **Step 2: 运行 build**

```bash
npm run build 2>&1 | tail -8
```

Expected: build success

- [ ] **Step 3: 运行全部 cypress e2e**

```bash
npx vite --port 5183 &>/dev/null &
sleep 3
CYPRESS_baseUrl=http://localhost:5183 npx cypress run
kill %1 2>/dev/null
```

Expected: 全部 specs pass（generator 4 + history 3 + mobile 2 + mobile-layout 6 = 15 tests）

- [ ] **Step 4: 手动验证（可选）**

桌面浏览器 DevTools 切到 iPhone SE 视口：
- 验证 ConfigPanel 9 个 row 可见且不重叠
- 滚动到任意位置，sticky 操作栏仍可见
- 生成题目后 worksheet 单列显示
- 「下载图片」可触发

---

## 自审

- ✅ §3.1 响应式断点 → Task 1 CSS
- ✅ §3.2 Sticky 操作栏 → Task 1 CSS
- ✅ §3.3 触控目标 ≥ 44px → Task 1 CSS
- ✅ §3.4 ConfigPanel 重排 → Task 2
- ✅ §3.5 ActionBar 视觉重排 → Task 3
- ✅ §3.6 Worksheet Header → Task 4
- ✅ §3.7 iPad UA 检测 → Task 4
- ✅ §5.2 移动端 e2e → Task 5
- ✅ 数据流不变（不触碰 composable/strategy）
- ✅ 现有 323 单元测试不回归（仅样式变更）

---

## 交付检查清单

- [ ] `npm run test:run` 全绿（323/323）
- [ ] `npm run build` 成功
- [ ] `npx cypress run` 15 tests pass（4 + 3 + 2 + 6）
- [ ] 6 个提交各自聚焦单一变更
- [ ] 桌面端 1280×800 视口布局未破版
- [ ] 手机视口 375×667 配置项 9 个 row 全部可见
- [ ] sticky 操作栏在滚动后仍可见
- [ ] ProblemGrid 在手机 1 列、桌面 3 列