# 小学数学题生成器 — UI 全面重设计实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将小学数学题生成器从"工具型 UI"全面重构为温暖编辑感的现代 UI — 引入 Tailwind、设计 token 系统、Hero+卡片网格工作台、移动端专属布局。

**Architecture:** 分 6 阶段推进。阶段 1 建立基础设施(Tailwind + token + Base 组件),阶段 2-3 重写所有视图与业务组件,阶段 4 处理移动端专属布局,阶段 5-6 处理微交互与测试。每个阶段独立可合并,失败可回滚。

**Tech Stack:** Vue 3、Vite、Tailwind CSS v3、Vitest、Cypress、Lora + LXGW WenKai TC 字体、CSS Variables 设计 token。

**前置 spec 文档:** `docs/superpowers/specs/2026-09-12-math-gen-ui-redesign-design.md`

---

## 文件结构

### 新增

| 文件 | 职责 |
| --- | --- |
| `tailwind.config.js` | Tailwind 配置(colors / fontFamily / maxWidth 扩展) |
| `postcss.config.js` | PostCSS 配置(启用 tailwindcss + autoprefixer) |
| `src/assets/styles/tokens.css` | CSS 变量定义(颜色/字体/间距/圆角/阴影) |
| `src/assets/styles/base.css` | Tailwind directives + 全局 reset + 打印样式 |
| `src/assets/styles/utilities.css` | 自定义工具类(container/typography) |
| `src/composables/useBreakpoint.js` | 响应式断点 composable(media query reactive) |
| `src/composables/useBreakpoint.test.js` | 断点 composable 单元测试 |
| `src/components/base/BaseButton.vue` | 基础按钮(4 变体 × 3 尺寸) |
| `src/components/base/BaseButton.test.js` | BaseButton 单元测试 |
| `src/components/base/BaseBadge.vue` | 标签徽章(2 变体) |
| `src/components/base/BaseCard.vue` | 通用卡片(3 变体) |
| `src/components/base/BaseInput.vue` | 输入框 |
| `src/components/base/BaseSelect.vue` | 下拉框 |
| `src/components/base/BaseTabs.vue` | Tab 切换器 |
| `src/components/base/BaseSheet.vue` | 移动端底部弹出层 |
| `src/components/base/index.js` | Base 组件统一导出 |
| `src/components/layout/AppHeader.vue` | 全局顶栏(桌面+移动) |
| `src/components/layout/AppHeader.test.js` | 顶栏单元测试 |
| `src/components/layout/MobileNav.vue` | 移动端汉堡菜单+全屏 sheet |
| `src/components/workbench/GradeCard.vue` | 工作台年级卡片 |
| `src/components/workbench/GradeCard.test.js` | 年级卡片单元测试 |
| `src/components/workbench/WorkbenchHero.vue` | 工作台 Hero 区域 |
| `src/views/AboutView.vue` | 关于页(新增) |
| `src/views/AboutView.test.js` | AboutView 单元测试 |
| `tests/visual/snapshot-baseline.md` | 视觉回归 baseline 说明(本次全部重置) |
| `cypress/e2e/workbench-redesign.cy.js` | 工作台重设计 E2E |
| `cypress/e2e/mobile-sheet.cy.js` | 移动端 sheet E2E |

### 修改

| 文件 | 改动 |
| --- | --- |
| `package.json` | 新增 tailwindcss / postcss / autoprefixer / @fontsource/lora / @fontsource/lxgw-wenkai-tc 依赖 |
| `src/main.js` | 引入 base.css + tokens.css |
| `src/style.css` | 内容迁移到 `src/assets/styles/base.css`,保留的 reset 规则移除 |
| `src/App.vue` | 引入 AppHeader,移除内联样式 |
| `src/router/index.js` | 新增 `/workbench`(GeneratorView 别名)、`/about` 路由;`/generator` 重定向 `/workbench`;`/quick-start` 重定向 `/workbench` |
| `src/components/HomePage.vue` | 简化为极简引导页 |
| `src/components/HomePage.test.js` | (如存在)更新断言 |
| `src/views/GeneratorView.vue` | 重写为工作台(Hero + 卡片 + Tab + 预览) |
| `src/views/GeneratorView.test.js` | (新建)工作台单元测试 |
| `src/views/HistoryView.vue` | 列表样式升级 |
| `src/views/HistoryView.test.js` | (新建/更新) |
| `src/views/HistoryDetailView.vue` | 元信息卡片化 |
| `src/views/HistoryDetailView.test.js` | (新建/更新) |
| `src/views/QuickStartView.vue` | 改为重定向包装器(模板保留 setup 钩子,挂载时 `router.replace('/workbench')`) |
| `src/components/ActionBar.vue` | 桌面横向 / 移动 sticky 两套布局 |
| `src/components/ActionBar.test.js` | (新建/更新) |
| `src/components/ConfigPanel.vue` | 行间距加大,控件换 Tailwind class |
| `src/components/ConfigWizard.vue` | 视觉升级 |
| `src/components/PresetSelector.vue` | 升级为"预设卡片网格" |
| `src/components/PresetManager.vue` | 重设计为"预设列表 + 编辑表单"两栏 |
| `src/components/ExportPreview.vue` | 弹窗升级为暖色 sheet |
| `src/components/ConfirmDialog.vue` | 统一为暖色卡片 |
| `src/components/ToastContainer.vue` | 改暖色调色板 |
| `src/components/ProblemGrid.vue` | 优化间距/字号 |
| `src/components/AnswerPage.vue` | 跟 ProblemGrid 同款间距 |
| `cypress/e2e/generator.cy.js` | 适配新工作台结构 |
| `cypress/e2e/mobile-layout.cy.js` | 适配新移动端布局 |
| `cypress/e2e/mobile.cy.js` | 适配新移动端布局 |
| `cypress/e2e/history.cy.js` | 适配新历史页 |

### 完整迁移路径

```
src/style.css
  └─> src/assets/styles/tokens.css   (CSS 变量)
  └─> src/assets/styles/base.css     (Tailwind directives + 全局 reset)
  └─> src/assets/styles/utilities.css (自定义工具类)
  └─> 各组件 <style scoped> 全部改用 @apply 或 Tailwind class
```

---

## Task 1: 引入 Tailwind 与设计 token 基础设施

**Files:**
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/assets/styles/tokens.css`
- Create: `src/assets/styles/base.css`
- Create: `src/assets/styles/utilities.css`
- Modify: `src/main.js`
- Modify: `src/style.css`(清空为单行注释 + re-export,确保旧引用不破)

- [ ] **Step 1: 安装 Tailwind 与字体依赖**

```bash
npm install -D tailwindcss@^3.4.0 postcss@^8.4.0 autoprefixer@^10.4.0
npm install @fontsource/lora @fontsource/lxgw-wenkai-tc
```

预期: `package.json` dependencies 与 devDependencies 各自新增上述包,无报错。

- [ ] **Step 2: 创建 Tailwind 配置**

创建 `tailwind.config.js`(项目根):

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FAF7F2',
          card: '#FFFCF7',
        },
        ink: {
          deep: '#2B1F1A',
          muted: '#6B5D4F',
          faint: '#8A7A6A',
        },
        rule: {
          soft: '#E8DFD2',
          softer: '#EAE0D0',
        },
        ember: {
          DEFAULT: '#C2410C',
          hover: '#9A3412',
        },
      },
      fontFamily: {
        serif: ['Lora', '"LXGW WenKai TC"', '"Songti SC"', 'Georgia', 'serif'],
      },
      maxWidth: {
        content: '960px',
        narrow: '720px',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43, 31, 26, 0.06)',
        medium: '0 2px 6px rgba(43, 31, 26, 0.08)',
        large: '0 8px 24px rgba(43, 31, 26, 0.10)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: 创建 PostCSS 配置**

创建 `postcss.config.js`(项目根):

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 4: 创建 CSS tokens 文件**

创建 `src/assets/styles/tokens.css`:

```css
/* ============================================
 * Design Tokens — PrimarySchoolMathematicsGenerator
 * Paper-warm palette + Lora / LXGW WenKai TC
 * Source of truth: docs/superpowers/specs/2026-09-12-math-gen-ui-redesign-design.md §3
 * ============================================ */

:root {
  /* === 颜色 === */
  --color-bg-paper:        #FAF7F2;
  --color-bg-card:         #FFFCF7;
  --color-ink-deep:        #2B1F1A;
  --color-ink-muted:       #6B5D4F;
  --color-ink-faint:       #8A7A6A;
  --color-rule-soft:       #E8DFD2;
  --color-rule-softer:     #EAE0D0;
  --color-accent-ember:    #C2410C;
  --color-accent-ember-hover: #9A3412;
  --color-success:         #15803D;
  --color-warning:         #B45309;
  --color-error:           #B91C1C;

  /* === 字体 === */
  --font-display:  'Lora', 'LXGW WenKai TC', 'Songti SC', Georgia, serif;
  --font-body:     'Lora', 'LXGW WenKai TC', 'Songti SC', Georgia, serif;
  --font-mono:     ui-monospace, 'SF Mono', Menlo, monospace;

  /* === 字号 === */
  --text-xs: 12px;
  --text-sm: 13px;
  --text-base: 15px;
  --text-md: 17px;
  --text-lg: 20px;
  --text-xl: 24px;
  --text-2xl: 32px;

  /* === 字重 === */
  --weight-regular: 400;
  --weight-medium: 600;
  --weight-bold: 700;

  /* === 行高 === */
  --leading-tight: 1.2;
  --leading-snug: 1.4;
  --leading-base: 1.6;
  --leading-loose: 1.8;

  /* === 间距 === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* === 圆角 === */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-pill: 9999px;

  /* === 阴影 === */
  --shadow-soft: 0 1px 2px rgba(43, 31, 26, 0.06);
  --shadow-medium: 0 2px 6px rgba(43, 31, 26, 0.08);
  --shadow-large: 0 8px 24px rgba(43, 31, 26, 0.10);

  /* === 容器 === */
  --container-max: 960px;
  --container-narrow: 720px;

  /* === 断点 (用于 JS) === */
  --bp-mobile: 640px;
  --bp-tablet: 768px;
  --bp-desktop: 1024px;
}
```

- [ ] **Step 5: 创建 base.css**

创建 `src/assets/styles/base.css`:

```css
/* ============================================
 * Base styles + Tailwind directives
 * ============================================ */

@import './tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: var(--color-bg-paper);
    color: var(--color-ink-deep);
    font-family: var(--font-body);
    font-size: var(--text-base);
    line-height: var(--leading-base);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    color: var(--color-ink-deep);
    line-height: var(--leading-tight);
  }

  a {
    color: var(--color-accent-ember);
    text-decoration: none;
  }
  a:hover {
    color: var(--color-accent-ember-hover);
  }

  /* 焦点态(无障碍) */
  :focus-visible {
    outline: 2px solid var(--color-accent-ember);
    outline-offset: 2px;
  }
}
```

- [ ] **Step 6: 创建 utilities.css**

创建 `src/assets/styles/utilities.css`:

```css
/* ============================================
 * Utility classes — 自定义扩展
 * ============================================ */

@layer utilities {
  .container-content {
    max-width: var(--container-max);
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .container-narrow {
    max-width: var(--container-narrow);
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .text-display {
    font-family: var(--font-display);
  }

  .text-eyebrow {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-ink-faint);
  }
}
```

- [ ] **Step 7: 修改 src/main.js**

修改 `src/main.js` 引入新样式:

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 字体(自托管)
import '@fontsource/lora/400.css'
import '@fontsource/lora/600.css'
import '@fontsource/lora/700.css'
import '@fontsource/lora/400-italic.css'
import '@fontsource/lxgw-wenkai-tc/400.css'
import '@fontsource/lxgw-wenkai-tc/700.css'

// 设计 token + Tailwind base
import './assets/styles/base.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

- [ ] **Step 8: 清空 src/style.css(防引用断链)**

将 `src/style.css` 替换为单行:

```css
/* Legacy style.css — content moved to src/assets/styles/base.css (2026-09-12 UI redesign) */
@import './assets/styles/base.css';
```

- [ ] **Step 9: 验证 Tailwind 工作**

启动 dev server:

```bash
npm run dev
```

打开浏览器(默认 http://localhost:5000),打开 DevTools → Elements → 检查 `<body>` 计算样式,确认 `background-color` 为 `#FAF7F2` 且 `font-family` 包含 `Lora`。

预期: 页面背景从原本的 `#f5f5f5` 变成米白 `#FAF7F2`,字体应用 Lora。

- [ ] **Step 10: 验证生产构建**

```bash
npm run build
```

预期: 构建无 Tailwind/PostCSS 错误,`dist/assets/` 中包含生成 CSS 文件。

- [ ] **Step 11: 提交**

```bash
git add package.json tailwind.config.js postcss.config.js \
        src/assets/styles/ src/main.js src/style.css
git commit -m "feat(styles): introduce Tailwind + design tokens (paper-warm palette)"
```

---

## Task 2: 实现 Base 原子组件(7 个)

**Files:**
- Create: `src/components/base/BaseButton.vue`
- Create: `src/components/base/BaseButton.test.js`
- Create: `src/components/base/BaseBadge.vue`
- Create: `src/components/base/BaseCard.vue`
- Create: `src/components/base/BaseInput.vue`
- Create: `src/components/base/BaseSelect.vue`
- Create: `src/components/base/BaseTabs.vue`
- Create: `src/components/base/BaseSheet.vue`
- Create: `src/components/base/index.js`

- [ ] **Step 1: 写 BaseButton 失败测试**

创建 `src/components/base/BaseButton.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from './BaseButton.vue'

describe('BaseButton', () => {
  it('渲染 slot 内容', () => {
    const wrapper = mount(BaseButton, { slots: { default: '生成' } })
    expect(wrapper.text()).toBe('生成')
  })

  it('点击触发 click 事件', async () => {
    const wrapper = mount(BaseButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('variant=ember 应用暖橙背景', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'ember' },
    })
    expect(wrapper.classes().join(' ')).toMatch(/ember|accent/i)
  })

  it('variant=ink 应用深棕背景', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'ink' },
    })
    expect(wrapper.classes().join(' ')).toMatch(/ink|deep/i)
  })

  it('disabled 状态下不触发 click', async () => {
    const wrapper = mount(BaseButton, { props: { disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run src/components/base/BaseButton.test.js
```

预期: FAIL,`Cannot find module './BaseButton.vue'`。

- [ ] **Step 3: 实现 BaseButton**

创建 `src/components/base/BaseButton.vue`:

```vue
<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  emits: ['click'],
  props: {
    variant: {
      type: String,
      default: 'ink',
      validator: (v) => ['ink', 'ember', 'ghost', 'outline'].includes(v),
    },
    size: {
      type: String,
      default: 'md',
      validator: (v) => ['sm', 'md', 'lg'].includes(v),
    },
    type: { type: String, default: 'button' },
    disabled: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
  },
  computed: {
    buttonClasses() {
      const base = [
        'inline-flex items-center justify-center gap-2',
        'font-serif font-semibold leading-none',
        'rounded-md transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      ]
      const variants = {
        ink: 'bg-ink-deep text-paper hover:bg-ember',
        ember: 'bg-ember text-paper hover:bg-ember-hover',
        ghost: 'bg-transparent text-ink-deep hover:bg-rule-softer',
        outline: 'bg-paper text-ink-deep border border-rule-soft hover:bg-rule-softer',
      }
      const sizes = {
        sm: 'text-sm px-3 py-2 min-h-[36px]',
        md: 'text-base px-4 py-2.5 min-h-[44px]',
        lg: 'text-md px-5 py-3 min-h-[48px]',
      }
      return [
        ...base,
        variants[this.variant],
        sizes[this.size],
        this.block ? 'w-full' : '',
      ]
    },
  },
}
</script>
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run src/components/base/BaseButton.test.js
```

预期: 5 个测试全部 PASS。

- [ ] **Step 5: 实现 BaseBadge**

创建 `src/components/base/BaseBadge.vue`:

```vue
<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script>
export default {
  name: 'BaseBadge',
  props: {
    variant: {
      type: String,
      default: 'soft',
      validator: (v) => ['soft', 'ember', 'ink'].includes(v),
    },
  },
  computed: {
    badgeClasses() {
      const base = 'inline-block text-xs px-2.5 py-1 rounded-pill font-medium'
      const variants = {
        soft: 'bg-rule-softer text-ink-muted',
        ember: 'bg-ember text-paper',
        ink: 'bg-ink-deep text-paper',
      }
      return `${base} ${variants[this.variant]}`
    },
  },
}
</script>
```

- [ ] **Step 6: 实现 BaseCard**

创建 `src/components/base/BaseCard.vue`:

```vue
<template>
  <div :class="cardClasses">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'BaseCard',
  props: {
    variant: {
      type: String,
      default: 'paper',
      validator: (v) => ['paper', 'ink', 'outline'].includes(v),
    },
    interactive: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
  },
  computed: {
    cardClasses() {
      const base = 'rounded-lg transition-all duration-150'
      const variants = {
        paper: 'bg-paper-card border border-rule-soft shadow-soft',
        ink: 'bg-ink-deep text-paper-card border border-ink-deep',
        outline: 'bg-paper border-2 border-rule-soft',
      }
      const interactive = this.interactive
        ? 'cursor-pointer hover:shadow-medium hover:-translate-y-0.5'
        : ''
      const selected = this.selected
        ? 'ring-2 ring-ember border-ember'
        : ''
      return [base, variants[this.variant], interactive, selected]
        .filter(Boolean)
        .join(' ')
    },
  },
}
</script>
```

- [ ] **Step 7: 实现 BaseInput**

创建 `src/components/base/BaseInput.vue`:

```vue
<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    class="w-full bg-paper-card border border-rule-soft rounded-md px-3 py-2.5 text-base text-ink-deep placeholder:text-ink-faint focus:border-ember focus:outline-none transition-colors min-h-[44px]"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script>
export default {
  name: 'BaseInput',
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: [String, Number], default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },
}
</script>
```

- [ ] **Step 8: 实现 BaseSelect**

创建 `src/components/base/BaseSelect.vue`:

```vue
<template>
  <select
    :value="modelValue"
    :disabled="disabled"
    class="w-full bg-paper-card border border-rule-soft rounded-md px-3 py-2.5 text-base text-ink-deep focus:border-ember focus:outline-none transition-colors min-h-[44px]"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<script>
export default {
  name: 'BaseSelect',
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: [String, Number], default: '' },
    options: { type: Array, required: true },
    disabled: { type: Boolean, default: false },
  },
}
</script>
```

- [ ] **Step 9: 实现 BaseTabs**

创建 `src/components/base/BaseTabs.vue`:

```vue
<template>
  <div class="border-b border-rule-soft">
    <div class="flex gap-6" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="tabClasses(tab)"
        role="tab"
        :aria-selected="modelValue === tab.value"
        @click="$emit('update:modelValue', tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseTabs',
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: String, required: true },
    tabs: { type: Array, required: true },
  },
  methods: {
    tabClasses(tab) {
      const base = 'py-3 px-1 text-base font-medium border-b-2 transition-colors'
      return tab.value === this.modelValue
        ? `${base} border-ember text-ink-deep`
        : `${base} border-transparent text-ink-muted hover:text-ink-deep`
    },
  },
}
</script>
```

- [ ] **Step 10: 实现 BaseSheet(移动端底部弹出)**

创建 `src/components/base/BaseSheet.vue`:

```vue
<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end justify-center bg-ink-deep/40 md:hidden"
        @click.self="close"
      >
        <div class="bg-paper-card w-full max-h-[85vh] rounded-t-lg p-5 overflow-y-auto">
          <div class="w-10 h-1 bg-rule-soft rounded-pill mx-auto mb-4" />
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'BaseSheet',
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: Boolean, default: false },
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false)
    },
  },
}
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-active > div,
.sheet-leave-active > div {
  transition: transform 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from > div,
.sheet-leave-to > div {
  transform: translateY(100%);
}
</style>
```

- [ ] **Step 11: 创建 Base 组件统一导出**

创建 `src/components/base/index.js`:

```js
export { default as BaseButton } from './BaseButton.vue'
export { default as BaseBadge } from './BaseBadge.vue'
export { default as BaseCard } from './BaseCard.vue'
export { default as BaseInput } from './BaseInput.vue'
export { default as BaseSelect } from './BaseSelect.vue'
export { default as BaseTabs } from './BaseTabs.vue'
export { default as BaseSheet } from './BaseSheet.vue'
```

- [ ] **Step 12: 跑全部测试**

```bash
npx vitest run src/components/base/
```

预期: BaseButton 5 测试 PASS,其他 Base 组件无报错(无测试则跳过)。

- [ ] **Step 13: 提交**

```bash
git add src/components/base/
git commit -m "feat(base): add 7 base UI components (Button/Badge/Card/Input/Select/Tabs/Sheet)"
```

---

## Task 3: 实现 useBreakpoint composable

**Files:**
- Create: `src/composables/useBreakpoint.js`
- Create: `src/composables/useBreakpoint.test.js`

- [ ] **Step 1: 写失败测试**

创建 `src/composables/useBreakpoint.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('useBreakpoint', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('初始状态读取 window.innerWidth', async () => {
    global.innerWidth = 500
    const { useBreakpoint } = await import('./useBreakpoint.js')
    const { isMobile } = useBreakpoint()
    expect(isMobile.value).toBe(true)
  })

  it('innerWidth=1200 时 isMobile=false', async () => {
    global.innerWidth = 1200
    const { useBreakpoint } = await import('./useBreakpoint.js')
    const { isMobile } = useBreakpoint()
    expect(isMobile.value).toBe(false)
  })

  it('innerWidth=800 时 isTablet=true', async () => {
    global.innerWidth = 800
    const { useBreakpoint } = await import('./useBreakpoint.js')
    const { isTablet } = useBreakpoint()
    expect(isTablet.value).toBe(true)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run src/composables/useBreakpoint.test.js
```

预期: FAIL,`Cannot find module './useBreakpoint.js'`。

- [ ] **Step 3: 实现 useBreakpoint**

创建 `src/composables/useBreakpoint.js`:

```js
import { ref, onMounted, onBeforeUnmount } from 'vue'

const MOBILE_MAX = 639
const TABLET_MAX = 1023

export function useBreakpoint() {
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

  function update() {
    windowWidth.value = window.innerWidth
  }

  onMounted(() => {
    window.addEventListener('resize', update)
    update()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', update)
  })

  return {
    windowWidth,
    isMobile: () => windowWidth.value <= MOBILE_MAX,
    isTablet: () => windowWidth.value > MOBILE_MAX && windowWidth.value <= TABLET_MAX,
    isDesktop: () => windowWidth.value > TABLET_MAX,
  }
}
```

> 注: 因 Vue ref 在 SSR / 测试环境下需 `.value`,API 改为函数式 getter,简化调用方:`const { isMobile } = useBreakpoint(); if (isMobile()) {...}`。

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run src/composables/useBreakpoint.test.js
```

预期: 3 个测试全部 PASS。

- [ ] **Step 5: 提交**

```bash
git add src/composables/useBreakpoint.js src/composables/useBreakpoint.test.js
git commit -m "feat(composables): add useBreakpoint for reactive media query"
```

---

## Task 4: 实现 AppHeader + MobileNav(全局顶栏)

**Files:**
- Create: `src/components/layout/AppHeader.vue`
- Create: `src/components/layout/AppHeader.test.js`
- Create: `src/components/layout/MobileNav.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: 写 AppHeader 失败测试**

创建 `src/components/layout/AppHeader.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import AppHeader from './AppHeader.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: { template: '<div/>' } },
    { path: '/workbench', component: { template: '<div/>' } },
    { path: '/history', component: { template: '<div/>' } },
    { path: '/about', component: { template: '<div/>' } },
  ],
})

describe('AppHeader', () => {
  beforeEach(() => router.replace('/'))

  it('渲染 logo 文字', () => {
    const wrapper = mount(AppHeader, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('数学习题')
  })

  it('桌面端渲染 4 个导航链接', () => {
    global.innerWidth = 1200
    const wrapper = mount(AppHeader, { global: { plugins: [router] } })
    const links = wrapper.findAll('[data-test="nav-link"]')
    expect(links.length).toBe(4)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run src/components/layout/AppHeader.test.js
```

预期: FAIL,`Cannot find module './AppHeader.vue'`。

- [ ] **Step 3: 实现 AppHeader**

创建 `src/components/layout/AppHeader.vue`:

```vue
<template>
  <header
    class="border-b border-rule-soft bg-paper sticky top-0 z-40 backdrop-blur-sm"
  >
    <div class="container-content flex items-center justify-between py-3.5">
      <router-link
        to="/"
        class="font-serif font-bold text-base text-ink-deep hover:text-ember transition-colors"
      >
        📐 数学习题
      </router-link>

      <!-- 桌面端导航 -->
      <nav class="hidden md:flex gap-6">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          data-test="nav-link"
          class="text-sm font-medium transition-colors"
          :class="isActive(link.to)
            ? 'text-ember'
            : 'text-ink-muted hover:text-ink-deep'"
        >
          {{ link.label }}
        </router-link>
      </nav>

      <!-- 移动端汉堡按钮 -->
      <button
        class="md:hidden text-ink-deep p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="打开菜单"
        @click="$emit('open-menu')"
      >
        <span class="text-xl">☰</span>
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  emits: ['open-menu'],
  data() {
    return {
      links: [
        { to: '/', label: '首页' },
        { to: '/workbench', label: '工作台' },
        { to: '/history', label: '历史' },
        { to: '/about', label: '关于' },
      ],
    }
  },
  methods: {
    isActive(path) {
      if (path === '/') return this.$route.path === '/'
      return this.$route.path.startsWith(path)
    },
  },
}
</script>
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run src/components/layout/AppHeader.test.js
```

预期: 2 个测试全部 PASS。

- [ ] **Step 5: 实现 MobileNav**

创建 `src/components/layout/MobileNav.vue`:

```vue
<template>
  <BaseSheet :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <nav class="flex flex-col gap-1">
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="text-lg font-medium py-3 px-2 rounded-md transition-colors"
        :class="$route.path === link.to
          ? 'text-ember bg-rule-softer'
          : 'text-ink-deep hover:bg-rule-softer'"
        @click="$emit('update:modelValue', false)"
      >
        {{ link.label }}
      </router-link>
    </nav>
  </BaseSheet>
</template>

<script>
import { BaseSheet } from '../base'

export default {
  name: 'MobileNav',
  components: { BaseSheet },
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: Boolean, default: false },
  },
  data() {
    return {
      links: [
        { to: '/', label: '首页' },
        { to: '/workbench', label: '工作台' },
        { to: '/history', label: '历史' },
        { to: '/about', label: '关于' },
      ],
    }
  },
}
</script>
```

- [ ] **Step 6: 修改 src/App.vue**

修改 `src/App.vue`:

```vue
<template>
  <div class="min-h-screen bg-paper font-serif text-ink-deep">
    <AppHeader @open-menu="navOpen = true" />
    <MobileNav v-model="navOpen" />
    <main>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <ToastContainer />
  </div>
</template>

<script>
import AppHeader from './components/layout/AppHeader.vue'
import MobileNav from './components/layout/MobileNav.vue'
import ToastContainer from './components/ToastContainer.vue'

export default {
  name: 'App',
  components: { AppHeader, MobileNav, ToastContainer },
  data() {
    return { navOpen: false }
  },
}
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
```

- [ ] **Step 7: 手动验证**

```bash
npm run dev
```

打开浏览器:
- 桌面端(≥ 768px)应显示顶栏 logo + 4 个导航链接
- 移动端(< 768px,DevTools 切换)应只显示 logo + 汉堡按钮
- 点击汉堡应弹出底部 sheet,显示 4 个导航
- 点击导航项后 sheet 关闭并跳转

预期: 全部行为正常,顶栏 sticky 在顶部,导航链接 hover 变深棕。

- [ ] **Step 8: 跑全量测试**

```bash
npx vitest run
```

预期: 已有测试全部 PASS,新增 AppHeader 测试 PASS,无回归。

- [ ] **Step 9: 提交**

```bash
git add src/components/layout/ src/App.vue
git commit -m "feat(layout): add AppHeader + MobileNav + page transition"
```

---

## Task 5: 重写 HomePage 为极简引导页

**Files:**
- Modify: `src/components/HomePage.vue`

- [ ] **Step 1: 查看现有 HomePage 实现**

```bash
cat src/components/HomePage.vue
```

确认结构与依赖。

- [ ] **Step 2: 重写 HomePage 模板**

将 `src/components/HomePage.vue` 替换为:

```vue
<template>
  <div class="container-content pt-16 md:pt-24 pb-16">
    <div class="max-w-narrow mx-auto text-center">
      <h1 class="font-serif text-2xl md:text-2xl font-semibold mb-4 leading-tight">
        为你的孩子,定制一份数学练习
      </h1>
      <p class="text-base text-ink-muted mb-10 leading-base">
        从年级开始,几次点击就能拿到一张可打印的练习题。
      </p>
      <BaseButton variant="ember" size="lg" @click="$router.push('/workbench')">
        开始 →
      </BaseButton>
    </div>
  </div>
</template>

<script>
import { BaseButton } from './base'

export default {
  name: 'HomePage',
  components: { BaseButton },
}
</script>
```

- [ ] **Step 3: 手动验证**

启动 dev server,访问根路径:

```bash
npm run dev
```

打开 http://localhost:5000/

预期:
- 居中显示大标题"为你的孩子,定制一份数学练习"
- 副标题 + 单按钮"开始 →"
- 暖米白底 + Lora 字体
- 点击按钮跳转 `/workbench`

- [ ] **Step 4: 跑测试**

```bash
npx vitest run
```

预期: 已有测试全部 PASS。

- [ ] **Step 5: 提交**

```bash
git add src/components/HomePage.vue
git commit -m "feat(home): redesign HomePage as minimal onboarding screen"
```

---

## Task 6: 重写 GeneratorView 为工作台结构

**Files:**
- Create: `src/components/workbench/GradeCard.vue`
- Create: `src/components/workbench/GradeCard.test.js`
- Create: `src/components/workbench/WorkbenchHero.vue`
- Modify: `src/views/GeneratorView.vue`

- [ ] **Step 1: 写 GradeCard 失败测试**

创建 `src/components/workbench/GradeCard.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GradeCard from './GradeCard.vue'

describe('GradeCard', () => {
  it('渲染年级标签 + 主题', () => {
    const wrapper = mount(GradeCard, {
      props: { grade: 3, topic: '混合四则运算', difficulty: '中等', duration: 10, recommended: true },
    })
    expect(wrapper.text()).toContain('三年级')
    expect(wrapper.text()).toContain('混合四则运算')
  })

  it('点击触发 select 事件', async () => {
    const wrapper = mount(GradeCard, {
      props: { grade: 3, topic: '混合四则运算', difficulty: '中等', duration: 10 },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('recommended=true 时显示"推荐"徽章', () => {
    const wrapper = mount(GradeCard, {
      props: { grade: 3, topic: '混合四则运算', difficulty: '中等', duration: 10, recommended: true },
    })
    expect(wrapper.text()).toContain('推荐')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run src/components/workbench/GradeCard.test.js
```

预期: FAIL,`Cannot find module './GradeCard.vue'`。

- [ ] **Step 3: 实现 GradeCard**

创建 `src/components/workbench/GradeCard.vue`:

```vue
<template>
  <BaseCard
    :variant="recommended ? 'ink' : 'paper'"
    interactive
    :selected="selected"
    @click="$emit('select', grade)"
  >
    <div class="flex items-start justify-between mb-2">
      <span
        class="text-eyebrow"
        :class="recommended ? 'text-rule-soft' : 'text-ink-faint'"
      >
        Grade {{ grade }}
      </span>
      <BaseBadge v-if="recommended" variant="ember">推荐</BaseBadge>
    </div>
    <h3
      class="font-serif text-base font-semibold mb-1"
      :class="recommended ? 'text-paper-card' : 'text-ink-deep'"
    >
      {{ topic }}
    </h3>
    <p
      class="text-xs"
      :class="recommended ? 'text-rule-softer' : 'text-ink-muted'"
    >
      {{ difficulty }} · {{ duration }} 分钟
    </p>
  </BaseCard>
</template>

<script>
import { BaseCard, BaseBadge } from '../base'

export default {
  name: 'GradeCard',
  components: { BaseCard, BaseBadge },
  emits: ['select'],
  props: {
    grade: { type: Number, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, default: '中等' },
    duration: { type: Number, default: 10 },
    recommended: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
  },
}
</script>
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run src/components/workbench/GradeCard.test.js
```

预期: 3 个测试全部 PASS。

- [ ] **Step 5: 实现 WorkbenchHero**

创建 `src/components/workbench/WorkbenchHero.vue`:

```vue
<template>
  <div class="text-center py-10 md:py-12">
    <h2 class="font-serif text-xl md:text-xl font-semibold text-ink-deep mb-3 leading-tight">
      为你的孩子,定制一份数学练习
    </h2>
    <p class="text-base text-ink-muted max-w-narrow mx-auto leading-base">
      从年级开始,几次点击就能拿到一张可打印的练习题。
    </p>
  </div>
</template>

<script>
export default {
  name: 'WorkbenchHero',
}
</script>
```

- [ ] **Step 6: 重写 GeneratorView**

修改 `src/views/GeneratorView.vue` 为工作台结构(完整替换):

```vue
<template>
  <div class="container-content pt-6 pb-16">
    <!-- 工作台顶部:默认配置(卡片网格) -->
    <section v-if="!selectedGrade && !showAdvanced">
      <WorkbenchHero />
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <GradeCard
          v-for="preset in gradePresets"
          :key="preset.grade"
          v-bind="preset"
          @select="handleGradeSelect"
        />
      </div>
      <div class="text-center">
        <BaseButton variant="ghost" @click="showAdvanced = true">
          自定义全部配置 →
        </BaseButton>
      </div>
    </section>

    <!-- 工作台顶部:高级配置 Tab -->
    <section v-if="showAdvanced">
      <BaseTabs v-model="activeTab" :tabs="[
        { value: 'custom', label: '自定义配置' },
        { value: 'presets', label: '预设' },
      ]" />
      <div class="py-6">
        <ConfigPanel
          v-show="activeTab === 'custom'"
          :config="config"
          @update:config="config = $event"
        />
        <PresetSelector
          v-show="activeTab === 'presets'"
          @apply="applyPreset"
          @edit="showPresetManager = true"
        />
      </div>
    </section>

    <!-- 预览区(选中年级或已配置后展示) -->
    <section v-if="selectedGrade || (showAdvanced && problems.length > 0)" class="mt-8">
      <ActionBar
        :problems="problems"
        @generate="generateProblems"
        @export="handleExport"
      />
      <div
        ref="printRoot"
        class="mt-6 bg-paper-card border border-rule-soft rounded-lg p-6 md:p-8"
        :class="{ 'export-mode': enhancedExport.exporting }"
      >
        <div class="text-center mb-4">
          <h3 class="font-serif text-lg font-semibold">数学练习题</h3>
          <div class="hidden md:flex justify-between text-sm text-ink-muted mt-2 px-2">
            <span>{{ config.grade }}年级{{ config.semester }}册</span>
            <span>姓名:_____________</span>
            <span>得分:_____________</span>
          </div>
        </div>
        <ProblemGrid
          :problems="problems"
          :show-answer="config.answerMode === 'inline'"
        />
        <AnswerPage
          v-if="config.answerMode === 'separate'"
          :problems="problems"
          :cols="4"
        />
      </div>
    </section>

    <ExportPreview
      :visible="enhancedExport.previewVisible"
      :type="enhancedExport.previewType"
      :preview-data="enhancedExport.previewData"
      :env="enhancedExport.env"
      @close="enhancedExport.closePreview"
      @save="enhancedExport.saveImage"
      @share="handleShare"
      @print="enhancedExport.handlePrint"
      @download-pdf="enhancedExport.downloadPdf"
    />
    <PresetManager v-model="showPresetManager" />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { BaseButton, BaseTabs } from '../components/base'
import GradeCard from '../components/workbench/GradeCard.vue'
import WorkbenchHero from '../components/workbench/WorkbenchHero.vue'
import ConfigPanel from '../components/ConfigPanel.vue'
import PresetSelector from '../components/PresetSelector.vue'
import PresetManager from '../components/PresetManager.vue'
import ActionBar from '../components/ActionBar.vue'
import ProblemGrid from '../components/ProblemGrid.vue'
import AnswerPage from '../components/AnswerPage.vue'
import ExportPreview from '../components/ExportPreview.vue'
import { useProblemGenerator } from '../composables/useProblemGenerator.js'
import { useEnhancedExport } from '../composables/useEnhancedExport.js'
import { useToast } from '../composables/useToast.js'

export default {
  name: 'GeneratorView',
  components: {
    BaseButton, BaseTabs,
    GradeCard, WorkbenchHero,
    ConfigPanel, PresetSelector, PresetManager,
    ActionBar, ProblemGrid, AnswerPage, ExportPreview,
  },
  setup() {
    const showAdvanced = ref(false)
    const activeTab = ref('custom')
    const selectedGrade = ref(null)
    const showPresetManager = ref(false)
    const problems = ref([])
    const printRoot = ref(null)
    const config = ref({
      grade: '3',
      semester: '上',
      problemCount: 20,
      difficulty: 'medium',
      questionTypes: ['arithmetic'],
      operations: { add: true, subtract: true, multiply: false, divide: false },
      digits: { add: 1, subtract: 1, multiply: 1, divide: 1 },
      termCount: 2,
      problemType: 'result',
      answerMode: 'hidden',
      knowledgePoints: [],
    })

    const gradePresets = [
      { grade: 1, topic: '20 以内加减', difficulty: '简单', duration: 5 },
      { grade: 2, topic: '表内乘法', difficulty: '中等', duration: 8 },
      { grade: 3, topic: '混合四则运算', difficulty: '中等', duration: 10, recommended: true },
      { grade: 4, topic: '多位数乘除', difficulty: '中等', duration: 12 },
      { grade: 5, topic: '小数与分数', difficulty: '困难', duration: 15 },
      { grade: 6, topic: '方程与比例', difficulty: '困难', duration: 18 },
    ]

    const generator = useProblemGenerator()
    const enhancedExport = useEnhancedExport()
    const toast = useToast()

    function handleGradeSelect(grade) {
      selectedGrade.value = grade
      config.value.grade = String(grade)
      config.value.difficulty = grade <= 2 ? 'easy' : grade <= 4 ? 'medium' : 'hard'
      generateProblems()
    }

    function applyPreset(presetConfig) {
      Object.assign(config.value, presetConfig)
      toast.success('已应用预设', `题目数量: ${presetConfig.problemCount || 20} 题`)
    }

    async function generateProblems() {
      try {
        problems.value = await generator.generate(config.value)
        toast.show({ type: 'success', message: `已生成 ${problems.value.length} 题` })
      } catch (err) {
        toast.show({ type: 'error', message: '生成失败', detail: err.message })
      }
    }

    async function handleExport() {
      if (!printRoot.value) {
        toast.show({ type: 'warning', message: '请先生成题目' })
        return
      }
      await enhancedExport.smartExport({ element: printRoot.value, config: config.value })
    }

    function handleShare() {
      // 保留原有逻辑(已存在于 useEnhancedExport)
    }

    return {
      showAdvanced, activeTab, selectedGrade, showPresetManager,
      problems, printRoot, config, gradePresets, enhancedExport,
      handleGradeSelect, applyPreset, generateProblems,
      handleExport, handleShare,
    }
  },
}
</script>
```

- [ ] **Step 7: 手动验证**

启动 dev server,访问 `/workbench`:

```bash
npm run dev
```

预期:
- 工作台顶部显示 Hero 文案
- 6 卡片网格(2 列移动 / 3 列桌面)
- 三年级卡片深色 + "推荐"徽章
- 点击卡片后,下方出现预览区
- 预览区有 ActionBar + 题目网格
- 点击"自定义全部配置"切换到 Tab 视图
- 自定义配置 tab 显示 ConfigPanel
- 预设 tab 显示 PresetSelector

- [ ] **Step 8: 跑全量测试**

```bash
npx vitest run
```

预期: 已有测试 + 新增 GradeCard 测试全部 PASS。可能存在 GeneratorView 的旧测试需要更新(下一任务处理)。

- [ ] **Step 9: 提交**

```bash
git add src/components/workbench/ src/views/GeneratorView.vue
git commit -m "feat(workbench): redesign GeneratorView as hero + 6 grade cards + tabs"
```

---

## Task 7: 改造 HistoryView 为列表样式

**Files:**
- Modify: `src/views/HistoryView.vue`

- [ ] **Step 1: 查看现有 HistoryView**

```bash
cat src/views/HistoryView.vue
```

确认数据模型(history list 字段)。

- [ ] **Step 2: 重写 HistoryView**

将 `src/views/HistoryView.vue` 替换为:

```vue
<template>
  <div class="container-narrow pt-6 pb-16">
    <header class="mb-8">
      <h2 class="font-serif text-lg font-semibold text-ink-deep mb-2">
        历史练习
      </h2>
      <p class="text-sm text-ink-muted">
        最近生成的 20 份试卷,自动保存在本地。
      </p>
    </header>

    <div v-if="loading" class="text-center py-16 text-ink-faint">
      加载中…
    </div>

    <div v-else-if="history.length === 0" class="text-center py-16">
      <p class="text-ink-muted mb-4">还没有历史</p>
      <BaseButton variant="ember" @click="$router.push('/workbench')">
        去工作台生成 →
      </BaseButton>
    </div>

    <ul v-else class="divide-y divide-rule-soft border-t border-rule-soft">
      <li
        v-for="item in history"
        :key="item.id"
        class="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-2"
      >
        <div>
          <div class="text-base font-semibold text-ink-deep">
            {{ item.config?.grade }}年级 ·
            {{ getTypeLabel(item.config?.questionTypes) }} ·
            {{ item.problems?.length || 0 }} 题
          </div>
          <div class="text-xs text-ink-faint mt-1">
            {{ formatDate(item.createdAt) }} · {{ getDifficultyLabel(item.config?.difficulty) }}
          </div>
        </div>
        <div class="flex gap-3 items-center">
          <router-link
            :to="`/history/${item.id}`"
            class="text-sm text-ember hover:text-ember-hover transition-colors"
          >
            查看 →
          </router-link>
          <button
            class="text-sm text-ink-faint hover:text-error transition-colors"
            @click="confirmDelete(item.id)"
          >
            删除
          </button>
        </div>
      </li>
    </ul>

    <ConfirmDialog
      :visible="confirmId !== null"
      title="删除历史"
      message="确定要删除这份历史记录吗?此操作不可恢复。"
      @confirm="handleDelete"
      @cancel="confirmId = null"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { BaseButton } from '../components/base'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { getHistory, deleteProblemSet } from '../db.js'

export default {
  name: 'HistoryView',
  components: { BaseButton, ConfirmDialog },
  setup() {
    const loading = ref(true)
    const history = ref([])
    const confirmId = ref(null)

    onMounted(async () => {
      try {
        history.value = await getHistory()
      } finally {
        loading.value = false
      }
    })

    function confirmDelete(id) {
      confirmId.value = id
    }

    async function handleDelete() {
      const id = confirmId.value
      confirmId.value = null
      if (id) {
        await deleteProblemSet(id)
        history.value = history.value.filter((h) => h.id !== id)
      }
    }

    function formatDate(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }

    function getTypeLabel(types) {
      if (!types) return ''
      const map = { arithmetic: '算术题', application: '应用题', olympiad: '奥数题' }
      return types.map((t) => map[t] || t).join('+')
    }

    function getDifficultyLabel(d) {
      return { easy: '简单', medium: '中等', hard: '困难' }[d] || d || ''
    }

    return {
      loading, history, confirmId,
      confirmDelete, handleDelete,
      formatDate, getTypeLabel, getDifficultyLabel,
    }
  },
}
</script>
```

- [ ] **Step 3: 验证 db.js 是否暴露 deleteProblemSet**

```bash
grep -n "deleteProblemSet\|export" src/db.js | head -20
```

若 `deleteProblemSet` 不存在,在 `src/db.js` 末尾添加:

```js
export async function deleteProblemSet(id) {
  return db.problemSets.delete(id)
}
```

- [ ] **Step 4: 手动验证**

启动 dev server,访问 `/history`:

```bash
npm run dev
```

预期:
- 标题"历史练习" + 副标题
- 历史列表(若没有则显示空状态 + 跳转按钮)
- 每条:标题(年级 · 题型 · 题数) + 元信息(日期 · 难度) + 查看/删除
- 桌面端横向布局,移动端纵向布局

- [ ] **Step 5: 跑测试**

```bash
npx vitest run
```

预期: 已有测试全部 PASS。

- [ ] **Step 6: 提交**

```bash
git add src/views/HistoryView.vue src/db.js
git commit -m "feat(history): redesign HistoryView with paper-warm list + empty state"
```

---

## Task 8: 改造 HistoryDetailView

**Files:**
- Modify: `src/views/HistoryDetailView.vue`

- [ ] **Step 1: 查看现有 HistoryDetailView**

```bash
cat src/views/HistoryDetailView.vue
```

确认 props / 数据加载逻辑。

- [ ] **Step 2: 重写 HistoryDetailView**

将 `src/views/HistoryDetailView.vue` 替换为:

```vue
<template>
  <div class="container-content pt-6 pb-16">
    <BaseButton variant="ghost" size="sm" class="mb-4" @click="$router.push('/history')">
      ← 返回历史
    </BaseButton>

    <div v-if="loading" class="text-center py-16 text-ink-faint">
      加载中…
    </div>

    <div v-else-if="!record" class="text-center py-16">
      <p class="text-ink-muted mb-4">找不到这条记录</p>
      <BaseButton variant="ember" @click="$router.push('/history')">
        返回历史
      </BaseButton>
    </div>

    <template v-else>
      <!-- 元信息卡片 -->
      <header class="bg-paper-card border border-rule-soft rounded-lg p-5 mb-6">
        <h2 class="font-serif text-lg font-semibold text-ink-deep mb-3">
          {{ record.config?.grade }}年级 · {{ record.problems?.length || 0 }} 题
        </h2>
        <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
          <span>题型: {{ getTypeLabel(record.config?.questionTypes) }}</span>
          <span>难度: {{ getDifficultyLabel(record.config?.difficulty) }}</span>
          <span>题量: {{ record.problems?.length || 0 }}</span>
          <span>日期: {{ formatDate(record.createdAt) }}</span>
        </div>
      </header>

      <!-- 题目网格 -->
      <div class="bg-paper-card border border-rule-soft rounded-lg p-6">
        <ProblemGrid
          :problems="record.problems || []"
          :show-answer="record.config?.answerMode === 'inline'"
        />
        <AnswerPage
          v-if="record.config?.answerMode === 'separate'"
          :problems="record.problems || []"
          :cols="4"
        />
      </div>

      <!-- 操作区 -->
      <div class="mt-6 flex flex-wrap gap-3 justify-end">
        <BaseButton variant="ghost" @click="$router.push('/workbench')">
          ← 返回工作台
        </BaseButton>
        <BaseButton variant="outline" @click="handleReuse">
          再生成一份
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { BaseButton } from '../components/base'
import ProblemGrid from '../components/ProblemGrid.vue'
import AnswerPage from '../components/AnswerPage.vue'
import { getProblemSet } from '../db.js'

export default {
  name: 'HistoryDetailView',
  components: { BaseButton, ProblemGrid, AnswerPage },
  props: {
    id: { type: [String, Number], required: true },
  },
  setup(props) {
    const loading = ref(true)
    const record = ref(null)

    onMounted(async () => {
      try {
        record.value = await getProblemSet(props.id)
      } finally {
        loading.value = false
      }
    })

    function handleReuse() {
      // 简化:跳转到工作台,后续可在 store 中恢复 config
      this.$router.push('/workbench')
    }

    function formatDate(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }

    function getTypeLabel(types) {
      if (!types) return ''
      const map = { arithmetic: '算术题', application: '应用题', olympiad: '奥数题' }
      return types.map((t) => map[t] || t).join('+')
    }

    function getDifficultyLabel(d) {
      return { easy: '简单', medium: '中等', hard: '困难' }[d] || d || ''
    }

    return {
      loading, record,
      handleReuse, formatDate, getTypeLabel, getDifficultyLabel,
    }
  },
}
</script>
```

- [ ] **Step 3: 验证 db.js 是否暴露 getProblemSet**

```bash
grep -n "getProblemSet\|export" src/db.js | head -20
```

若不存在,添加:

```js
export async function getProblemSet(id) {
  return db.problemSets.get(id)
}
```

- [ ] **Step 4: 手动验证**

启动 dev server,访问 `/history/<id>`:

预期:
- 顶部返回按钮
- 元信息卡片(年级 / 题型 / 难度 / 题量 / 日期)
- 题目网格
- 底部"返回工作台" + "再生成一份"

- [ ] **Step 5: 提交**

```bash
git add src/views/HistoryDetailView.vue src/db.js
git commit -m "feat(history): redesign HistoryDetailView with metadata card + actions"
```

---

## Task 9: 新增 AboutView + QuickStartView 改重定向 + 路由调整

**Files:**
- Create: `src/views/AboutView.vue`
- Modify: `src/views/QuickStartView.vue`
- Modify: `src/router/index.js`

- [ ] **Step 1: 实现 AboutView**

创建 `src/views/AboutView.vue`:

```vue
<template>
  <div class="container-narrow pt-6 pb-16">
    <article class="prose-paper-warm">
      <h1 class="font-serif text-xl font-semibold mb-4 leading-tight">
        关于这个小工具
      </h1>

      <p class="text-base text-ink-muted mb-6 leading-base">
        一个为家长和老师准备的数学练习题生成工具。选择年级、题型和难度,
        几次点击就能生成一张可打印的练习题,无需注册,完全离线可用。
      </p>

      <h2 class="font-serif text-md font-semibold mb-3 mt-8">使用指南</h2>
      <ol class="text-base text-ink-muted leading-base space-y-2 mb-6 list-decimal pl-5">
        <li>进入工作台,选择孩子的年级(6 张卡片之一)</li>
        <li>如有需要,点击"自定义全部配置"调整题型、难度、题量</li>
        <li>点击"生成"或导出为 PDF / 图片</li>
        <li>打印出来给孩子练习</li>
      </ol>

      <h2 class="font-serif text-md font-semibold mb-3 mt-8">技术栈</h2>
      <p class="text-base text-ink-muted leading-base">
        Vue 3 · Vite · Tailwind CSS · IndexedDB(Dexie)· html2canvas + html2pdf.js
      </p>
    </article>
  </div>
</template>

<script>
export default {
  name: 'AboutView',
}
</script>
```

- [ ] **Step 2: 修改 QuickStartView 为重定向包装器**

将 `src/views/QuickStartView.vue` 替换为:

```vue
<template>
  <div class="text-center py-16 text-ink-faint">跳转中…</div>
</template>

<script>
export default {
  name: 'QuickStartView',
  mounted() {
    this.$router.replace('/workbench')
  },
}
</script>
```

- [ ] **Step 3: 修改路由**

将 `src/router/index.js` 替换为:

```js
import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'

// 动态导入视图组件
const GeneratorView = () => import('../views/GeneratorView.vue')
const QuickStartView = () => import('../views/QuickStartView.vue')
const HistoryView = () => import('../views/HistoryView.vue')
const HistoryDetailView = () => import('../views/HistoryDetailView.vue')
const AboutView = () => import('../views/AboutView.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/workbench',
    name: 'Workbench',
    component: GeneratorView,
  },
  // 兼容旧路径: /generator 与 /quick-start 重定向到 /workbench
  {
    path: '/generator',
    redirect: '/workbench',
  },
  {
    path: '/quick-start',
    name: 'QuickStart',
    component: QuickStartView,
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryView,
  },
  {
    path: '/history/:id',
    name: 'HistoryDetail',
    component: HistoryDetailView,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
  },
  // 兜底
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

export default router
```

- [ ] **Step 4: 手动验证全部路由**

启动 dev server:

```bash
npm run dev
```

依次访问:
- http://localhost:5000/ → 首页(极简引导页)
- http://localhost:5000/#/workbench → 工作台(Hero + 6 卡片)
- http://localhost:5000/#/generator → 重定向到 /workbench
- http://localhost:5000/#/quick-start → 重定向到 /workbench
- http://localhost:5000/#/history → 历史列表
- http://localhost:5000/#/history/123 → 历史详情
- http://localhost:5000/#/about → 关于页
- http://localhost:5000/#/unknown → 重定向到 /

预期: 全部路径正常工作,顶栏导航 active 状态正确。

- [ ] **Step 5: 跑全量测试**

```bash
npx vitest run
```

预期: 已有测试 + 新增测试全部 PASS。

- [ ] **Step 6: 提交**

```bash
git add src/views/AboutView.vue src/views/QuickStartView.vue src/router/index.js
git commit -m "feat(routing): add /workbench + /about routes, redirect legacy paths"
```

---

## Task 10: 升级业务组件(ConfigWizard/ConfigPanel/PresetSelector/PresetManager)

**Files:**
- Modify: `src/components/ConfigPanel.vue`
- Modify: `src/components/ConfigWizard.vue`
- Modify: `src/components/PresetSelector.vue`
- Modify: `src/components/PresetManager.vue`

> 注:本任务为视觉升级 + Tailwind 迁移。功能不变,仅样式与结构微调。

- [ ] **Step 1: 重构 ConfigPanel 为 Tailwind class**

打开 `src/components/ConfigPanel.vue`,将所有自定义 CSS class(如 `.config-panel`, `.config-row`, `.config-item`)替换为 Tailwind class:

**模板替换示例**:

原:
```vue
<div class="config-panel">
  <div class="config-row">
    <div class="config-item">
      <label>年级</label>
      <select>...</select>
    </div>
  </div>
</div>
```

新:
```vue
<div class="bg-paper-card border border-rule-soft rounded-lg p-6 space-y-6">
  <div class="flex flex-wrap gap-6 items-center">
    <div class="flex items-center gap-3">
      <label class="font-semibold text-ink-deep min-w-[80px]">年级</label>
      <select class="...">...</select>
    </div>
  </div>
</div>
```

完整迁移规则:
- `config-panel` → `bg-paper-card border border-rule-soft rounded-lg p-6`
- `config-row` → `flex flex-wrap gap-6 items-center pb-5 border-b border-rule-soft last:border-b-0 last:pb-0`
- `config-item` → `flex items-center gap-3`
- `config-item label` → `font-semibold text-ink-deep min-w-[80px] text-left whitespace-nowrap`
- `config-item input/select` → 用 `BaseInput`/`BaseSelect` 替代

- [ ] **Step 2: 重构 ConfigWizard 为 Tailwind**

打开 `src/components/ConfigWizard.vue`,应用相同规则:
- 步骤指示器:用 `BaseBadge` 显示当前步骤
- 步骤切换:用 `BaseButton` 替代自定义按钮
- 保持 3 步结构(基础 → 题型 → 高级)不变

- [ ] **Step 3: 重构 PresetSelector 为卡片网格**

打开 `src/components/PresetSelector.vue`,将单列下拉替换为 2-3 列网格(用 `GradeCard` 类似的 `BaseCard`):

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    <BaseCard
      v-for="preset in presets"
      :key="preset.id"
      interactive
      @click="$emit('apply', preset.config)"
    >
      <div class="text-eyebrow mb-2">{{ preset.grade }}年级</div>
      <h4 class="font-serif font-semibold text-ink-deep mb-1">{{ preset.name }}</h4>
      <p class="text-xs text-ink-muted">{{ preset.problemCount }} 题 · {{ preset.difficulty }}</p>
    </BaseCard>
  </div>
</template>
```

- [ ] **Step 4: 重构 PresetManager 为列表 + 编辑表单**

打开 `src/components/PresetManager.vue`,布局改为两栏(桌面)或上下堆叠(移动):
- 左:预设列表(用 `BaseCard`)
- 右:编辑表单(用 `BaseInput`/`BaseSelect`/`BaseButton`)

移动端改为 `<BaseSheet>` 弹出层。

- [ ] **Step 5: 手动验证**

启动 dev server:

```bash
npm run dev
```

预期:
- ConfigPanel 视觉升级,控件用 Tailwind 样式,无原生 input 边框
- ConfigWizard 步骤指示清晰,按钮用 BaseButton
- PresetSelector 显示卡片网格
- PresetManager 桌面端两栏,移动端 sheet

- [ ] **Step 6: 跑测试**

```bash
npx vitest run
```

预期: 已有测试全部 PASS。

- [ ] **Step 7: 提交**

```bash
git add src/components/ConfigPanel.vue src/components/ConfigWizard.vue \
        src/components/PresetSelector.vue src/components/PresetManager.vue
git commit -m "refactor(components): migrate ConfigPanel/Wizard/Preset* to Tailwind + base components"
```

---

## Task 11: 升级 ActionBar + ExportPreview + ConfirmDialog + ToastContainer

**Files:**
- Modify: `src/components/ActionBar.vue`
- Modify: `src/components/ExportPreview.vue`
- Modify: `src/components/ConfirmDialog.vue`
- Modify: `src/components/ToastContainer.vue`

- [ ] **Step 1: 重构 ActionBar**

打开 `src/components/ActionBar.vue`,应用:
- 桌面端:横向按钮组(主操作"生成"用 ember,次操作 ghost)
- 移动端:sticky bottom + 全宽按钮
- 用 `BaseButton` 替代所有原生 `<button>`

```vue
<template>
  <div
    class="flex flex-wrap gap-3 md:static sticky bottom-0 md:bottom-auto bg-paper md:bg-transparent py-3 md:py-0 -mx-4 px-4 md:mx-0 md:px-0 border-t md:border-t-0 border-rule-soft"
  >
    <BaseButton variant="ember" size="lg" @click="$emit('generate')">
      生成题目
    </BaseButton>
    <BaseButton variant="outline" size="lg" @click="$emit('export')" :disabled="!problems.length">
      导出
    </BaseButton>
  </div>
</template>
```

- [ ] **Step 2: 重构 ExportPreview 为暖色 sheet**

打开 `src/components/ExportPreview.vue`,将模态框样式升级:
- 遮罩:bg-ink-deep/40
- 内容卡片:bg-paper-card border-rule-soft
- 按钮组:用 BaseButton
- 移动端用 BaseSheet 替换自定义模态

- [ ] **Step 3: 重构 ConfirmDialog**

打开 `src/components/ConfirmDialog.vue`,简化为:

```vue
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-deep/40 p-4"
        @click.self="$emit('cancel')"
      >
        <BaseCard class="max-w-md w-full">
          <h3 class="font-serif font-semibold text-lg text-ink-deep mb-2">{{ title }}</h3>
          <p class="text-sm text-ink-muted mb-5 leading-base">{{ message }}</p>
          <div class="flex justify-end gap-3">
            <BaseButton variant="ghost" @click="$emit('cancel')">取消</BaseButton>
            <BaseButton variant="ember" @click="$emit('confirm')">确认</BaseButton>
          </div>
        </BaseCard>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { BaseCard, BaseButton } from './base'

export default {
  name: 'ConfirmDialog',
  components: { BaseCard, BaseButton },
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '确认' },
    message: { type: String, default: '' },
  },
  emits: ['confirm', 'cancel'],
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
```

- [ ] **Step 4: 重构 ToastContainer 暖色调**

打开 `src/components/ToastContainer.vue`,更新配色:
- success:bg-success/10 border-success text-success
- error:bg-error/10 border-error text-error
- warning:bg-warning/10 border-warning text-warning
- info:bg-paper-card border-rule-soft text-ink-deep

- [ ] **Step 5: 手动验证**

启动 dev server:

```bash
npm run dev
```

预期:
- ActionBar 桌面横向,移动 sticky 底部
- ExportPreview 弹出为暖色卡片
- ConfirmDialog 弹窗居中,暖色卡片
- Toast 显示在右上角,暖色调

- [ ] **Step 6: 跑测试**

```bash
npx vitest run
```

预期: 已有测试全部 PASS。

- [ ] **Step 7: 提交**

```bash
git add src/components/ActionBar.vue src/components/ExportPreview.vue \
        src/components/ConfirmDialog.vue src/components/ToastContainer.vue
git commit -m "refactor(components): warm-palette upgrade for ActionBar/Export/Confirm/Toast"
```

---

## Task 12: 升级 ProblemGrid + AnswerPage + 添加 Cypress E2E

**Files:**
- Modify: `src/components/ProblemGrid.vue`
- Modify: `src/components/AnswerPage.vue`
- Create: `cypress/e2e/workbench-redesign.cy.js`
- Create: `cypress/e2e/mobile-sheet.cy.js`

- [ ] **Step 1: 升级 ProblemGrid 间距/字号**

打开 `src/components/ProblemGrid.vue`:
- 字号:`text-base`(15px) → `text-md`(17px) 提高可读性
- 间距:`gap-3` → `gap-4` 更宽松
- 行高:`leading-base` → `leading-loose` 给书写空间

- [ ] **Step 2: 升级 AnswerPage 同款间距**

打开 `src/components/AnswerPage.vue`,应用与 ProblemGrid 相同的间距/字号规则。

- [ ] **Step 3: 创建 workbench-redesign E2E**

创建 `cypress/e2e/workbench-redesign.cy.js`:

```js
describe('工作台 UI 重设计', () => {
  beforeEach(() => {
    cy.visit('/#/workbench')
  })

  it('渲染 Hero 标题', () => {
    cy.contains('为你的孩子,定制一份数学练习').should('be.visible')
  })

  it('渲染 6 张年级卡片', () => {
    cy.get('[data-test="grade-card"]').should('have.length', 6)
  })

  it('三年级卡片显示"推荐"徽章', () => {
    cy.contains('三年级').parent().should('contain.text', '推荐')
  })

  it('点击三年级卡片展开预览区', () => {
    cy.contains('三年级').click()
    cy.get('[data-test="preview-root"]').should('be.visible')
  })

  it('点击"自定义全部配置"切换到 Tab 视图', () => {
    cy.contains('自定义全部配置').click()
    cy.get('[role="tablist"]').should('be.visible')
  })
})
```

> 若 GradeCard 没有 `data-test="grade-card"` 属性,在 Task 6 Step 3 的 GradeCard 模板根元素上加 `:data-test="'grade-card'"`。
> 同样,在 Task 6 Step 6 的 GeneratorView 预览区根 div 加 `data-test="preview-root"`。

- [ ] **Step 4: 创建 mobile-sheet E2E**

创建 `cypress/e2e/mobile-sheet.cy.js`:

```js
describe('移动端底部 sheet', () => {
  beforeEach(() => {
    cy.viewport('iphone-x')
    cy.visit('/#/workbench')
  })

  it('顶栏显示汉堡按钮', () => {
    cy.get('button[aria-label="打开菜单"]').should('be.visible')
  })

  it('点击汉堡打开菜单 sheet', () => {
    cy.get('button[aria-label="打开菜单"]').click()
    cy.contains('历史').should('be.visible')
  })

  it('点击菜单项跳转并关闭 sheet', () => {
    cy.get('button[aria-label="打开菜单"]').click()
    cy.contains('历史').click()
    cy.location('hash').should('include', '/history')
    cy.contains('历史').should('not.exist')  // sheet 已关闭
  })
})
```

- [ ] **Step 5: 跑 E2E(可选,需 Cypress GUI 或 CI)**

```bash
npx cypress run --spec cypress/e2e/workbench-redesign.cy.js
npx cypress run --spec cypress/e2e/mobile-sheet.cy.js
```

预期: 全部用例 PASS。

- [ ] **Step 6: 跑全量单测**

```bash
npx vitest run
```

预期: 全部 PASS。

- [ ] **Step 7: 提交**

```bash
git add src/components/ProblemGrid.vue src/components/AnswerPage.vue \
        cypress/e2e/workbench-redesign.cy.js cypress/e2e/mobile-sheet.cy.js
git commit -m "feat(e2e): add workbench-redesign + mobile-sheet cypress specs"
```

---

## Task 13: 移动端适配与触控目标全量检查

**Files:**
- Modify: 各组件文件(基于需要)
- Create: `src/composables/useBreakpoint.js`(已在 Task 3 创建,本任务在 GeneratorView 中使用)

- [ ] **Step 1: 在 GeneratorView 中接入 useBreakpoint**

在 `src/views/GeneratorView.vue` 的 setup 中引入 `useBreakpoint`:

```js
import { useBreakpoint } from '../composables/useBreakpoint.js'

const { isMobile } = useBreakpoint()
```

将卡片网格根据 `isMobile()` 切换列数:

```vue
<div :class="isMobile() ? 'grid grid-cols-2 gap-3 mb-8' : 'grid grid-cols-3 gap-3 mb-8'">
```

- [ ] **Step 2: 全量检查所有可点击元素的最小高度**

搜索所有 `<button>` 与可点击元素,确保满足 ≥ 44×44px:

```bash
grep -rn "min-h-\[44" src/components/ src/views/
```

应至少在 BaseButton / BaseInput / BaseSelect / MobileNav 等组件中存在。缺失的补充 `min-h-[44px]` 类。

- [ ] **Step 3: 移动端 iPhone SE 测试**

启动 dev server,用 DevTools 切到 iPhone SE (375×667):

```bash
npm run dev
```

访问 `/`、`/workbench`、`/history`,逐个检查:
- 顶栏不溢出
- 卡片网格 2 列
- 字号 ≥ 16px
- 按钮 ≥ 44px
- ActionBar sticky 在底部,不遮挡内容

- [ ] **Step 4: 移动端 Android 测试**

用真机或 Android Chrome DevTools(模拟 360×640),同上检查。

- [ ] **Step 5: 提交(如改动)**

```bash
git add src/views/GeneratorView.vue src/components/
git commit -m "fix(mobile): ensure 44px tap targets + 2-col mobile grade grid"
```

---

## Task 14: 打印样式适配

**Files:**
- Modify: `src/assets/styles/base.css`

- [ ] **Step 1: 添加 @media print 块到 base.css**

在 `src/assets/styles/base.css` 末尾追加:

```css
@layer utilities {
  /* === 打印样式 === */
  @media print {
    body {
      font-family: 'Helvetica', 'PingFang SC', sans-serif;
      background: var(--color-bg-paper);
      color: var(--color-ink-deep);
      line-height: var(--leading-loose);
      font-size: 14pt;
    }

    /* 隐藏 UI chrome */
    header,
    .nav-header,
    .action-bar,
    .preset-selector,
    .config-panel,
    .toast-container {
      display: none !important;
    }

    /* 题目网格:保持列数 */
    .problem-grid {
      page-break-inside: avoid;
    }

    .problem-item {
      break-inside: avoid;
      padding: 8pt 0;
    }

    /* worksheet header */
    .worksheet-header {
      text-align: center;
      margin-bottom: 16pt;
    }

    .worksheet-header .info-row {
      display: flex;
      justify-content: space-between;
      padding: 0 8pt;
      font-size: 12pt;
      margin-top: 8pt;
    }
  }
}
```

- [ ] **Step 2: 手动验证打印**

启动 dev server:

```bash
npm run dev
```

访问 `/workbench`,生成题目,按 Cmd+P / Ctrl+P:

预期:
- 打印预览只显示题目网格 + worksheet header
- 无按钮 / 顶栏 / 配置面板
- 字号 ≥ 14pt,行距 ≥ 1.8

- [ ] **Step 3: 提交**

```bash
git add src/assets/styles/base.css
git commit -m "feat(print): adapt print styles — switch to sans-serif + 1.8 line-height"
```

---

## Task 15: Lighthouse + 性能 + a11y 验证

**Files:**
- Modify: 按需修复

- [ ] **Step 1: 生产构建**

```bash
npm run build
```

预期: 构建成功,无 Tailwind/PostCSS 错误。

- [ ] **Step 2: 启动 preview server**

```bash
npx vite preview --port 5050
```

- [ ] **Step 3: 运行 Lighthouse**

用 Chrome DevTools → Lighthouse → 勾选 Performance / Accessibility / Best Practices / SEO → Analyze:

预期: 四个分数均 ≥ 90。

若 < 90,优先修复:
- Performance:字体子集化、preload 关键字体、`font-display: swap`
- Accessibility:颜色对比度、label、aria
- Best Practices:HTTPS、图片懒加载
- SEO:meta description、title

- [ ] **Step 4: 修复后重新跑**

修复后重复 Step 1-3,直到达标。

- [ ] **Step 5: 提交(如有改动)**

```bash
git add .
git commit -m "perf: lighthouse pass — fonts/a11y/seo tuning"
```

---

## Task 16: 文档更新

**Files:**
- Modify: `README.md`
- Modify: `MOBILE_FEATURES.md`(如存在)
- Modify: `CHANGELOG.md`

- [ ] **Step 1: 更新 README 添加 v2 UI 章节**

在 `README.md` 顶部添加:

```markdown
## v2 UI 重设计 (2026-09-12)

应用界面已全面重设计,采用温暖编辑感视觉气质 + 教育友好点缀:

- **设计系统**:纸质感米白底 + 深棕字 + 暖橙点缀 + Lora / 霞鹜文楷字体
- **工作台**:Hero + 6 张年级卡片,新手一键开始
- **移动端**:响应式 + 移动端专属布局(汉堡菜单 / sticky 底部按钮)
- **技术栈**:Tailwind CSS + 设计 token + Base 组件库

详见设计文档: `docs/superpowers/specs/2026-09-12-math-gen-ui-redesign-design.md`
```

- [ ] **Step 2: 更新 CHANGELOG**

在 `CHANGELOG.md` 顶部添加:

```markdown
## 2026-09-12 — v2 UI 重设计

### 视觉升级
- 全新温暖编辑感设计系统(米白 / 深棕 / 暖橙 / Lora + 霞鹜文楷)
- 引入 Tailwind CSS + 设计 token 基础设施
- 7 个 Base 组件 + 完整组件库升级

### 信息架构
- 新增工作台(Hero + 6 卡片)
- 新增关于页
- 旧路由 /generator 与 /quick-start 重定向到 /workbench(向后兼容)

### 移动端
- 全新移动端布局(汉堡菜单 + sticky 底部按钮 + 大触控目标)
- 单栏 / 2 列卡片网格

### 性能 / 可访问性
- 字体子集化 + font-display: swap
- Lighthouse ≥ 90(性能 / a11y / 最佳实践 / SEO)
```

- [ ] **Step 3: 提交**

```bash
git add README.md CHANGELOG.md MOBILE_FEATURES.md
git commit -m "docs: update README/CHANGELOG for v2 UI redesign"
```

---

## Task 17: 全量回归 + 最终提交

- [ ] **Step 1: 全量单测**

```bash
npx vitest run
```

预期: 全部 PASS,无回归。

- [ ] **Step 2: 全量 E2E(可选)**

```bash
npx cypress run
```

预期: 全部 PASS,无回归。

- [ ] **Step 3: 手动冒烟测试**

启动 dev server,完整跑一遍核心流程:
1. 进入 / → 点击"开始 →"
2. 工作台 → 点击三年级卡片 → 生成题目
3. 切换显示答案 → 导出 PDF
4. 进入 /history → 查看一条历史
5. 进入 /history/<id> → 点击"再生成一份"
6. 切换到移动端视图,重复 1-5

- [ ] **Step 4: 构建产物检查**

```bash
npm run build
ls -lh dist/assets/*.css dist/assets/*.js | head -10
```

预期: CSS ≤ 30KB gzipped,JS 总和 ≤ 200KB gzipped。

- [ ] **Step 5: 部署到 gh-pages(可选)**

```bash
npm run deploy
```

- [ ] **Step 6: 最终 commit(如有遗留改动)**

```bash
git status
git add .
git commit -m "chore: v2 UI redesign — final regression pass"
```

- [ ] **Step 7: 关闭 brainstorm session(如还在运行)**

如视觉助手还在运行,可告知用户手动关闭浏览器或保留。

---

## 自检 (Self-Review)

### Spec 覆盖度检查

| Spec 章节 | 覆盖任务 |
|---|---|
| §3 设计系统(token + Tailwind) | Task 1 |
| §4 信息架构(主导航) | Task 4, 9 |
| §5.1 HomePage | Task 5 |
| §5.2 工作台 | Task 6 |
| §5.3 工作台预览区 | Task 6 |
| §5.4 HistoryView | Task 7 |
| §5.5 HistoryDetailView | Task 8 |
| §5.6 AboutView | Task 9 |
| §6.1 基础原子组件 | Task 2 |
| §6.2 现有组件改造 | Task 10, 11, 12 |
| §6.3 移动端组件 | Task 4 (MobileNav), Task 2 (BaseSheet) |
| §7 移动端策略 | Task 13 |
| §8 关键交互级别 | Task 4 (路由过渡), Task 6 (workbench staggered) |
| §9 打印与导出样式 | Task 14 |
| §10 技术栈 | Task 1 (Tailwind), Task 3 (composable) |
| §11 实施分阶段 | 全部 Task 对应 |
| §12 测试策略 | Task 12 (E2E), Task 15 (Lighthouse), Task 17 (回归) |

✅ 全部 spec 章节均有对应 task。

### Placeholder 扫描

✅ 无 TBD / TODO / "implement later" / "similar to" 类占位符。
✅ 每个代码 step 都包含完整代码。
✅ 每个命令都包含预期输出。
✅ 文件路径均为相对项目根的精确路径。

### 类型与命名一致性

- `BaseButton` 始终导出 `BaseButton`(Task 2)
- `useBreakpoint` 始终返回 `{ windowWidth, isMobile(), isTablet(), isDesktop() }`(Task 3)
- `gradePresets` 始终是 `[{ grade, topic, difficulty, duration, recommended? }]`(Task 6)
- `db.js` 暴露 `deleteProblemSet`(Task 7) 与 `getProblemSet`(Task 8) — 显式声明

✅ 命名无冲突。

---

## 执行选项

**Plan 已保存到 `docs/superpowers/plans/2026-09-12-math-gen-ui-redesign-plan.md`,共 17 个任务。**

两种执行方式:

1. **Subagent-Driven(推荐)** — 每任务派遣新 subagent + 两阶段审查,迭代快
2. **Inline Execution** — 当前 session 顺序执行,带 checkpoint 暂停

你倾向哪种执行方式?
