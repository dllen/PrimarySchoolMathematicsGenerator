# Task 2: 增强 PDF 导出（添加超时控制）

**Spec reference**: `docs/superpowers/specs/2025-07-20-pdf-print-optimization-design.md`

## 任务描述

为现有的 PDF 导出功能添加超时控制机制，防止 PDF 生成时间过长导致用户长时间等待，并在超时时抛出明确错误。

## 文件结构

- **Modify**: `src/composables/usePdfExport.js` - 添加 `exportPdfWithTimeout` 函数
- **Modify**: `src/composables/usePdfExport.test.js` - 添加超时测试

**现有文件**:
- `src/composables/usePdfExport.js` - 已实现 `exportPdf` 和 `buildFilename`
- `src/composables/usePdfExport.test.js` - 已有基础测试

## 验收标准

1. ✅ 添加 `exportPdfWithTimeout` 函数，支持超时控制
2. ✅ 默认超时时间 30 秒
3. ✅ 超时时抛出明确错误信息
4. ✅ 添加单元测试验证超时行为
5. ✅ 保持向后兼容（现有 `exportPdf` 不变）

## 实现步骤

### Step 1: 添加超时测试

在 `src/composables/usePdfExport.test.js` 中添加：

```javascript
it('should export PDF with 30s timeout control', async () => {
  const el = document.createElement('div');
  el.textContent = '测试';
  document.body.appendChild(el);
  
  const { exportPdfWithTimeout } = usePdfExport();
  
  // Mock 超时场景
  vi.useFakeTimers();
  const promise = exportPdfWithTimeout(el, 'test.pdf', 1000);
  
  vi.advanceTimersByTime(1000);
  
  await expect(promise).rejects.toThrow('PDF 生成超时');
  vi.useRealTimers();
  
  document.body.removeChild(el);
});
```

### Step 2: 实现超时控制

在 `src/composables/usePdfExport.js` 末尾添加：

```javascript
/**
 * 带超时控制的 PDF 导出
 * @param {HTMLElement} element - 要导出的 DOM 元素
 * @param {string} filename - 文件名
 * @param {number} timeoutMs - 超时时间（毫秒），默认 30000
 * @returns {Promise<Blob>}
 */
async function exportPdfWithTimeout(element, filename, timeoutMs = 30000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('PDF 生成超时，请重试'));
    }, timeoutMs);
  });

  const exportPromise = exportPdf(element, filename);

  try {
    return await Promise.race([exportPromise, timeoutPromise]);
  } catch (err) {
    // 重新抛出错误，保留原始错误信息
    if (err.message.includes('超时')) {
      throw err;
    }
    throw err;
  }
}

export { exportPdfWithTimeout };
```

### Step 3: 运行测试

```bash
npx vitest run src/composables/usePdfExport.test.js
```

Expected: 所有测试通过（包括新增的超时测试）

### Step 4: 提交

```bash
git add src/composables/usePdfExport.js src/composables/usePdfExport.test.js
git commit -m "feat(pdf): add timeout control for PDF generation"
```

## 注意事项

- 使用 `Promise.race` 实现超时控制
- 超时错误信息要明确，便于用户理解
- 保持原有 `exportPdf` 函数不变，确保向后兼容
- 测试使用 `vi.useFakeTimers()` 模拟超时

## 完成标准

- [ ] 超时测试已添加
- [ ] `exportPdfWithTimeout` 函数已实现
- [ ] 测试通过
- [ ] 代码已提交

---

**请开始实现，完成后告诉我结果和 Git SHA**
