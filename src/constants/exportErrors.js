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
}

/**
 * 根据错误获取对应的错误消息
 * @param {Error} error - 错误对象
 * @returns {Object} 错误消息对象
 */
export function getExportError(error) {
  if (!error) {
    return EXPORT_ERRORS.unknown
  }

  const message = error.message || ''

  // 超时错误
  if (message.includes('超时')) {
    return EXPORT_ERRORS.pdfTimeout
  }

  // 内存不足
  if (message.includes('memory') || message.includes('内存') || error.code === 12) {
    return EXPORT_ERRORS.memoryError
  }

  // 跨域错误
  if (message.includes('tainted') || message.includes('SecurityError') || message.includes('跨域')) {
    return EXPORT_ERRORS.crossOrigin
  }

  // Canvas 失败
  if (message.includes('canvas') || message.includes('生成失败')) {
    return EXPORT_ERRORS.canvasFailed
  }

  // 默认未知错误
  return EXPORT_ERRORS.unknown
}
