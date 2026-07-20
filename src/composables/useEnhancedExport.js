import { ref } from 'vue'
import { usePdfExport } from './usePdfExport'
import { usePrint } from './usePrint'
import { useToast } from './useToast'
import { useExportEnv } from './useExportEnv'

export function useEnhancedExport() {
  const { exportPdfWithTimeout } = usePdfExport()
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
        info('正在生成图片', '微信环境使用图片模式')
        await exportAsImage(config)
        return
      }

      // 桌面端：优先 PDF
      if (env.value.platform === 'desktop') {
        try {
          info('正在生成 PDF', '桌面端优先使用 PDF 模式')
          await exportAsPdf(config)
          return
        } catch (err) {
          warning('PDF 导出失败', '正在尝试图片模式...')
          await exportAsImage(config)
          return
        }
      }

      // 其他移动端：图片模式
      info('正在生成图片', '移动端使用图片模式')
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
    const filename = buildFilename(config)

    try {
      // 使用带超时控制的 PDF 导出
      const blob = await exportPdfWithTimeout(config.element, filename, 30000)

      // 成功：展示预览
      const url = URL.createObjectURL(blob)
      showPreview('pdf', { url, filename, blob })
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
