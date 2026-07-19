# 移动端布局优化 — 设计文档

> 日期：2026-07-19
> 状态：已批准，待进入实施规划阶段
> 范围：中度优化（响应式 + 重排 + sticky 操作栏 + 触控目标 + worksheet 打印增强）
> 前置：MVP+扩展 已实现（commit `508c5c8`）

## 一、目标与范围

### 1.1 项目目标

让小学数学练习题生成器在手机（< 640px）上同样高效、易用。覆盖：

- 单手操作可达（sticky 主操作按钮）
- 阅读舒适（响应式列数 + 触控目标 ≥ 44px）
- 打印/截图更友好（姓名/得分行）

### 1.2 范围内（IN）

- 响应式断点重构（移除旧 768/480 双档，采用 640/1024 mobile-first）
- ProblemGrid 列数响应式（1 / 2 / 3）
- ActionBar sticky 底部 + 按钮排版重排
- ConfigPanel 行顺序重排（高频项置顶，不折叠）
- 触控目标 ≥ 44×44px（按钮、chip、checkbox、radio、input、select）
- worksheet 头部增姓名/得分行（仅打印/导出时显示）
- iPad UA 检测（当前 `/Mobi|Android|iPhone/i` 不识别 iPadOS）
- 新增 `mobile-layout.cy.js` 端到端测试

### 1.3 范围外（OUT，留待后续）

- 折叠面板 / 抽屉式菜单
- 底部 sheet（历史/导出选择）
- FAB 入口
- 滑动手势
- 暗色模式
- 横屏布局专项优化

## 二、架构与文件改动

### 修改文件

| 文件 | 改动 |
| --- | --- |
| `src/style.css` | 重构 `@media` 断点；新增响应式网格、sticky bar、触控目标、worksheet header 打印规则 |
| `src/App.vue` | 移除 `:cols="3"` 硬编码；扩展 iPad UA 检测；worksheet header 模板增姓名/得分 |
| `src/components/ConfigPanel.vue` | 调整 `.config-row` 顺序（高频项置顶） |
| `src/components/ActionBar.vue` | 模板分两行（主操作 + 次操作） |
| `src/components/ProblemGrid.vue` | 移除 scoped `grid-template-columns`，由 style.css 响应式决定 |

### 新增文件

| 文件 | 职责 |
| --- | --- |
| `cypress/e2e/mobile-layout.cy.js` | 移动端布局回归测试 |

## 三、详细设计

### 3.1 响应式断点

```css
/* mobile-first 默认 */
.container { padding: 12px; }
.problem-grid { grid-template-columns: 1fr; }

/* 平板及以上 */
@media (min-width: 640px) {
  .container { padding: 16px; }
  .problem-grid { grid-template-columns: repeat(2, 1fr); }
}

/* 桌面 */
@media (min-width: 1024px) {
  .container { max-width: 960px; margin: 0 auto; padding: 16px; }
  .problem-grid { grid-template-columns: repeat(3, 1fr); }
}
```

删除现有 `@media (max-width: 768px)` 与 `@media (max-width: 480px)` 块（合并到上面的 mobile-first 写法）。

### 3.2 Sticky 底部操作栏

仅在 `< 640px` 生效：

```css
@media (max-width: 639px) {
  .action-bar {
    position: sticky;
    bottom: 0;
    z-index: 10;
    background: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
    padding: 8px;
    margin: 0 -12px;        /* 抵消 .container padding */
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0));
  }
}
```

为避免 sticky bar 遮挡底部内容，`.print-root` 加 `padding-bottom: 80px`。

### 3.3 触控目标

```css
@media (max-width: 639px) {
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
}
```

### 3.4 ConfigPanel 重排

调整 `.config-row` 在 template 中的顺序：

```vue
<template>
  <div class="config-panel">
    <!-- 高频 -->
    <div class="config-row"> <!-- 题目数量 --> </div>
    <div class="config-row"> <!-- 年级 + 学期 --> </div>
    <div class="config-row"> <!-- 题型 --> </div>
    <div class="config-row"> <!-- 难度 --> </div>
    <div class="config-row"> <!-- 答案模式 --> </div>

    <!-- 算术题子配置（条件渲染） -->
    <div v-if="arithmeticSelected" class="config-row"> <!-- 计算项个数 --> </div>
    <div v-if="arithmeticSelected" class="config-row"> <!-- 运算类型 + 位数 --> </div>
    <div v-if="arithmeticSelected" class="config-row"> <!-- 题目子类 --> </div>

    <!-- 高级筛选 -->
    <div class="config-row"> <!-- 知识点 --> </div>
    <CompositionEditor ... />
  </div>
</template>
```

**注意：** 算术题 3 个子配置（项数 / 运算类型 / 子类）虽高频但在算术未选中时无意义，仍用 `v-if` 条件渲染并排在答案模式之后。

### 3.5 ActionBar 排版

桌面端（≥ 640px）：按钮横排不变。

移动端（< 640px）：两行
- 第一行：「生成题目」全宽主按钮
- 第二行：「下载图片」「分享题目」「查看历史」三等分

模板改写：

```vue
<template>
  <div class="action-bar">
    <!-- 桌面端：所有按钮横排 -->
    <button class="btn btn-primary" @click="$emit('generate')">生成题目</button>
    <button class="btn btn-secondary desktop-only" :disabled="!problems.length || isMobile" ...>导出 PDF</button>
    <button class="btn btn-secondary" :disabled="!problems.length" @click="$emit('print')">
      {{ isMobile ? '下载图片' : '打印题目' }}
    </button>
    <button v-if="isMobile && problems.length" class="btn btn-secondary" @click="$emit('share')">分享题目</button>
    <button class="btn btn-link" @click="$emit('show-history')">查看历史</button>
  </div>
</template>
```

CSS 用 `display: contents` 或 `flex-wrap` + 媒体查询控制布局。**按钮顺序保持**：主操作在前，次操作在后。

```css
.action-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 639px) {
  .action-bar .btn-primary {
    width: 100%;
    order: -1;
  }
  .action-bar .desktop-only {
    display: none;
  }
}
```

### 3.6 Worksheet Header

`src/App.vue` 模板改写：

```vue
<div ref="printRoot" class="print-root">
  <div class="worksheet-header">
    <h3>数学练习题</h3>
    <div class="info-row print-only">
      <span>{{ config.grade }}年级{{ config.semester }}册</span>
      <span>姓名：_____________</span>
      <span>得分：_____________</span>
    </div>
    <p class="date">{{ today }}</p>
  </div>
  <ProblemGrid :problems="problems" :show-answer="config.answerMode === 'inline'" />
  <AnswerPage v-if="config.answerMode === 'separate'" :problems="problems" :cols="4" />
</div>
```

```css
.worksheet-header .print-only { display: none; }
.worksheet-header .date { color: #666; font-size: 13px; margin: 4px 0; }

@media print {
  .worksheet-header .print-only {
    display: flex;
    justify-content: space-between;
    padding: 0 24px;
    font-size: 14px;
    margin: 8px 0;
  }
}
```

### 3.7 iPad UA 修复

`src/App.vue` 替换：

```js
function detectMobile() {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone/i.test(ua)) return true;
  // iPadOS 13+ 标识为 Mac，但有触控
  if (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform)) return true;
  return false;
}

onMounted(() => {
  isMobile.value = detectMobile();
  refreshHistory();
});
```

## 四、数据流（无变化）

本次优化只改 UI 样式与布局，不改变任何 composable / strategy / data layer 行为。`useProblemGenerator.generate(config)` 接口与数据流保持不变。

## 五、测试

### 5.1 单元测试

无变更（设计纯 CSS/模板）。`npm run test:run` 应仍 323/323。

### 5.2 端到端测试（Cypress）

新增 `cypress/e2e/mobile-layout.cy.js`：

```js
describe('Mobile layout', () => {
  beforeEach(() => {
    cy.viewport(375, 667);
    cy.visit('/');
    cy.clearLocalStorage();
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
      expect(cols.split(' ').length).to.equal(1);
    });
  });

  it('touch targets are ≥ 44px', () => {
    cy.get('.btn').first().invoke('css', 'minHeight').then((h) => {
      expect(parseInt(h)).to.be.at.least(44);
    });
  });

  it('PDF button hidden on mobile', () => {
    cy.get('.desktop-only').should('not.be.visible');
  });

  it('worksheet header info-row hidden on screen, shown on print', () => {
    cy.get('.worksheet-header .info-row').should('not.be.visible');
    // emulate print media
    cy.emulateMedia({ media: 'print' });
    cy.get('.worksheet-header .info-row').should('be.visible');
    cy.emulateMedia({ media: 'screen' });
  });
});
```

更新 `cypress/e2e/mobile.cy.js`：增补对 worksheet header info-row 不出现在 screen 的断言。

### 5.3 手动回归

桌面浏览器（1280×800）：
- 验证 3 列网格、按钮横排、无破版
- 验证「查看历史」流程不变

手机模拟器（DevTools iPhone SE）：
- 验证 ConfigPanel 9 个 row 全部可见且不重叠
- 验证 sticky 操作栏随滚动常驻底部
- 验证生成题目后 worksheet 单列显示
- 验证下载图片按钮可触发

## 六、迁移与回退

- 纯样式与模板变更，不影响数据层
- 回退成本低：`git revert <commit>` 即可
- 无需数据库迁移

## 七、风险与缓解

| 风险 | 缓解 |
| --- | --- |
| sticky bar 遮挡底部内容 | `.print-root` 加 `padding-bottom: 80px` |
| 移动端 9 个 row 仍需大量滚动 | 重排使高频项置顶；用户操作路径更短 |
| iPad 检测误判 | 双 UA + maxTouchPoints + Mac 三重判定 |
| print media query 在 Cypress 中不可靠 | 用 `cy.emulateMedia({ media: 'print' })` 切 |
| 旧 cypress 选择器失效 | 新增 `desktop-only` class，仅在移动端 hide |
| scoped style 影响组件 | 新增 class 不写 scoped，使用 root `style.css` 全局规则 |

## 八、后续迭代（OUT 范围）

- 折叠面板 + 抽屉
- 底部 sheet（导出选项）
- FAB 主入口
- 暗色模式
- 横屏布局
- 触觉反馈（haptic）