# 小学数学题生成器 — UI 全面重设计

**项目**: PrimarySchoolMathematicsGenerator
**日期**: 2026-09-12
**状态**: 待审查 (Draft → Spec Review)
**优先级**: 高
**作者**: Codex (brainstorming)
**前置依赖**: 无(可直接进入实施)

---

## 1. 背景与目标

### 1.1 现状

当前 UI 是 v1.x 的"工具型"风格:
- 白色卡片 + 浅灰背景 + 蓝色按钮
- 系统默认字体 (Microsoft YaHei)
- 单页长表单式布局
- 移动端只是简单响应式(媒体查询切列数)

技术栈: Vue 3 + Vite + 原生 CSS(`src/style.css` 单文件 11k)+ vue-router (hash 模式)。

### 1.2 重设计目标

将应用从"功能性工具站"提升为"温暖、克制的编辑感工具",在视觉气质、信息架构、移动端体验三个维度同步升级:

- **视觉气质**:对齐 ziyouzt.com 这种温暖编辑感气质,但保留"教育友好点缀"
- **信息架构**:从"单页长表单"重构为"主导航 + 工作台"的模块化结构
- **移动端**:从"简单响应式"升级为"响应式 + 移动端专属布局"
- **工程**:从"原生 CSS 单文件"升级到"Tailwind + 设计 token 系统"

### 1.3 范围

✅ **IN**:
- 所有面向用户的视图(HomePage / GeneratorView / HistoryView / HistoryDetailView / QuickStartView)
- 所有 UI 组件(ConfigWizard / ConfigPanel / PresetSelector / PresetManager / ActionBar / ExportPreview / ConfirmDialog / ToastContainer)
- 引入 Tailwind CSS,作为新的样式基础设施
- 设计 token 系统(颜色 / 字体 / 间距 / 圆角 / 阴影)
- 移动端专属布局(单栏 / 汉堡菜单 / 大按钮 / 底部 sheet)
- 关键微交互(必要 + 优雅 两档)

❌ **OUT**(本轮不涉及):
- 后端逻辑 / IndexedDB schema / 题库策略
- 新功能(如家长账号、班级管理、AI 题目生成)
- 暗色模式(明确推迟)
- i18n / 多语言(明确推迟)
- 桌面端 PWA(明确推迟)

---

## 2. 关键设计决策

> 以下 10 个决策均通过 brainstorming 阶段与用户确认。

| # | 决策项 | 选定方案 | 备注 |
|---|---|---|---|
| 1 | 重设计范围 | **C · 全部组件级** | 包含所有视图与组件 |
| 2 | 视觉气质 | **B · ziyouzt.com 温暖编辑感 + 教育友好点缀** | 保留暖橙/暖色高亮 |
| 3 | 信息架构 | **C · 完全 IA 重构** | 主导航 + 工作台混合 |
| 4 | 次要功能位置 | **B · 主导航 + 工作台混合** | 预设管理作为工作台 tab |
| 5 | 配色方案 | **A · 纸质温暖** | 米白 + 深棕 + 暖橙 |
| 6 | 工作台布局 | **A2 · Hero + 卡片网格** | 3×2 卡片 + 推荐高亮 |
| 7 | 内容宽度 | **B · 中等 960px** | 桌面端最大宽度 |
| 8 | 字体组合 | **B · 霞鹜文楷 + Lora** | 中文温暖手写 / 英文衬线 |
| 9 | 移动端策略 | **B · 响应式 + 移动端专属布局** | 单栏 + 大按钮 |
| 10 | 技术栈 | **B · 引入 Tailwind CSS** | 工程化基础设施 |

---

## 3. 设计系统 (Design System)

### 3.1 设计 Token (CSS Variables)

```css
:root {
  /* === 颜色 === */
  --color-bg-paper:      #FAF7F2;  /* 主背景,暖米白 */
  --color-bg-card:       #FFFCF7;  /* 卡片背景,浅一档 */
  --color-ink-deep:      #2B1F1A;  /* 主要文字,深棕黑 */
  --color-ink-muted:     #6B5D4F;  /* 次要文字,中棕 */
  --color-ink-faint:     #8A7A6A;  /* 极淡文字 */
  --color-rule-soft:     #E8DFD2;  /* 边框/分隔线,暖灰 */
  --color-rule-soft-2:   #EAE0D0;  /* 次级分隔线 */
  --color-accent-ember:  #C2410C;  /* 主点缀色,暖橙 */
  --color-accent-ember-hover: #9A3412;  /* 暖橙悬停 */
  --color-success:       #15803D;
  --color-warning:       #B45309;
  --color-error:         #B91C1C;

  /* === 字体 === */
  --font-display: 'Lora', 'LXGW WenKai TC', 'Songti SC', Georgia, serif;
  --font-body:    'Lora', 'LXGW WenKai TC', 'Songti SC', Georgia, serif;
  --font-mono:    ui-monospace, 'SF Mono', Menlo, monospace;

  /* === 字号 === */
  --text-xs:   12px;
  --text-sm:   13px;
  --text-base: 15px;
  --text-md:   17px;
  --text-lg:   20px;
  --text-xl:   24px;
  --text-2xl:  32px;

  /* === 字重 === */
  --weight-regular: 400;
  --weight-medium:  600;  /* 中文 600 ≈ regular bold */
  --weight-bold:    700;

  /* === 行高 === */
  --leading-tight: 1.2;
  --leading-snug:  1.4;
  --leading-base:  1.6;
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
  --radius-sm:   4px;   /* 输入框/小标签 */
  --radius-md:   6px;   /* 按钮/卡片 */
  --radius-lg:   8px;   /* 大卡片 */
  --radius-pill: 9999px; /* 徽章 */

  /* === 阴影 (克制) === */
  --shadow-sm: 0 1px 2px rgba(43, 31, 26, 0.06);
  --shadow-md: 0 2px 6px rgba(43, 31, 26, 0.08);
  --shadow-lg: 0 8px 24px rgba(43, 31, 26, 0.10);

  /* === 容器 === */
  --container-max: 960px;
  --container-narrow: 720px;  /* 历史列表/About 用 */

  /* === 断点 === */
  --bp-mobile:  640px;
  --bp-tablet:  768px;
  --bp-desktop: 1024px;
}
```

### 3.2 字体加载策略

- **Lora** 走 Google Fonts(`@fontsource/lora` 自托管更优),`font-display: swap`
- **LXGW WenKai TC** 走 jsDelivr CDN(`@fontsource/lxgw-wenkai-tc` 自托管)
- 默认字体回退到 `Songti SC, Georgia, serif` 保证首屏不空白
- 中文版式使用 `font-feature-settings: "halt"` 等排版特性

### 3.3 Tailwind 配置

`tailwind.config.js` 关键设置:
```js
theme: {
  extend: {
    colors: {
      paper: { DEFAULT: '#FAF7F2', card: '#FFFCF7' },
      ink:   { deep: '#2B1F1A', muted: '#6B5D4F', faint: '#8A7A6A' },
      rule:  { soft: '#E8DFD2', softer: '#EAE0D0' },
      ember: { DEFAULT: '#C2410C', hover: '#9A3412' },
    },
    fontFamily: {
      serif: ['Lora', 'LXGW WenKai TC', 'Songti SC', 'Georgia', 'serif'],
    },
    maxWidth: {
      content: '960px',
      narrow: '720px',
    },
  },
}
```

---

## 4. 信息架构

### 4.1 主导航(桌面)

```
┌──────────────────────────────────────────────────────────┐
│  📐 数学习题              首页  工作台  历史  关于       │
└──────────────────────────────────────────────────────────┘
```

### 4.2 主导航(移动)

```
┌────────────────────────────┐
│  📐 数学习题          ☰    │  ← 汉堡菜单
└────────────────────────────┘
```

汉堡菜单展开后是全屏 sheet,垂直列出 4 个一级入口。

### 4.3 页面层级

| 路径 | 视图 | 角色 |
|---|---|---|
| `/` | **HomePage** | 极简引导页 → 跳转到工作台 |
| `/workbench` | **GeneratorView** (工作台) | 核心:配置 + 预览 + 导出 |
| `/history` | **HistoryView** | 历史试卷列表 |
| `/history/:id` | **HistoryDetailView** | 历史试卷详情 + 再生成 |
| `/about` | **AboutView** (新) | 简短说明、使用指南 |
| `/quick-start` | **QuickStartView** | 保留作为工作台的别名/重定向 |

> **关于 QuickStartView**:原本是"快速开始"独立页面,新 IA 下功能并入工作台。`/quick-start` 重定向到 `/workbench`,旧链接不破坏。

### 4.4 工作台内部 Tab

工作台顶部是 Hero + 6 卡片网格,点击"自定义全部配置"展开高级配置(原 ConfigPanel),作为工作台的第二个 tab:

```
[ 默认配置(6 卡片) ] [ 高级配置 ]
```

预设管理(PresetManager)从原"弹窗"改为工作台第三个 tab:[ 预设管理 ]。

---

## 5. 关键页面设计

### 5.1 HomePage(简化)

- 不再承载"入口选择",改为"极简引导页":一句话介绍 + "开始 →"按钮(跳工作台)
- 设计:大标题居中 + 副标题 + 单按钮,温暖克制

### 5.2 工作台(核心)

**桌面布局** (≥768px):
```
┌──────────────────────────────────────┐
│  Hero: 标题 + 副标题(居中)            │
├──────────────────────────────────────┤
│  6 卡片网格 (3×2)                    │
│  ┌─────┐ ┌─────┐ ┌─────┐             │
│  │ G1  │ │ G2  │ │ G3 ★推荐 │           │
│  └─────┘ └─────┘ └─────┘             │
│  ┌─────┐ ┌─────┐ ┌─────┐             │
│  │ G4  │ │ G5  │ │ G6  │             │
│  └─────┘ └─────┘ └─────┘             │
├──────────────────────────────────────┤
│       [ 自定义全部配置 → ]            │
└──────────────────────────────────────┘
```

点击卡片 → 选中年级 + 默认配置 → 直接跳到预览区。
点击"自定义" → 展开 ConfigPanel,留在工作台。

**移动布局** (<768px):
```
┌──────────────────────┐
│  标题(左对齐)        │
│  副标题              │
├──────────────────────┤
│  卡片网格 (2×3)      │
│  ┌─────┐ ┌─────┐     │
│  │ G1  │ │ G2  │     │
│  └─────┘ └─────┘     │
│  ┌─────┐ ┌─────┐     │
│  │ G3 ★│ │ G4  │     │
│  └─────┘ └─────┘     │
│  ┌─────┐ ┌─────┐     │
│  │ G5  │ │ G6  │     │
│  └─────┘ └─────┘     │
├──────────────────────┤
│  [ 开始生成 ]  ← 大号 │
│    高级配置 →         │
└──────────────────────┘
```

### 5.3 工作台 · 预览/生成区

- 选中年级(或点自定义)后,工作台向下展开"预览区"
- 顶部:Worksheet header(标题 + 姓名/得分行 + 日期)
- 中部:ProblemGrid(响应式列数: 桌面 3 列 / 移动 2 列)
- 底部:ActionBar(生成 / 显示答案 / 导出 / 分享 / 历史)
- 移动端 ActionBar 改为 sticky bottom

### 5.4 HistoryView

- 列表式,每条一行:
  - 标题(年级 · 题型 · 题数)
  - 元信息(日期 · 难度)
  - 右侧操作(查看 → / 删除)
- 空状态:暖色插画 + "还没有历史,先去工作台生成 →"
- 桌面端:每条横排;移动端:每条上下堆叠

### 5.5 HistoryDetailView

- 顶部元信息卡片(年级/题型/题数/日期)
- 中部 ProblemGrid(同工作台预览)
- 底部操作(再生成 / 导出 / 返回)
- 移动端元信息折叠为可展开详情

### 5.6 AboutView(新增)

- 简短项目说明(2-3 段)
- 使用指南(3 步)
- 设计灵感(可选,致敬 ziyouzt.com)
- 排版与 HistoryView 同款(narrow 720px)

---

## 6. 组件清单与设计

### 6.1 基础原子组件(新增)

| 组件 | 用途 | 关键样式 |
|---|---|---|
| `BaseButton` | 按钮 | `--color-ink-deep` / `--color-accent-ember`,`--radius-md`,悬停态,按压态 |
| `BaseBadge` | 标签徽章 | pill 形状,2 档(浅色 / 深色) |
| `BaseCard` | 通用卡片 | `--color-bg-card` + `--color-rule-soft` 边框 |
| `BaseInput` | 输入框 | 边框 `--color-rule-soft`,聚焦 `--color-accent-ember` |
| `BaseSelect` | 下拉 | 同输入框 |
| `BaseTabs` | 标签页切换 | 下划线指示器 |
| `BaseSheet` | 底部弹出层 | 移动端用 |
| `BaseToast` | 已有,改为暖色 |

### 6.2 现有组件改造

| 组件 | 改造要点 |
|---|---|
| **HomePage** | 简化为极简引导页 |
| **GeneratorView** | 重写为"工作台"结构:Hero + 6 卡片 + Tab + 预览 |
| **HistoryView** | 列表样式升级,加窄容器 |
| **HistoryDetailView** | 元信息卡片化,操作区升级 |
| **QuickStartView** | 改为 `/workbench` 的重定向包装器 |
| **ConfigWizard** | 重设计视觉,但保留 3 步结构(可作为高级配置 tab 的引导入口) |
| **ConfigPanel** | 重设计,行间距加大,控件换 Tailwind class |
| **PresetSelector** | 升级为"预设卡片网格"(替代原下拉) |
| **PresetManager** | 重设计为"预设列表 + 编辑表单"两栏 |
| **ActionBar** | 桌面横向、移动 sticky bottom,按钮尺寸分级 |
| **ExportPreview** | 弹窗升级为暖色 sheet + 清晰预览 |
| **ConfirmDialog** | 统一为暖色卡片 + 清晰主次按钮 |
| **ToastContainer** | 已有,改暖色调色板 |
| **ProblemGrid** | 视觉不变(功能正确性优先),仅优化间距/字号 |
| **AnswerPage** | 视觉不变,跟 ProblemGrid 同款间距 |

### 6.3 移动端专属组件

| 组件 | 用途 |
|---|---|
| `<MobileNav>` | 顶栏 + 汉堡菜单 |
| `<MobileSheet>` | 底部弹出层(高级配置 / 菜单) |
| `<MobileTabs>` | 横向可滑动 tab |

---

## 7. 移动端策略

### 7.1 断点

- `< 640px`:mobile(默认 mobile-first 起点)
- `640-767px`:large mobile / phablet
- `768-1023px`:tablet
- `≥ 1024px`:desktop

### 7.2 关键约束

- 所有可点击元素 ≥ 44×44px
- 主操作按钮 ≥ 48px 高
- 字号基础 15px,移动端 16px(防 iOS 缩放)
- 表单元素间距 ≥ 12px
- 内容容器最大宽 960px,左右各留 ≥ 16px 安全边距

### 7.3 导航

- 顶栏:logo + 汉堡
- 汉堡展开:全屏 sheet,垂直列出 4 个一级入口
- 工作台底部 sticky 主操作按钮(开始生成)

---

## 8. 关键交互级别

### 8.1 必要(必做)

- 按钮悬停 / 按压反馈
- 卡片选中态(边框 + 微缩放)
- 输入框聚焦(边框变暖橙)
- 加载态(skeleton 或 spinner)
- Toast 通知(成功 / 警告 / 错误)
- 页面切换(路由变化淡入淡出 150ms)

### 8.2 优雅(加分)

- 卡片网格生成时 staggered 淡入(50ms 间隔)
- 数字滚动计数(题目数量)
- 主题切换(如未来加暗色模式,框架先准备好)
- 预设应用的 200ms 过渡

### 8.3 克制(不做)

- 不引入大幅 hero 视差
- 不做滚动驱动动画
- 不引入过度的阴影/模糊
- 不引入 3D 效果
- 不引入滚动锁定模态(用遮罩 + body scroll)

---

## 9. 打印与导出样式

> 这是本应用的核心场景,新视觉气质不能破坏打印的清晰可读。

### 9.1 设计原则

- **打印时切换字体**:导出/打印时强制使用无衬线 + 较大字号,保证清晰可读(避免霞鹜文楷在打印时显得过轻)
- **保持暖色调**:不切换为纯黑/纯白,保留米白底 + 深棕字,避免打印出来像试卷模板
- **行间距加大**:打印时 `line-height: 1.8`,留给孩子书写
- **去掉所有阴影 / 边框装饰**:仅保留必要的题目分隔线

### 9.2 打印 CSS 模板

```css
@media print {
  body {
    font-family: 'Helvetica', 'PingFang SC', sans-serif;
    background: #FAF7F2;
    color: #2B1F1A;
    line-height: 1.8;
  }
  /* 隐藏所有 UI chrome */
  .nav-header, .action-bar, .preset-selector { display: none; }
}
```

### 9.3 PDF / 图片导出

- 维持现有 `useEnhancedExport` 逻辑(微信兼容 / 移动端降级)
- 升级预览弹窗为暖色 sheet
- 增加"复制到剪贴板"作为可选操作(分享场景)

---

## 10. 技术栈与工程实践

### 10.1 依赖变化

新增:
- `tailwindcss` + `@tailwindcss/postcss` (v4) 或 `postcss + autoprefixer` (v3)
- `@fontsource/lora`
- `@fontsource/lxgw-wenkai-tc` 或 jsdelivr CDN
- 可选 `@vueuse/core`(若引入底部 sheet / 媒体查询工具)

保留:Vue 3, Vite, vue-router, Dexie, html2canvas-pro, html2pdf.js, gh-pages。

### 10.2 PostCSS 配置

- `postcss.config.js` 启用 Tailwind
- Vite 自动处理

### 10.3 样式代码组织

- **删除**:`src/style.css` 单文件
- **保留**:各 Vue 组件 `<style scoped>`,迁移到 Tailwind class
- **新增**:`src/assets/styles/tokens.css`(CSS 变量定义)
- **新增**:`src/assets/styles/base.css`(Tailwind base + 全局 reset)
- **新增**:`src/composables/useBreakpoint.js`(断点响应)

### 10.4 测试基础设施

- 保留现有 Vitest + Cypress 配置
- Tailwind 引入后,visual snapshot 测试可能需要更新 baseline

### 10.5 可访问性 (a11y)

- 颜色对比度满足 WCAG AA(暖橙 #C2410C on 米白 #FAF7F2,实测对比度 ~5.2:1 ✅)
- 所有交互元素键盘可达
- 表单元素有 `<label>`
- 焦点态可见(暖橙边框 + 微缩放)

---

## 11. 实施分阶段(5 阶段)

### 阶段 1 · 设计系统基建 (~0.5 天)

- 安装 Tailwind + 字体依赖
- 写入 `tokens.css` + `tailwind.config.js`
- 实现 `BaseButton` / `BaseBadge` / `BaseCard` / `BaseInput` / `BaseSelect` / `BaseTabs`
- 单元测试 Base 组件

### 阶段 2 · 页面骨架重做 (~1.5 天)

- HomePage 极简化
- GeneratorView 重写为工作台(Hero + 6 卡片 + Tab)
- HistoryView 列表化
- HistoryDetailView 元信息卡片化
- AboutView 新增
- QuickStartView 改为重定向
- 路由调整(`/workbench` 替换部分路径,保留旧路径兼容)

### 阶段 3 · 业务组件升级 (~1.5 天)

- ConfigWizard / ConfigPanel / PresetSelector / PresetManager 重设计
- ActionBar 桌面 + 移动 sticky 两套布局
- ExportPreview / ConfirmDialog / ToastContainer 暖色化

### 阶段 4 · 移动端专属 (~0.5 天)

- `<MobileNav>` + 汉堡菜单
- `<MobileSheet>` 底部弹出
- 工作台移动端单栏布局
- ActionBar 移动端 sticky bottom
- 触控目标 ≥ 44px 全面检查

### 阶段 5 · 微交互与导出 (~1 天)

- 路由淡入淡出(150ms)
- 卡片生成 staggered 淡入
- 加载态 skeleton
- 打印样式适配(字体切换 + 行距加大)
- 导出预览 sheet 升级

### 阶段 6 · 测试与打磨 (~1 天)

- 单元测试更新
- E2E (Cypress) 更新
- 移动端真机测试(iOS Safari + Android Chrome)
- 视觉回归(baseline 重置)
- 性能(Lighthouse ≥ 90)
- 文档更新(README / MOBILE_FEATURES)

**总计**: 约 6 个工作日(单人开发)

---

## 12. 测试策略

### 12.1 单元测试 (Vitest)

- 所有 Base 组件 + 业务组件的关键交互
- 测试覆盖率保持 ≥ 60%
- 已有 200+ 测试不应回归失败

### 12.2 E2E (Cypress)

- 更新现有 4 个 spec 文件(generator / mobile-layout / mobile / history)
- 新增 `workbench-redesign.cy.js`:覆盖 6 卡片 → 选年级 → 预览 → 导出
- 新增 `mobile-sheet.cy.js`:汉堡菜单 / 底部 sheet

### 12.3 视觉回归

- 用 Percy 或 `cypress-image-snapshot`(可选)
- 由于视觉大改,baseline 全部重置

### 12.4 移动端真机

- iPhone SE / iPhone 14 / iPad
- Android 中端机(Chrome)
- 微信内置浏览器(关键)

### 12.5 性能

- Lighthouse ≥ 90 (Performance / Accessibility / Best Practices / SEO)
- 字体加载策略(`font-display: swap`)保证 FCP ≤ 1.5s

---

## 13. 风险与权衡

| 风险 | 影响 | 缓解 |
|---|---|---|
| 引入 Tailwind 增加包体积 | ~10-20KB gzipped | 用 v4 + 按需生成;关键路径只引入必要 utilities |
| LXGW WenKai 字体较大 | ~5MB 中文字体子集化 | 字符子集化 + preload + `font-display: swap` |
| 视觉大改后用户不适应 | GitHub Pages 已发布用户受影响 | README 标注"v2 UI";CHANGELOG 详细记录 |
| 打印样式可能与新视觉冲突 | 暖色调打印效果可能偏弱 | 打印时切换字体 + 加深棕到 #1A1310 |
| 实施 6 天工作量较大 | 单人开发风险 | 分阶段提交,每阶段可独立回滚 |
| 测试 baseline 大量失效 | CI 噪音 | 一次性重置 baseline,标注原因 |

---

## 14. 附录

### 14.1 决策过程中使用的 mockup

Brainstorming 阶段产生的 mockup(仅 brainstorming 期间使用,不进入仓库):
- `color-schemes-1.html` — 3 种配色方向对比
- `layout-options-1.html` — 3 种工作台布局对比
- `font-options-1.html` — 3 种字体组合对比
- `overall-design-1.html` — 综合设计概览

> mockup 通过 `start-server.sh` 在 `http://localhost:54093` 提供可视化访问。已加入 `.gitignore`。

### 14.2 决策日志

| 步骤 | 问题 | 选择 |
|---|---|---|
| 1 | 重设计覆盖范围 | C · 全部组件级 |
| 2 | 保留多少教育色彩 | B · ziyouzt + 教育点缀 |
| 3 | 是否重做 IA | C · 完全重构 |
| 4 | 历史/预设放哪 | B · 主导航 + 工作台混合 |
| 5 | 配色方案 | A · 纸质温暖 |
| 6 | 工作台布局 | A2 · Hero + 卡片网格 |
| 7 | 内容宽度 | B · 960px |
| 8 | 字体组合 | B · 霞鹜文楷 + Lora |
| 9 | 移动端策略 | B · 响应式 + 移动端专属 |
| 10 | 技术栈 | B · Tailwind CSS |

### 14.3 后续可探索(明确推迟)

- 暗色模式(framework 先准备,后续单独迭代)
- PWA / 离线缓存
- i18n / 英文版本
- 班级管理 / 家长账号
- AI 题目生成
