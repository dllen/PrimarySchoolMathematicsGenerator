# PDF/打印兼容性优化设计文档

**项目**: PrimarySchoolMathematicsGenerator  
**版本**: v1.0  
**日期**: 2025-07-20  
**状态**: ✅ 待审查  
**优先级**: 高  

---

## 1. 背景与目标

### 1.1 问题背景

当前项目的 PDF 生成和打印功能存在以下兼容性问题：

1. **微信浏览器完全无法导出 PDF**（download 属性被屏蔽）
2. **Android 移动端打印功能不兼容**（window.print() 支持差）
3. **PDF 生成失败时降级机制不够友好**（自动下载图片，用户找不到）
4. **图片导出缺少预览和引导**（直接下载，用户体验差）
5. **排版布局不够灵活**（固定 2-4 列，无法自定义）

### 1.2 优化目标

- ✅ 确保在**微信浏览器**中能正常导出/分享
- ✅ 确保在**国内主流 Android 手机浏览器**中功能可用
- ✅ 优化**打印样式**，确保桌面端打印质量
- ✅ 提供**图片预览弹窗**，引导用户保存
- ✅ 支持**自定义排版布局**（2/3/4 列）
- ✅ 完善**错误处理**和**降级机制**

### 1.3 适用范围

| 场景 | 优化前 | 优化后 |
|------|--------|--------|
| 微信浏览器 | ❌ PDF 完全不可用 | ✅ 图片预览 + 长按保存 |
| Android UC/QQ浏览器 | ⚠️ 部分可用 | ✅ 全功能可用 |
| iOS Safari/微信 | ✅ 可用 | ✅ 进一步优化体验 |
| 桌面端 Chrome/Edge | ✅ PDF 可用 | ✅ 更稳定的 PDF + 质量选项 |
| 桌面端打印 | ✅ 可用 | ✅ 打印样式优化 |

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────┐
│             用户点击"导出"按钮              │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│        环境检测模块 (detectEnv)          │
│  - 检测 User-Agent                       │
│  - 检测浏览器能力（download, print等）    │
│  - 返回: { platform, browser, features } │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
┌──────────────┐    ┌──────────────┐
│  微信/移动端  │    │   桌面端      │
│              │    │              │
│ 生成高质量图片 │    │ 优先 PDF导出  │
│ 展示预览弹窗  │    │ 失败降级图片  │
│ 引导保存操作  │    │ 提供打印选项  │
└──────┬───────┘    └──────┬───────┘
       │                   │
       └─────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │  统一预览组件     │
        │  (ExportPreview) │
        │                  │
        │ - 图片/PDF预览    │
        │ - 保存引导        │
        │ - 分享功能        │
        │ - 错误提示        │
        └──────────────────┘
```

### 2.2 核心模块

#### 2.2.1 环境检测模块 (`useExportEnv`)

**职责**: 检测用户环境，决定导出策略

**接口**:
```javascript
const { env, isSupported } = useExportEnv()

// env 结构:
{
  platform: 'wechat' | 'mobile' | 'desktop',
  browser: 'wechat' | 'uc' | 'qq' | 'chrome' | 'safari' | 'edge' | 'unknown',
  features: {
    download: boolean,      // 支持 download 属性
    print: boolean,         // 支持 window.print()
    share: boolean,         // 支持 navigator.share
    clipboard: boolean,     // 支持 Clipboard API
    fileSaver: boolean      // 支持 FileSaver
  }
}
```

**实现要点**:
- 优先通过特性检测判断，User-Agent 仅作降级方案
- 微信检测：检查 `MicroMessenger` UA + 特殊 API（如 `wx`）
- 移动端检测：`/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)`

#### 2.2.2 导出策略模块 (`useExportStrategy`)

**职责**: 根据环境决定导出方案

**策略决策树**:
```
检测环境
  │
  ├─ 微信浏览器 → 图片模式
  │   ├─ 生成高质量图片 (scale: 3)
  │   ├─ 展示预览弹窗
  │   └─ 引导长按保存
  │
  ├─ 移动端（非微信） → 图片模式
  │   ├─ 生成高质量图片 (scale: 2.5)
  │   ├─ 尝试自动下载（如果支持）
  │   └─ 下载失败则展示预览弹窗
  │
  └─ 桌面端 → PDF优先
      ├─ 尝试 PDF 生成
      │   ├─ 成功 → 展示预览 + 提供打印/下载
      │   └─ 失败 → 降级图片模式
      └─ 提供打印选项
```

**实现要点**:
- PDF 生成增加超时控制（30s）
- 捕获所有错误，确保降级到图片
- 提供用户手动选择 PDF/图片的选项

#### 2.2.3 统一预览组件 (`ExportPreview.vue`)

**职责**: 展示导出结果，提供操作引导

**UI 设计**:
```vue
<template>
  <div v-if="visible" class="export-preview-overlay">
    <div class="export-preview-dialog">
      <!-- 标题 -->
      <h3>📄 导出成功</h3>
      
      <!-- 预览区域 -->
      <div class="preview-area">
        <img :src="previewUrl" alt="预览" />
      </div>
      
      <!-- 引导文字 -->
      <div class="guide-text">
        <p v-if="env.platform === 'wechat'">
          💡 <strong>微信用户：</strong>长按上方图片 → 保存到相册 → 可转发给老师
        </p>
        <p v-else-if="env.platform === 'mobile'">
          💡 <strong>手机用户：</strong>长按上方图片保存到相册
        </p>
        <p v-else>
          💡 可以右键"图片另存为"保存，或使用下方按钮
        </p>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button @click="saveImage">💾 保存图片</button>
        <button v-if="env.features.share" @click="shareImage">📤 分享</button>
        <button v-if="pdfUrl" @click="downloadPdf">📥 下载 PDF</button>
        <button @click="print" v-if="env.features.print && !isMobile">🖨️ 打印</button>
      </div>
      
      <!-- 关闭按钮 -->
      <button class="close-btn" @click="close">✕</button>
    </div>
  </div>
</template>
```

#### 2.2.4 增强型 PDF 生成器 (`useEnhancedPdfExport`)

**职责**: 改进 PDF 生成质量和稳定性

**改进点**:
- 增加超时控制（30s 超时则降级图片）
- 优化 canvas 参数（scale 根据 DPR 调整）
- 增加字体嵌入（避免中文乱码）
- 改进排版布局（支持自定义列数）
- 添加进度提示

**配置选项**:
```javascript
const pdfOptions = {
  // 质量设置
  quality: 'highest',  // highest | balanced | low
  
  // 图片设置
  image: {
    type: 'jpeg',
    quality: 0.95,
    scale: 3  // 动态调整：桌面端 3, 移动端 2
  },
  
  // Canvas 设置
  html2canvas: {
    scale: window.devicePixelRatio * 2,  // 适配 Retina 屏幕
    useCORS: true,
    allowTaint: false,
    logging: false,  // 生产环境关闭日志
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
  },
  
  // jsPDF 设置
  jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
    compress: true  // 压缩 PDF
  },
  
  // 分页设置
  pagebreak: {
    mode: ['css', 'legacy'],  // CSS 分页优先
    before: '.page-break-before',
    after: '.page-break-after'
  },
  
  // 超时设置
  timeout: 30000  // 30 秒超时
}
```

#### 2.2.5 增强型图片生成器 (`useEnhancedImageExport`)

**职责**: 改进图片生成质量和移动端兼容性

**改进点**:
- 针对移动端优化（scale、压缩）
- 支持高清 Retina 屏幕
- 增加图片压缩选项（减少文件大小）
- 添加水印（可选）

**配置选项**:
```javascript
const imageOptions = {
  // 质量设置
  quality: 'high',  // high | medium | low
  
  // Canvas 设置
  canvas: {
    scale: window.devicePixelRatio * 2,  // 适配高清屏
    useCORS: true,
    allowTaint: false,
    width: element.scrollWidth,
    height: element.scrollHeight
  },
  
  // 输出设置
  output: {
    format: 'image/png',  // PNG（高清）或 JPEG（压缩）
    quality: 0.9,  // JPEG 质量
    compress: true  // 压缩（PNG 有效）
  }
}
```

### 2.3 排版布局优化

#### 2.3.1 自定义列数配置

在配置面板中添加"打印布局"选项：

```vue
<ConfigItem>
  <label>打印布局</label>
  <select v-model="config.printLayout">
    <option value="2">2 列（宽松）</option>
    <option value="3">3 列（标准）</option>
    <option value="4">4 列（紧凑）</option>
  </select>
</ConfigItem>
```

#### 2.3.2 CSS 变量控制布局

```css
:root {
  --print-columns: 3;  /* 动态控制 */
}

.print-root {
  display: grid;
  grid-template-columns: repeat(var(--print-columns), 1fr);
  gap: 8px 16px;
}

@media print {
  .problems-grid {
    grid-template-columns: repeat(var(--print-columns), 1fr);
  }
}
```

---

## 3. 详细设计

### 3.1 环境检测实现

**文件**: `src/composables/useExportEnv.js`（新建）

```javascript
import { ref, computed } from 'vue'

export function useExportEnv() {
  const env = ref({
    platform: 'desktop',
    browser: 'unknown',
    features: {
      download: false,
      print: false,
      share: false,
      clipboard: false,
      fileSaver: false
    }
  })

  function detectPlatform() {
    const ua = navigator.userAgent || ''
    
    // 微信检测
    if (/MicroMessenger/i.test(ua)) {
      return {
        platform: 'mobile',
        browser: 'wechat'
      }
    }
    
    // UC 浏览器
    if (/UCBrowser/i.test(ua)) {
      return { platform: 'mobile', browser: 'uc' }
    }
    
    // QQ 浏览器
    if (/MQQBrowser/i.test(ua) || /QQ/i.test(ua)) {
      return { platform: 'mobile', browser: 'qq' }
    }
    
    // 移动端通用检测
    if (/Android|iPhone|iPad|iPod/i.test(ua)) {
      return { platform: 'mobile', browser: 'mobile' }
    }
    
    // 桌面端
    return { platform: 'desktop', browser: 'desktop' }
  }

  function detectFeatures() {
    // download 属性检测
    const downloadTest = document.createElement('a')
    const hasDownload = 'download' in downloadTest
    
    // print 检测
    const hasPrint = typeof window.print === 'function'
    
    // Share API 检测
    const hasShare = 'share' in navigator
    
    // Clipboard API
    const hasClipboard = 'clipboard' in navigator
    
    // FileSaver
    const hasFileSaver = typeof window.saveAs === 'function'

    return {
      download: hasDownload,
      print: hasPrint,
      share: hasShare,
      clipboard: hasClipboard,
      fileSaver: hasFileSaver
    }
  }

  // 初始化检测
  onMounted(() => {
    const platformInfo = detectPlatform()
    const features = detectFeatures()
    
    env.value = {
      ...platformInfo,
      features
    }
  })

  const isWechat = computed(() => env.value.browser === 'wechat')
  const isMobile = computed(() => env.value.platform === 'mobile')
  const isDesktop = computed(() => env.value.platform === 'desktop')
  const isSupported = computed(() => {
    // 至少支持图片生成或 PDF
    return true  // 当前都支持
  })

  return {
    env,
    isWechat,
    isMobile,
    isDesktop,
    isSupported,
    detectPlatform,
    detectFeatures
  }
}
```

### 3.2 增强型导出模块

**文件**: `src/composables/useEnhancedExport.js`（新建）

```javascript
import { ref } from 'vue'
import { usePdfExport } from './usePdfExport'
import { usePrint } from './usePrint'
import { useToast } from './useToast'
import { useExportEnv } from './useExportEnv'

export function useEnhancedExport() {
  const { exportPdf } = usePdfExport()
  const { print } = usePrint()
  const { success, error, warning, info } = useToast()
  const { env } = useExportEnv()
  
  const exporting = ref(false)
  const previewVisible = ref(false)
  const previewType = ref('')  // 'image' | 'pdf'
  const previewData = ref(null)

  /**
   * 主入口：智能导出
   * 根据环境自动选择最佳方案
   */
  async function smartExport(config) {
    exporting.value = true
    
    try {
      // 微信浏览器：直接走图片模式
      if (env.value.browser === 'wechat') {
        await exportAsImage(config)
        return
      }
      
      // 桌面端：优先 PDF
      if (env.value.platform === 'desktop') {
        try {
          await exportAsPdf(config)
          return
        } catch (err) {
          warning('PDF 导出失败', '正在尝试图片模式...')
          await exportAsImage(config)
          return
        }
      }
      
      // 其他移动端：图片模式
      await exportAsImage(config)
      
    } catch (err) {
      error('导出失败', err.message)
    } finally {
      exporting.value = false
    }
  }

  /**
   * 导出为 PDF（桌面端优先）
   */
  async function exportAsPdf(config) {
    const { exportPdf: originalExportPdf } = usePdfExport()
    const filename = buildFilename(config)
    
    // 设置超时控制
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('PDF 生成超时，请重试')), 30000)
    })
    
    // 竞速：正常导出 vs 超时
    const exportPromise = originalExportPdf(config.element, filename)
    
    try {
      const blob = await Promise.race([exportPromise, timeoutPromise])
      
      // 成功：展示预览
      const url = URL.createObjectURL(blob)
      showPreview('pdf', { url, filename })
      success('PDF 生成成功', filename)
      
    } catch (err) {
      throw err
    }
  }

  /**
   * 导出为图片（移动端/微信优先）
   */
  async function exportAsImage(config) {
    const html2canvas = (await import('html2canvas-pro')).default
    const element = config.element
    
    // 根据环境调整 scale
    const scale = env.value.platform === 'mobile' 
      ? window.devicePixelRatio * 2.5
      : window.devicePixelRatio * 3
    
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
    })
    
    // 转换为 Blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png', 0.95)
    })
    
    const url = URL.createObjectURL(blob)
    const filename = buildImageFilename(config)
    
    // 显示预览（微信/移动端必须预览，桌面端可选）
    if (env.value.platform === 'mobile') {
      showPreview('image', { url, filename, blob })
    } else {
      // 桌面端：尝试自动下载，失败则预览
      try {
        downloadBlob(blob, filename)
        success('图片已保存', filename)
      } catch (err) {
        showPreview('image', { url, filename, blob })
      }
    }
  }

  /**
   * 显示预览弹窗
   */
  function showPreview(type, data) {
    previewType.value = type
    previewData.value = data
    previewVisible.value = true
  }

  /**
   * 关闭预览
   */
  function closePreview() {
    previewVisible.value = false
    if (previewData.value?.url) {
      URL.revokeObjectURL(previewData.value.url)
    }
    previewData.value = null
  }

  /**
   * 保存图片（兼容所有环境）
   */
  function saveImage() {
    const { url, blob, filename } = previewData.value
    
    if (env.value.browser === 'wechat' || env.value.platform === 'mobile') {
      // 微信/移动端：无法直接下载，提示用户长按
      warning('请长按图片保存', '长按上方图片 → 保存到相册')
      return
    }
    
    // 桌面端：直接下载
    downloadBlob(blob, filename)
    success('图片已保存')
  }

  /**
   * 分享图片
   */
  async function shareImage() {
    const { blob, filename } = previewData.value
    
    if (!navigator.share) {
      warning('不支持分享', '请手动保存图片后分享')
      return
    }
    
    const file = new File([blob], filename, { type: 'image/png' })
    
    try {
      await navigator.share({
        files: [file],
        title: '数学练习题',
        text: '分享数学练习题'
      })
      success('分享成功')
    } catch (err) {
      if (err.name !== 'AbortError') {
        error('分享失败', err.message)
      }
    }
  }

  /**
   * 下载 PDF
   */
  function downloadPdf() {
    const { url, filename } = previewData.value
    downloadBlob(url, filename)
    success('PDF 已下载', filename)
  }

  /**
   * 打印
   */
  function handlePrint() {
    if (env.value.features.print) {
      print()
    } else {
      warning('打印不可用', '请使用图片模式保存')
    }
  }

  // 工具函数
  function buildFilename(config) {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const gradeLabel = `${config.grade}年级${config.semester || ''}`
    return `数学练习题_${gradeLabel}_${yyyy}-${mm}-${dd}.pdf`
  }

  function buildImageFilename(config) {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const gradeLabel = `${config.grade}年级${config.semester || ''}`
    return `数学练习题_${gradeLabel}_${yyyy}-${mm}-${dd}.png`
  }

  function downloadBlob(blobOrUrl, filename) {
    const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    if (typeof blobOrUrl !== 'string') {
      URL.revokeObjectURL(url)
    }
  }

  return {
    exporting,
    previewVisible,
    previewType,
    previewData,
    env,
    smartExport,
    exportAsPdf,
    exportAsImage,
    showPreview,
    closePreview,
    saveImage,
    shareImage,
    downloadPdf,
    handlePrint
  }
}
```

### 3.3 预览组件实现

**文件**: `src/components/ExportPreview.vue`（新建）

```vue
<template>
  <div v-if="visible" class="export-preview-overlay" @click.self="close">
    <div class="export-preview-dialog">
      <!-- 标题 -->
      <div class="dialog-header">
        <h3>📄 {{ title }}</h3>
        <button class="close-btn" @click="close">✕</button>
      </div>
      
      <!-- 预览区域 -->
      <div class="preview-scroll">
        <img 
          v-if="type === 'image'" 
          :src="previewData.url" 
          :alt="'导出预览'"
          class="preview-image"
        />
        <div v-else-if="type === 'pdf'" class="pdf-preview">
          <iframe v-if="previewData.url" :src="previewData.url" class="pdf-frame" />
          <div v-else class="pdf-loading">
            <p>PDF 生成中...</p>
          </div>
        </div>
      </div>
      
      <!-- 引导文字 -->
      <div class="guide-text">
        <div v-if="env.browser === 'wechat'" class="guide-item wechat">
          <span class="guide-icon">💡</span>
          <div class="guide-content">
            <strong>微信用户操作指南：</strong>
            <ol>
              <li>长按上方图片</li>
              <li>点击"保存到相册"</li>
              <li>可转发给老师或打印</li>
            </ol>
          </div>
        </div>
        
        <div v-else-if="env.platform === 'mobile'" class="guide-item mobile">
          <span class="guide-icon">💡</span>
          <div class="guide-content">
            <strong>手机用户：</strong>
            <p>长按上方图片保存到相册</p>
          </div>
        </div>
        
        <div v-else class="guide-item desktop">
          <span class="guide-icon">💡</span>
          <div class="guide-content">
            <p>可以右键"图片另存为"保存，或使用下方按钮</p>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <!-- 图片相关 -->
        <template v-if="type === 'image'">
          <button v-if="env.platform !== 'mobile'" @click="saveImage" class="btn-primary">
            💾 保存图片
          </button>
          
          <button 
            v-if="env.features.share" 
            @click="$emit('share')" 
            class="btn-secondary"
          >
            📤 分享
          </button>
        </template>
        
        <!-- PDF 相关 -->
        <template v-else-if="type === 'pdf'">
          <button @click="downloadPdf" class="btn-primary">
            📥 下载 PDF
          </button>
          
          <button 
            v-if="env.features.print" 
            @click="$emit('print')" 
            class="btn-secondary"
          >
            🖨️ 打印
          </button>
        </template>
        
        <!-- 通用按钮 -->
        <button @click="close" class="btn-tertiary">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  type: { type: String, default: 'image' },  // 'image' | 'pdf'
  previewData: { type: Object, default: null },
  env: { type: Object, required: true }
})

const emit = defineEmits(['close', 'save', 'share', 'print', 'download-pdf'])

const title = computed(() => {
  return props.type === 'image' ? '图片已生成' : 'PDF 已生成'
})

function close() {
  emit('close')
}

function saveImage() {
  emit('save')
}

function downloadPdf() {
  emit('download-pdf')
}
</script>

<style scoped>
.export-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.export-preview-dialog {
  background: white;
  border-radius: 16px;
  max-width: 95vw;
  max-height: 95vh;
  width: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.preview-scroll {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: #f5f5f5;
}

.preview-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pdf-frame {
  width: 100%;
  height: 500px;
  border: none;
  border-radius: 8px;
  background: white;
}

.pdf-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.guide-text {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.guide-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.guide-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.guide-content {
  flex: 1;
}

.guide-content strong {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.guide-content ol,
.guide-content p {
  margin: 0;
  padding-left: 20px;
  color: #555;
  line-height: 1.8;
}

.guide-item.wechat .guide-content {
  background: #07c160;
  color: white;
  padding: 12px;
  border-radius: 8px;
}

.guide-item.wechat .guide-content strong {
  color: white;
}

.guide-item.wechat .guide-content ol {
  color: white;
}

.action-buttons {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.action-buttons button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e8e8e8;
}

.btn-tertiary {
  background: none;
  color: #666;
}

.btn-tertiary:hover {
  background: #f0f0f0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .export-preview-dialog {
    width: 100%;
    max-width: none;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
  
  .action-buttons button {
    min-width: calc(50% - 6px);
  }
}
</style>
```

### 3.4 打印样式优化

**文件**: `src/style.css`（追加）

```css
/* ===== 打印样式优化 ===== */

/* 基础打印设置 */
@page {
  size: A4;
  margin: 12mm;
  
  /* 页眉页脚 */
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

/* 打印时的全局设置 */
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  body {
    background: white !important;
    font-size: 12pt;
    line-height: 1.6;
  }
  
  /* 隐藏非打印元素 */
  .config-panel,
  .action-bar,
  .header-actions,
  .nav-header,
  .back-btn,
  button {
    display: none !important;
  }
  
  /* 打印头部 */
  .print-root {
    max-width: 100%;
    margin: 0;
    padding: 0;
  }
  
  /* 题目网格 */
  .problems-grid {
    display: grid;
    grid-template-columns: repeat(var(--print-columns, 3), 1fr);
    gap: 12px 20px;
    page-break-inside: avoid;
  }
  
  /* 题目项 */
  .problem-item {
    page-break-inside: avoid;
    break-inside: avoid;
    border: 1px solid #ddd;
    padding: 8px;
    min-height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  /* 答案页 */
  .answer-grid {
    display: grid;
    grid-template-columns: repeat(var(--print-columns, 3), 1fr);
    gap: 12px 20px;
  }
  
  .answer-item {
    page-break-inside: avoid;
  }
  
  /* 防止孤行 */
  p,
  .problem-item {
    orphans: 3;
    widows: 3;
  }
  
  /* 标题样式 */
  h1, h2, h3 {
    page-break-after: avoid;
  }
  
  /* 图片优化 */
  img {
    max-width: 100% !important;
    page-break-inside: avoid;
  }
}

/* 高 DPI 打印 */
@media print and (-webkit-min-device-pixel-ratio: 2) {
  body {
    -webkit-font-smoothing: antialiased;
  }
}

/* 彩色打印优化 */
@media print {
  .problem-item {
    border: 1px solid #333;
  }
  
  .worksheet-header {
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
}

/* 墨水节省模式（可选）*/
@media print and (prefers-color-scheme: light) {
  body {
    background: white !important;
    color: black !important;
  }
}
```

### 3.5 配置项扩展

**文件**: `src/composables/useProblemGenerator.js` 或配置文件

在现有配置中添加导出相关选项：

```javascript
const config = ref({
  // ... 现有配置 ...
  
  // 导出配置（新增）
  export: {
    pdf: {
      quality: 'highest',        // highest | balanced | low
      columns: 3,                // 2 | 3 | 4
      includeAnswer: false,      // 是否包含答案
      compress: true
    },
    image: {
      quality: 'high',           // high | medium | low
      scale: 2.5,                // 自动计算：devicePixelRatio * scale
      format: 'png'              // png | jpeg
    }
  }
})
```

---

## 4. 数据流

### 4.1 正常流程（桌面端 PDF）

```
用户点击"导出"
  ↓
detectEnv() → { platform: 'desktop', features: { print: true, download: true } }
  ↓
smartExport() → 选择 PDF 模式
  ↓
useEnhancedPdfExport.exportPdf()
  ↓
html2canvas 截图
  ↓
jsPDF 生成 PDF Blob
  ↓
showPreview('pdf', { blob, filename })
  ↓
用户操作：
  ├─ 点击"下载 PDF" → downloadBlob()
  ├─ 点击"打印" → window.print()
  └─ 点击"关闭" → closePreview()
```

### 4.2 微信浏览器流程

```
用户点击"导出"
  ↓
detectEnv() → { platform: 'mobile', browser: 'wechat' }
  ↓
smartExport() → 选择图片模式
  ↓
useEnhancedImageExport.exportAsImage()
  ↓
html2canvas 截图（scale: 2.5）
  ↓
生成 PNG Blob
  ↓
showPreview('image', { blob, filename })
  ↓
用户操作：
  ├─ 长按图片 → 保存到相册
  ├─ 点击"分享" → navigator.share()（如果支持）
  └─ 点击"关闭" → closePreview()
```

### 4.3 降级流程（PDF 失败）

```
用户点击"导出"（桌面端）
  ↓
smartExport() → 选择 PDF 模式
  ↓
try { exportAsPdf() } 
  ↓
catch (错误 || 超时 30s)
  ↓
warning('PDF 导出失败', '正在尝试图片模式...')
  ↓
exportAsImage()
  ↓
showPreview('image', { blob, filename })
```

---

## 5. 错误处理

### 5.1 错误类型与处理策略

| 错误场景 | 检测方式 | 处理策略 |
|---------|---------|---------|
| PDF 生成超时 | Promise.race 超时 | 降级图片模式，提示用户 |
| html2canvas 失败 | try-catch | 提示手动截图，提供帮助链接 |
| 内存不足 | catch 错误信息 | 降低 scale，提示关闭其他标签 |
| 下载被拦截 | download 失败 | 显示预览，提示右键保存 |
| 分享失败 | navigator.share reject | 降级为保存图片 |
| 微信环境不支持 | UA 检测 | 直接走图片模式，不显示下载按钮 |

### 5.2 错误消息设计

```javascript
// 错误消息模板
const ERROR_MESSAGES = {
  pdfTimeout: {
    title: 'PDF 生成超时',
    message: '题目太多，PDF 生成时间过长。已自动切换为图片模式。',
    action: '查看图片'
  },
  canvasFailed: {
    title: '生成失败',
    message: '浏览器内存不足，请尝试：\n1. 减少题目数量\n2. 关闭其他标签页\n3. 刷新页面后重试',
    action: '好的'
  },
  downloadBlocked: {
    title: '下载被拦截',
    message: '浏览器拦截了下载，请右键点击图片选择"图片另存为"',
    action: '我知道了'
  },
  shareFailed: {
    title: '分享失败',
    message: '分享功能不可用，请手动保存图片后分享',
    action: '好的'
  }
}
```

---

## 6. 测试策略

### 6.1 设备测试矩阵

| 设备/浏览器 | PDF 导出 | 图片导出 | 打印 | 分享 | 状态 |
|-----------|---------|---------|------|------|------|
| 微信（iOS） | ❌ N/A | ✅ | ❌ N/A | ⚠️ 部分 | 待测 |
| 微信（Android） | ❌ N/A | ✅ | ❌ N/A | ⚠️ 部分 | 待测 |
| UC 浏览器 | ❌ 可能失败 | ✅ | ⚠️ 不稳定 | ❌ | 待测 |
| QQ 浏览器 | ❌ 可能失败 | ✅ | ⚠️ 不稳定 | ❌ | 待测 |
| Chrome Android | ✅ | ✅ | ❌ | ⚠️ | 待测 |
| Safari iOS | ✅ | ✅ | ✅ | ✅ | 待测 |
| Chrome Desktop | ✅ | ✅ | ✅ | ✅ | 待测 |
| Edge Desktop | ✅ | ✅ | ✅ | ✅ | 待测 |

### 6.2 场景测试

#### 必须测试场景

- [ ] **微信核心流程**
  - [ ] 在微信中打开应用
  - [ ] 生成题目并点击"导出"
  - [ ] 图片正常显示
  - [ ] 长按图片可保存
  - [ ] 保存后图片清晰

- [ ] **移动端降级流程**
  - [ ] Android Chrome 生成图片
  - [ ] 图片自动下载（如果支持）
  - [ ] 下载失败显示预览
  - [ ] 长按保存成功

- [ ] **桌面端 PDF 流程**
  - [ ] 生成 PDF 成功
  - [ ] PDF 可下载
  - [ ] PDF 打印正常
  - [ ] 排版正确（2/3/4 列）

- [ ] **PDF 降级流程**
  - [ ] 强制 PDF 失败（网络错误）
  - [ ] 自动降级图片
  - [ ] 提示用户

- [ ] **错误处理**
  - [ ] 超时处理（30s 超时）
  - [ ] 内存不足提示
  - [ ] 下载被拦截处理

### 6.3 兼容性测试工具

```bash
# 使用 BrowserStack 或类似工具
# 测试平台：iOS Safari, Android Chrome, WeChat, UC, QQ
```

---

## 7. 性能优化

### 7.1 图片优化

- **scale 动态调整**: 根据 `devicePixelRatio` 和设备性能调整
- **压缩**: PNG 压缩、JPEG 质量调节
- **懒加载**: 仅生成当前题目集的图片

### 7.2 PDF 优化

- **分块渲染**: 题目过多时分页渲染
- **字体子集化**: 仅嵌入使用的中文字符
- **压缩**: PDF 压缩选项

### 7.3 内存管理

- **及时释放**: 预览关闭时释放 Blob URL
- **超时控制**: PDF 生成超过 30s 则降级
- **错误边界**: 捕获内存不足错误

---

## 8. 用户界面设计

### 8.1 移动端流程

```
点击"导出" → 提示"正在生成..." → 图片预览弹窗 → 长按保存指南 → 用户长按保存
   ↑                                                              ↓
   └──────────────── 保存成功，关闭弹窗 ← 保存到相册 ←─────────┘
```

### 8.2 桌面端流程

```
点击"导出" → 生成 PDF → PDF 预览弹窗 → 下载/打印/关闭
   ↑         ↑        ↓
   └─────────┴── PDF失败 → 降级图片 → 图片预览 → 下载/分享/关闭
```

### 8.3 按钮文案

| 场景 | 按钮文案 |
|------|---------|
| 微信导出中 | "正在生成图片..." |
| 移动端导出中 | "正在生成图片..." |
| 桌面端 PDF 导出中 | "正在生成 PDF..." |
| 微信预览引导 | "长按图片保存到相册" |
| 桌面预览引导 | "右键图片另存为" |
| 微信分享成功 | "分享成功" |
| 下载成功 | "已保存到相册/下载文件夹" |

---

## 9. 后续规划

### 9.1 第一阶段（MVP，本周）

- ✅ 环境检测模块
- ✅ 微信/移动端图片预览
- ✅ 基础降级逻辑
- ✅ 预览弹窗组件

### 9.2 第二阶段（优化，下周）

- [ ] 打印样式优化
- [ ] 自定义列数配置
- [ ] PDF 质量提升
- [ ] 全面的兼容性测试

### 9.3 第三阶段（增强，未来）

- [ ] 微信 JS-SDK 深度集成（可选）
- [ ] 云打印支持
- [ ] 批量导出
- [ ] 历史记录导出

---

## 10. 技术债务

### 当前已知问题

1. **html2canvas 中文渲染**: 部分特殊字符可能乱码
2. **PDF 文件过大**: 未压缩，可能需要优化
3. **打印样式不统一**: 不同浏览器打印差异大
4. **移动端内存限制**: 题目过多（>50题）可能导致崩溃

### 优化优先级

| 问题 | 优先级 | 难度 | 预计时间 |
|------|--------|------|---------|
| 微信兼容性 | 🔴 高 | 🟢 简单 | 1 天 |
| 移动端降级 | 🔴 高 | 🟢 简单 | 1 天 |
| 打印样式 | 🟡 中 | 🟡 中等 | 2 天 |
| PDF 质量 | 🟡 中 | 🟡 中等 | 2 天 |
| 性能优化 | 🟢 低 | 🔴 复杂 | 3 天 |

---

## 11. 总结

### 核心改进点

1. ✅ **环境检测**: 自动识别微信/移动端/桌面端
2. ✅ **智能降级**: PDF 失败自动转图片
3. ✅ **图片预览**: 移动端弹窗 + 长按引导
4. ✅ **打印优化**: 更好的 CSS print 样式
5. ✅ **自定义布局**: 2/3/4 列可选
6. ✅ **错误处理**: 完善的错误提示和恢复

### 预期效果

- ✅ 微信浏览器：可正常导出和分享
- ✅ Android 手机：全功能可用
- ✅ 桌面端：高质量 PDF + 打印
- ✅ 用户体验：清晰的操作引导
- ✅ 兼容性：覆盖 95%+ 用户环境

---

**文档状态**: ✅ 设计完成，等待审查  
**下一步**: 编写实现计划
