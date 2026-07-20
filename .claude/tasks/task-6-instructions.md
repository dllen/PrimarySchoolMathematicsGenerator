# Task 6: 优化打印样式

**Spec reference**: `docs/superpowers/specs/2025-07-20-pdf-print-optimization-design.md`

## 任务描述

增强打印样式，支持自定义列数、更好的分页控制、防断行、页眉页脚等。

## 文件结构

- **Modify**: `src/style.css` - 在现有 `@media print` 基础上增强

## 验收标准

1. ✅ 添加 CSS 变量 `--print-columns` 控制列数
2. ✅ 增强 `@media print` 样式
3. ✅ 改进分页和防断行
4. ✅ 添加页眉页脚支持
5. ✅ 优化彩色打印
6. ✅ 测试打印预览正常

## 实现步骤

### Step 1: 查看现有打印样式

```bash
grep -A 30 "@media print" src/style.css
```

了解当前打印样式实现。

### Step 2: 增强打印样式

在 `src/style.css` 中：

**2.1 在文件开头添加 CSS 变量**（`:root` 部分）：

```css
:root {
  /* 现有变量... */
  
  /* 打印布局变量 */
  --print-columns: 3;  /* 默认 3 列 */
}
```

**2.2 增强 `@page` 规则**（在文件末尾追加）：

```css
/* 打印页面设置 */
@page {
  size: A4;
  margin: 15mm;

  /* 页眉页脚（仅 Firefox） */
  @top-center {
    content: "小学数学练习题";
    font-size: 9pt;
    color: #666;
  }

  @bottom-center {
    content: "第 " counter(page) " 页，共 " counter(pages) " 页";
    font-size: 9pt;
    color: #666;
  }
}
```

**2.3 增强 `@media print` 规则**（追加到现有打印样式）：

```css
@media print {
  /* 全局设置 */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    background: white !important;
    font-size: 11pt !important;
    line-height: 1.5 !important;
    color: #000 !important;
  }

  /* 隐藏所有非打印元素 */
  .config-panel,
  .action-bar,
  .header-actions,
  .nav-header,
  .back-btn,
  button:not(.print-only),
  .home-page,
  .menu-grid,
  .home-features {
    display: none !important;
  }

  /* 打印根容器 */
  .print-root {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* 题目网格 - 使用 CSS 变量控制列数 */
  .problems-grid {
    display: grid !important;
    grid-template-columns: repeat(var(--print-columns, 3), 1fr) !important;
    gap: 8px 12px !important;
    page-break-inside: avoid !important;
  }

  /* 题目项 */
  .problem-item {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    border: 1px solid #333 !important;
    padding: 6px 8px !important;
    min-height: 50px !important;
    font-size: 10pt !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  /* 答案网格 */
  .answer-grid {
    display: grid !important;
    grid-template-columns: repeat(var(--print-columns, 3), 1fr) !important;
    gap: 8px 12px !important;
  }

  .answer-item {
    page-break-inside: avoid !important;
  }

  /* 防止孤行 */
  p,
  .problem-item {
    orphans: 3;
    widows: 3;
  }

  /* 标题不页末断行 */
  h1, h2, h3, h4 {
    page-break-after: avoid;
  }

  /* 工作表头部 */
  .worksheet-header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #000;
  }

  .worksheet-header h3 {
    font-size: 18pt;
    margin: 0 0 10px 0;
  }

  .info-row {
    display: flex !important;
    justify-content: space-between;
    padding: 0 20px;
    font-size: 10pt;
    margin: 8px 0;
  }

  /* 图片和媒体 */
  img {
    max-width: 100% !important;
    page-break-inside: avoid;
  }
}

/* Chrome/Safari 页眉页脚模拟 */
@media print and (prefers-color-scheme: light) {
  body::before {
    content: "小学数学练习题";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 20px;
    text-align: center;
    font-size: 9pt;
    color: #666;
  }

  body::after {
    content: "第 " counter(page) " 页";
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20px;
    text-align: center;
    font-size: 9pt;
    color: #666;
  }
}

/* 高 DPI 打印优化 */
@media print and (-webkit-min-device-pixel-ratio: 2) {
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* 墨水节省模式 */
@media print and (prefers-color-scheme: dark) {
  body {
    background: white !important;
    color: black !important;
  }
}
```

**完整代码已提供在实现计划文档 Task 6 中**，请直接使用。

### Step 3: 测试打印样式

```bash
npm run dev
```

**测试方法**:
1. 生成题目
2. 打开浏览器打印预览（Cmd/Ctrl + P）
3. 检查：
   - ✅ 列数是否为 3 列
   - ✅ 题目是否完整显示（无截断）
   - ✅ 页眉页脚是否显示
   - ✅ 配置面板是否隐藏
   - ✅ 按钮是否隐藏

### Step 4: 提交

```bash
git add src/style.css
git commit -m "style(print): enhance print styles with custom columns and page breaks"
```

## 注意事项

- 使用 `!important` 确保样式优先级
- `page-break-inside: avoid` 防止题目被分页截断
- CSS 变量 `--print-columns` 可在 Task 7 中通过配置控制
- Chrome/Safari 使用 `::before/::after` 模拟页眉页脚

## 完成标准

- [ ] CSS 变量已添加
- [ ] `@page` 规则已增强
- [ ] `@media print` 样式已增强
- [ ] 打印预览测试通过
- [ ] 代码已提交

---

**请开始实现，完成后告诉我结果和 Git SHA**
