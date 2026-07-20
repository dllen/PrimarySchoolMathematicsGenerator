import { ref } from 'vue'
import { usePdfExport } from './usePdfExport'
import { usePrint } from './usePrint'
import { useToast } from './useToast'
import { useExportEnv } from './useExportEnv'
import { EXPORT_ERRORS, getExportError } from '../constants/exportErrors.js'

export function useEnhancedExport() {
  const { exportPdf, exportPdfWithTimeout } = usePdfExport()
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
    if (!config?.element) {
      error('导出失败', '未找到要导出的内容')
      return
    }

    exporting.value = true

    try {
      // 微信浏览器
      if (env.value.browser === 'wechat') {
        info('正在生成图片', '请稍候...')
        await exportAsImage(config)
        return
      }

      // 移动端
      if (env.value.platform === 'mobile') {
        info('正在生成图片', '请稍候...')
        await exportAsImage(config)
        return
      }

      // 桌面端：优先 PDF
      if (env.value.platform === 'desktop') {
        try {
          info('正在生成 PDF', '请稍候...')
          await exportAsPdf(config)
          return
        } catch (err) {
          const errorInfo = getExportError(err)
          warning(errorInfo.title, errorInfo.message)
          info('正在切换到图片模式', '请稍候...')
          await exportAsImage(config)
          return
        }
      }

      // 默认：图片模式
      await exportAsImage(config)

    } catch (err) {
      const errorInfo = getExportError(err)
      console.error('Export error:', err)
      error(errorInfo.title, errorInfo.message)
    } finally {
      exporting.value = false
    }
  }

  /**
   * 导出为 PDF（桌面端优先）
   */
  async function exportAsPdf(config) {
    const { config: pdfConfig = {} } = config
    const filename = buildFilename(pdfConfig)

    // 超时控制
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('PDF 生成超时，请重试'))
      }, 30000)
    })

    const exportPromise = exportPdf(config.element, filename)

    try {
      const blob = await Promise.race([exportPromise, timeoutPromise])

      const url = URL.createObjectURL(blob)
      showPreview('pdf', { url, filename, blob })
      success('PDF 生成成功', filename)

    } catch (err) {
      const errorInfo = getExportError(err)
      console.error('PDF export failed:', err)
      throw new Error(errorInfo.message)
    }
  }

  /**
   * 导出为图片（移动端/微信优先）
   */
  async function exportAsImage(config) {
    try {
      const { element } = config
      const html2canvas = (await import('html2canvas-pro')).default

      // 根据环境调整 scale
      const isMobileEnv = env.value.platform === 'mobile'
      const scale = isMobileEnv
        ? Math.min(window.devicePixelRatio * 2.5, 3)
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
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('图片生成失败'))
            }
          },
          'image/png',
          0.95
        )
      })

      const filename = buildImageFilename(config.config || {})
      const url = URL.createObjectURL(blob)

      // 显示预览
      if (isMobileEnv || env.value.browser === 'wechat') {
        showPreview('image', { url, filename, blob })
        info('图片已生成', '请长按图片保存到相册')
      } else {
        try {
          downloadBlob(blob, filename)
          success('图片已保存', filename)
        } catch (err) {
          showPreview('image', { url, filename, blob })
          warning('下载失败', '请使用预览保存')
        }
      }
    } catch (err) {
      // 获取错误信息
      const errorInfo = getExportError(err)

      // 内存不足检测
      if (err.message.includes('memory') || err.code === 12) {
        error(errorInfo.title, errorInfo.message)
        return
      }

      // 跨域图片限制
      if (err.message.includes('tainted') || err.message.includes('SecurityError')) {
        error(errorInfo.title, errorInfo.message)
        return
      }

      // 其他错误
      console.error('Image export failed:', err)
      error(errorInfo.title, errorInfo.message)
      throw err
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
