# Task 8: 添加全面错误处理

**Spec reference**: `docs/superpowers/specs/2025-07-20-pdf-print-optimization-design.md`

## 任务描述

创建错误消息常量文件，并增强导出模块的错误处理，提供更友好的用户反馈。

## 文件结构

- **Create**: `src/constants/exportErrors.js` - 错误消息常量
- **Modify**: `src/composables/useEnhancedExport.js` - 增强错误处理

## 验收标准

1. ✅ 创建 exportErrors.js 定义错误消息
2. ✅ useEnhancedExport.js 中使用错误常量
3. ✅ 添加内存不足检测
4. ✅ 添加跨域图片限制处理
5. ✅ 添加导出进度提示
6. ✅ 代码已提交

## 实现步骤

### Step 1: 创建 exportErrors.js

创建 `src/constants/exportErrors.js`:

```javascript
/**
 * 导出功能错误消息常量
 */

export const EXPORT_ERRORS = {
  // PDF 生成超时
  pdfTimeout: {
    title: 'PDF 生成超时',
    message: '题目太多，PDF 生成时间过长。已自动切换为图片模式。',
    action: '查看图片'
  },

  // Canvas 生成失败（内存不足）
  canvasFailed: {
    title: '生成失败',
    message: '浏览器内存不足，请尝试：\n1. 减少题目数量\n2. 关闭其他标签页\n3. 刷新页面后重试',
    action: '好的'
  },

  // 下载被拦截
  downloadBlocked: {
    title: '下载被拦截',
    message: '浏览器拦截了下载，请右键点击图片选择"图片另存为"',
    action: '我知道了'
  },

  // 分享失败
  shareFailed: {
    title: '分享失败',
    message: '分享功能不可用，请手动保存图片后分享',
    action: '好的'
  },

  // 内存不足
  memoryError: {
    title: '内存不足',
    message: '题目太多，请减少题目数量后重试',
    action: '好的'
  },

  // 跨域图片限制
  crossOrigin: {
    title: '跨域图片限制',
    message: '图片跨域限制了导出功能，请确保所有资源来自同一域名',
    action: '好的'
  },

  // 通用错误
  unknown: {
    title: '导出失败',
    message: '发生了未知错误，请重试或联系开发者',
    action: '好的'
  }
};

/**
 * 根据错误获取对应的错误消息
 * @param {Error} error - 错误对象
 * @returns {Object} 错误消息对象
 */
export function getExportError(error) {
  if (!error) {
    return EXPORT_ERRORS.unknown;
  }

  const message = error.message || '';

  // 超时错误
  if (message.includes('超时')) {
    return EXPORT_ERRORS.pdfTimeout;
  }

  // 内存不足
  if (message.includes('memory') || message.includes('内存') || error.code === 12) {
    return EXPORT_ERRORS.memoryError;
  }

  // 跨域错误
  if (message.includes('tainted') || message.includes('SecurityError') || message.includes('跨域')) {
    return EXPORT_ERRORS.crossOrigin;
  }

  // Canvas 失败
  if (message.includes('canvas') || message.includes('生成失败')) {
    return EXPORT_ERRORS.canvasFailed;
  }

  // 默认未知错误
  return EXPORT_ERRORS.unknown;
}
```

### Step 2: 增强 useEnhancedExport.js 的错误处理

**2.1 添加 import**:

```javascript
import { EXPORT_ERRORS, getExportError } from '../constants/exportErrors.js';
```

**2.2 增强 exportAsImage 的错误处理**:

```javascript
async function exportAsImage(config) {
  try {
    const { element } = config;
    const html2canvas = (await import('html2canvas-pro')).default;

    // 根据环境调整 scale
    const isMobileEnv = env.value.platform === 'mobile';
    const scale = isMobileEnv
      ? Math.min(window.devicePixelRatio * 2.5, 3)
      : window.devicePixelRatio * 3;

    // Canvas 配置
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    // 转换为 Blob
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('图片生成失败'));
          }
        },
        'image/png',
        0.95
      );
    });

    const filename = buildImageFilename(config.config || {});
    const url = URL.createObjectURL(blob);

    // 显示预览
    if (isMobileEnv || env.value.browser === 'wechat') {
      showPreview('image', { url, filename, blob });
      info('图片已生成', '请长按图片保存到相册');
    } else {
      try {
        downloadBlob(blob, filename);
        success('图片已保存', filename);
      } catch (err) {
        showPreview('image', { url, filename, blob });
        warning('下载失败', '请使用预览保存');
      }
    }
  } catch (err) {
    // 获取错误信息
    const errorInfo = getExportError(err);

    // 内存不足检测
    if (err.message.includes('memory') || err.code === 12) {
      error(errorInfo.title, errorInfo.message);
      return;
    }

    // 跨域图片限制
    if (err.message.includes('tainted') || err.message.includes('SecurityError')) {
      error(errorInfo.title, errorInfo.message);
      return;
    }

    // 其他错误
    console.error('Image export failed:', err);
    error(errorInfo.title, errorInfo.message);
    throw err;
  }
}
```

**2.3 在 smartExport 中添加进度提示**:

```javascript
async function smartExport(config) {
  if (!config?.element) {
    error('导出失败', '未找到要导出的内容');
    return;
  }

  exporting.value = true;

  try {
    // 微信浏览器
    if (env.value.browser === 'wechat') {
      info('正在生成图片', '请稍候...');
      await exportAsImage(config);
      return;
    }

    // 移动端
    if (env.value.platform === 'mobile') {
      info('正在生成图片', '请稍候...');
      await exportAsImage(config);
      return;
    }

    // 桌面端：优先 PDF
    if (env.value.platform === 'desktop') {
      try {
        info('正在生成 PDF', '请稍候...');
        await exportAsPdf(config);
        return;
      } catch (err) {
        const errorInfo = getExportError(err);
        warning(errorInfo.title, errorInfo.message);
        info('正在切换到图片模式', '请稍候...');
        await exportAsImage(config);
        return;
      }
    }

    // 默认：图片模式
    await exportAsImage(config);

  } catch (err) {
    const errorInfo = getExportError(err);
    console.error('Export error:', err);
    error(errorInfo.title, errorInfo.message);
  } finally {
    exporting.value = false;
  }
}
```

**2.4 在 exportAsPdf 中添加错误处理**:

```javascript
async function exportAsPdf(config) {
  const { element, config: pdfConfig = {} } = config;
  const filename = buildFilename(pdfConfig);

  // 超时控制
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('PDF 生成超时，请重试'));
    }, 30000);
  });

  const exportPromise = originalExportPdf(element, filename);

  try {
    const blob = await Promise.race([exportPromise, timeoutPromise]);

    const url = URL.createObjectURL(blob);
    showPreview('pdf', { url, filename, blob });
    success('PDF 生成成功', filename);

  } catch (err) {
    const errorInfo = getExportError(err);
    console.error('PDF export failed:', err);
    throw new Error(errorInfo.message);
  }
}
```

### Step 3: 运行测试

```bash
npx vitest run src/composables/useEnhancedExport.test.js
```

Expected: 所有测试通过

### Step 4: 提交

```bash
git add src/constants/exportErrors.js src/composables/useEnhancedExport.js
git commit -m "feat(export): add comprehensive error handling and user feedback"
```

## 注意事项

- 错误消息要友好，避免技术术语
- 提供 actionable 的建议（如"减少题目数量"）
- 内存不足和跨域错误要特殊处理
- 保持错误处理的一致性

## 完成标准

- [ ] exportErrors.js 已创建
- [ ] useEnhancedExport.js 已增强
- [ ] 测试通过
- [ ] 代码已提交

---

**请开始实现，完成后告诉我结果和 Git SHA**
