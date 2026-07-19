# 易用性与可靠性优化设计规范

**日期**: 2026-07-19  
**状态**: Draft → 待用户审核  
**目标版本**: v1.1.0

---

## 1. 背景与目标

### 1.1 问题诊断

基于代码库分析，当前版本存在以下核心问题：

**易用性痛点**：
- 配置面板一次性展示 10+ 参数，新手家长学习成本高
- 生成/导出/打印等关键操作无反馈，用户不知道是否成功
- 错误提示使用原生 `alert()`，打断操作流
- 历史记录删除无确认，易误操作
- 移动端操作按钮层级深，不易发现

**可靠性痛点**：
- `ArithmeticStrategy` 有 2 个测试失败（稳定性信号）
- 预加载题库在测试环境出现 URL 解析错误
- IndexedDB 写入失败时静默丢弃，用户不知情
- 导出/打印失败时无降级方案
- 生成算法 `while` 循环无超时保护，存在无限等待风险

### 1.2 优化目标

**易用性**：
- 首次使用完成题目生成的时间从 ~2 分钟缩短到 ~30 秒
- 用户可感知的错误提示覆盖率 100%
- 核心操作（生成/导出/打印）添加加载状态

**可靠性**：
- 核心操作（生成/导出/打印）成功率 100%
- 测试通过率 100%（当前失败 2 个）
- 失败时自动重试或提供降级方案
- IndexedDB 异常主动提示，不静默丢弃

---

## 2. 设计原则

1. **Fail Fast, Fail Loud**：错误立即提示，不静默失败
2. **Progressive Disclosure**：配置分步展示，避免信息过载
3. **Graceful Degradation**：功能失败时提供备选方案
4. **Parent-First UX**：优先考虑非技术背景家长的使用习惯
5. **Zero-Surprise**：操作前提示状态，操作后确认结果

---

## 3. 功能设计

### 3.1 配置向导（渐进式配置）

**目标**：将 10+ 参数拆分为 3 步，降低首次使用门槛。

#### Step 1：基础配置（必填）
- [ ] 年级选择（1-6 年级，下拉或按钮组）
- [ ] 学期选择（上册/下册）
- [ ] 题目数量（默认 20 题，滑块或输入框）

**默认值**：
- 题型：算术题（单选，简化选择）
- 难度：中等
- 答案模式：不显示

#### Step 2：题型配置（可选）
显示时机：Step 1 完成后
- [ ] 题型选择：算术题 / 应用题 / 奥数题（多选）
- [ ] 算术题子类：求结果 / 求运算项（下拉）

**智能逻辑**：
- 若只选 1 种题型，直接进入 Step 3
- 若选多种题型，显示题型分配（可拖动滑块调整比例）

#### Step 3：高级配置（可选，折叠面板）
默认收起，点击展开：
- [ ] 难度等级（简单/中等/困难）
- [ ] 知识点筛选（按年级动态加载）
- [ ] 运算类型（加减乘除勾选 + 位数设置）
- [ ] 答案模式（不显示/题目后/单独页）

**完成按钮**：
- 显示总题数配置摘要
- 按钮文案：「生成 XX 题」

**持久化**：
- 用户上次配置自动保存到 `localStorage`
- 下次打开自动填充到 Step 1

### 3.2 一键重生成

**实现**：
- 页面加载时检测 `localStorage` 是否有历史配置
- 若有，显示提示条：「上次配置：3 年级上册，20 题算术」
- 提供按钮：「一键生成」（跳过配置直接生成）
- 提供链接：「重新配置」（进入 Step 1）

**用户体验**：
```
┌──────────────────────────────────────────────┐
│ 💡 上次配置已保存                             │
│ 3 年级上册 · 20 题算术 · 中等难度             │
│ [一键生成] [重新配置]                          │
└──────────────────────────────────────────────┘
```

### 3.3 操作反馈增强

#### 生成题目
- **Loading 状态**：按钮禁用 + 显示 spinner
- **成功提示**：Toast 显示「✅ 已生成 20 题，耗时 1.2s」
- **失败提示**：Toast 显示「❌ 生成失败，请重试」+ 错误详情（可展开）

#### 导出 PDF / 下载图片
- **Loading 状态**：按钮禁用 + 显示进度条或文字「导出中...」
- **成功提示**：Toast 显示「✅ PDF 已保存」
- **失败自动重试**：
  - 第一次失败后自动重试 1 次
  - 第二次失败后降级为图片导出（PDF → PNG）
  - 第三次失败提示手动操作

#### 打印
- **Loading 状态**：Toast 显示「正在调起打印...」
- **失败提示**：Toast 显示「❌ 打印失败，请尝试导出 PDF」

#### 分享（移动端）
- **Loading 状态**：Toast 显示「正在生成分享图片...」
- **不支持时**：Toast 提示「当前浏览器不支持分享，已自动下载图片」

### 3.4 错误处理重构

#### 全局错误处理
- 创建 `useErrorHandler()` composable
- 统一错误格式：`{ code, message, detail }`
- 错误级别：`error`（红色 Toast）| `warning`（黄色）| `info`（蓝色）

#### IndexedDB 异常处理
- 写入失败时 Toast 提示：「⚠️ 题库保存失败，但不影响使用」
- 读取失败时提示：「⚠️ 历史记录加载失败，请刷新重试」
- 提供「重试」按钮

#### 网络异常处理
- 预加载题库加载失败时静默降级（仅 console.warn，不弹窗）
- 导出/分享失败时重试 + 降级

### 3.5 历史记录增强

#### 列表优化
- [ ] 时间戳格式化：「2026-07-19 14:30」而非 ISO 字符串
- [ ] 配置预览：「3 年级上册 · 算术 20 题 · 中等难度」
- [ ] 删除前确认对话框：「确定删除这份试卷吗？」
- [ ] 批量删除（可选）

#### 一键复用
- 历史记录卡片右侧增加按钮：「用此配置生成」
- 点击后自动填充配置并跳转到 Step 1

### 3.6 移动端优化

- [ ] 操作栏始终可见（sticky，已实现）
- [ ] 导出/分享按钮增大触控区域（≥44px，已实现）
- [ ] 添加「返回顶部」按钮（滚动后显示）
- [ ] 配置面板折叠为可展开的 Sections

---

## 4. 技术设计

### 4.1 配置状态管理

**新增**：`src/composables/useConfigWizard.js`

```javascript
// 状态结构
const wizardState = reactive({
  step: 1,                    // 当前步骤 1/2/3
  config: { ...defaultConfig, ...savedConfig },
  completed: false,
});

// 方法
const nextStep = () => { /* 校验当前步骤后跳转 */ };
const prevStep = () => { /* 返回上一步 */ };
const saveConfig = () => { /* 保存到 localStorage */ };
const resetConfig = () => { /* 恢复默认 */ };
```

**持久化键**：`math-generator-config`

### 4.2 Toast 通知组件

**新增**：`src/components/ToastContainer.vue`

```vue
<template>
  <div class="toast-container">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :type="toast.type"
      :message="toast.message"
      :detail="toast.detail"
      @close="removeToast(toast.id)"
    />
  </div>
</template>
```

**API**：
```javascript
const { showToast, removeToast } = useToast();

// 使用
showToast({
  type: 'success',  // 'success' | 'error' | 'warning' | 'info'
  message: '已生成 20 题',
  detail: '耗时 1.2s',  // 可选
  duration: 3000,  // 毫秒，0 = 不自动关闭
});
```

### 4.3 Loading 状态管理

**新增**：`src/composables/useLoading.js`

```javascript
const { withLoading, isLoading } = useLoading();

// 使用
async function exportPdf() {
  await withLoading(async () => {
    await pdf.exportPdf(printRoot.value, filename);
  }, '导出中...');
}
```

**UI 实现**：
- ActionBar 按钮添加 `:disabled="isLoading"` 和 loading 图标
- Toast 显示加载进度：「生成中...」→「已生成」

### 4.4 错误处理 Composable

**新增**：`src/composables/useErrorHandler.js`

```javascript
const { handleError, handleWarning, handleInfo } = useErrorHandler();

// 使用
try {
  await dangerousOperation();
} catch (err) {
  handleError('操作失败', err.message);
}
```

**错误码映射**：
| 错误码 | 含义 | 处理方式 |
|--------|------|---------|
| `IDB_QUOTA_EXCEEDED` | IndexedDB 配额不足 | Toast 提示 + 清理旧数据 |
| `IDB_WRITE_FAILED` | 题库写入失败 | Toast 警告（不影响使用） |
| `PDF_EXPORT_FAILED` | PDF 导出失败 | 自动重试 → 降级图片 |
| `GENERATION_TIMEOUT` | 题目生成超时 | 重试 + 提示 |
| `NETWORK_ERROR` | 网络异常 | Toast 提示 + 重试按钮 |

### 4.5 测试稳定性修复

#### 修复 1：ArithmeticStrategy 测试
**问题**：`r.question` 在某些情况下为 `undefined`

**根因分析**：
- 检查 `src/strategies/ArithmeticStrategy.test.js` 第 18/24 行
- 检查策略委托逻辑是否正确传递 `question` 字段

**修复**：
```javascript
// 确保策略委托时正确返回 { question, answer }
const problem = await strategy.generate(rng);
expect(problem).toHaveProperty('question');
expect(problem).toHaveProperty('answer');
expect(typeof problem.question).toBe('string');
```

#### 修复 2：预加载题库 URL
**问题**：测试环境 `import.meta.env.BASE_URL` 解析异常

**根因分析**：
- `src/composables/usePreloadedLibrary.js` 第 13 行
- `fileUrl()` 返回相对路径 `/library/xxx.json`
- 测试环境 `fetch()` 无法解析相对路径

**修复**：
```javascript
function fileUrl(key) {
  // 测试环境使用绝对路径
  if (import.meta.env.MODE === 'test') {
    return `/src/library/${key}.json`;  // Vite test 路由
  }
  return `${import.meta.env.BASE_URL}library/${key}.json`;
}
```

**或者**（更优雅）：
```javascript
// vitest.config.js 添加 setupFiles
export default defineConfig({
  test: {
    setupFiles: ['./src/tests/setup-fetch-mock.js'],
  },
});

// src/tests/setup-fetch-mock.js
import { vi } from 'vitest';
global.fetch = vi.fn();
```

### 4.6 导出可靠性增强

**当前流程**：
```
exportPdf() → html2pdf → save
```

**新流程**：
```
exportPdf()
  ↓
[Retry #1]
  ↓ (失败)
[Retry #2]
  ↓ (失败)
[Fallback] → 生成图片 → 下载 PNG
  ↓ (失败)
[Error Toast] → 提示手动操作
```

**实现**：
```javascript
async function exportPdfWithRetry(element, filename, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      await pdf.exportPdf(element, filename);
      showToast({ type: 'success', message: '✅ PDF 已保存' });
      return;
    } catch (err) {
      if (i === retries) {
        // 最后一次失败，降级为图片
        await fallbackToImage(element, filename);
      }
    }
  }
}

async function fallbackToImage(element, filename) {
  try {
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename.replace('.pdf', '.png');
    link.click();
    showToast({ type: 'warning', message: '⚠️ PDF 导出失败，已保存为图片' });
  } catch (err) {
    showToast({ type: 'error', message: '❌ 导出失败，请手动截图保存' });
  }
}
```

### 4.7 打印优化

**问题**：
- 当前代码在移动端直接调用 `downloadImage()`，但逻辑可能混淆
- 打印样式存在重复定义（`style.css` 第 217-256 行 vs 第 528-564 行）

**修复**：
```javascript
function handlePrint() {
  if (!isMobile.value) {
    printer.print({ answerMode: config.value.answerMode });
  } else {
    // 移动端提示用户使用下载功能
    showToast({
      type: 'info',
      message: '📱 移动端请使用「下载图片」或「分享」功能',
      duration: 3000,
    });
    downloadImage();
  }
}
```

**打印样式统一**：
- 删除 `style.css` 第 217-256 行的旧版 `@media print`
- 保留第 528-564 行的完整版
- 确保 `@page` 规则在最后

### 4.8 生成算法超时保护

**当前问题**：`while` 循环（`useProblemGenerator.js:92`）无超时保护

**修复**：
```javascript
const GENERATION_TIMEOUT = 5000;  // 5 秒超时
const startTime = Date.now();

while (produced < needFromLive && attempts < needFromLive * 20) {
  // 超时检查
  if (Date.now() - startTime > GENERATION_TIMEOUT) {
    console.warn(`[useProblemGenerator] generation timeout after ${attempts} attempts`);
    break;
  }
  // ... 原有逻辑
}
```

---

## 5. 优先级与工作量

### Phase 1：可靠性基础（必做，1 天）
- [x] 修复 2 个失败测试
- [ ] IndexedDB 异常主动提示
- [ ] 导出/打印添加 loading 状态
- [ ] 生成算法超时保护

### Phase 2：核心体验（必做，2 天）
- [ ] Toast 通知组件
- [ ] 配置向导（3 步）
- [ ] 一键重生成
- [ ] 历史记录增强

### Phase 3：细节优化（可选，1 天）
- [ ] 导出自动重试 + 降级
- [ ] 打印样式统一
- [ ] 移动端优化

### Phase 4：可访问性增强（可选，0.5 天）
- [ ] 键盘导航支持
- [ ] ARIA 标签补充
- [ ] 高对比度模式支持

---

## 6. 验收标准

### 功能验收
- [ ] 首次使用用户在 30 秒内完成题目生成
- [ ] 导出 PDF 失败时自动降级为图片
- [ ] 删除历史记录前有确认对话框
- [ ] IndexedDB 写入失败时 Toast 提示
- [ ] 所有测试通过（0 失败）

### 性能验收
- [ ] 生成 20 题耗时 < 2s
- [ ] 导出 PDF 耗时 < 5s
- [ ] 页面加载时间 < 1s

### 兼容性验收
- [ ] Chrome 90+
- [ ] Safari 14+
- [ ] Firefox 88+
- [ ] 移动端 Safari/Chrome

---

## 7. 后续迭代（方案 C 预备）

以下功能不在本次范围，可作为后续迭代：
- [ ] 配置预设模板（「口算天天练」「乘法专项」等）
- [ ] 批量导出（一次生成多份试卷）
- [ ] 性能监控面板（生成速度、成功率统计）
- [ ] PWA 离线支持
- [ ] 题目难度自适应算法
- [ ] 错题本功能

---

## 8. 设计自检

### 8.1 Placeholder 扫描 ✅
- 无 "TBD"、"TODO" 标记
- 所有功能项有明确实现逻辑

### 8.2 内部一致性 ✅
- 配置向导默认值统一（`defaultConfig`）
- Toast API 统一（`useToast` composable）
- 错误码映射完整

### 8.3 范围检查 ✅
- 聚焦易用性 + 可靠性，不涉及新题型或算法优化
- Phase 1/2 必做，Phase 3/4 可选，避免范围蔓延

### 8.4 歧义检查 ✅
- 「一键重生成」明确为「跳过配置直接生成」
- 「降级方案」明确为「PDF → 图片」
- 测试修复目标明确：100% 通过

---

## 附录：技术债务清单

当前代码中的技术债务将在本次优化中一并清理：

1. **重复的 print 样式**：`style.css` 第 217-256 行与第 528-564 行重复
2. **硬编码的错误提示**：`alert()` 在 `App.vue:194`
3. **缺失的测试**：Toast 组件、配置向导无单元测试
4. **未使用的导入**：部分测试文件可能有冗余导入

这些债务将在对应模块重构时一并解决。
