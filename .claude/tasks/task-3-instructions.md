# Task 3: 创建增强型导出模块 (useEnhancedExport)

**Spec reference**: `docs/superpowers/specs/2025-07-20-pdf-print-optimization-design.md`

## 任务描述

创建增强型导出模块，根据环境自动选择最佳导出方案：
- 微信/移动端：直接使用图片模式
- 桌面端：优先 PDF，失败降级图片
- 提供统一的智能导出入口

## 文件结构

- **Create**: `src/composables/useEnhancedExport.js` - 增强型导出模块
- **Create**: `src/composables/useEnhancedExport.test.js` - 单元测试

## 验收标准

1. ✅ 提供 `smartExport` 主入口函数
2. ✅ 环境检测集成（微信/移动端/桌面端）
3. ✅ PDF 导出（桌面端优先）
4. ✅ 图片导出（移动端/微信/降级）
5. ✅ 超时控制集成
6. ✅ 预览弹窗状态管理
7. ✅ 全面的错误处理
8. ✅ 单元测试覆盖主要场景

## 实现步骤

### Step 1: 编写集成测试

创建 `src/composables/useEnhancedExport.test.js`，测试场景：

- 桌面端导出 PDF
- PDF 失败时降级图片
- 微信环境使用图片模式
- 导出成功后显示预览
- 保存图片功能
- 分享功能
- 下载 PDF 功能

**测试代码已提供在实现计划中**，请直接使用（需要调整 import 路径）。

### Step 2: 创建 useEnhancedExport.js

实现核心功能：

```javascript
export function useEnhancedExport() {
  // 导出状态
  const exporting = ref(false);
  const previewVisible = ref(false);
  const previewType = ref('');  // 'image' | 'pdf'
  const previewData = ref(null);

  // 主入口：智能导出
  async function smartExport(config) { ... }
  
  // PDF 导出（带超时）
  async function exportAsPdf(config) { ... }
  
  // 图片导出
  async function exportAsImage(config) { ... }
  
  // 预览控制
  function showPreview(type, data) { ... }
  function closePreview() { ... }
  
  // 操作函数
  function saveImage() { ... }
  async function shareImage() { ... }
  function downloadPdf() { ... }
  function handlePrint() { ... }
  
  // 工具函数
  function buildFilename(config) { ... }
  function buildImageFilename(config) { ... }
  function downloadBlob(blobOrUrl, filename) { ... }
  
  return {
    exporting,
    previewVisible,
    previewType,
    previewData,
    env,  // 来自 useExportEnv
    smartExport,
    exportAsPdf,
    exportAsImage,
    showPreview,
    closePreview,
    saveImage,
    shareImage,
    downloadPdf,
    handlePrint
  };
}
```

**完整实现代码已提供在实现计划文档中**，请直接使用。

### Step 3: 运行测试

```bash
npx vitest run src/composables/useEnhancedExport.test.js
```

Expected: 所有测试通过

### Step 4: 提交

```bash
git add src/composables/useEnhancedExport.js src/composables/useEnhancedExport.test.js
git commit -m "feat(export): add enhanced export module with smart fallback"
```

## 关键技术点

1. **动态导入 html2canvas**: `const html2canvas = (await import('html2canvas-pro')).default`
2. **Blob URL 管理**: 预览关闭时释放 `URL.revokeObjectURL`
3. **环境适配**: 移动端 scale 2.5，桌面端 scale 3
4. **错误处理**: try-catch + 用户友好提示
5. **智能降级**: PDF 失败自动转图片

## 注意事项

- 使用动态导入避免打包体积过大
- Blob URL 必须及时释放，避免内存泄漏
- 微信环境无法 download，需要提示长按保存
- 超时控制在 30 秒

## 完成标准

- [ ] 测试文件已创建
- [ ] 实现文件已创建
- [ ] 所有测试通过
- [ ] 代码已提交

---

**请开始实现，完成后告诉我结果和 Git SHA**
