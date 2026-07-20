import { describe, it, expect } from 'vitest'
import { EXPORT_ERRORS, getExportError } from './exportErrors.js'

describe('exportErrors', () => {
  describe('EXPORT_ERRORS constants', () => {
    it('should have pdfTimeout error', () => {
      expect(EXPORT_ERRORS.pdfTimeout).toBeDefined()
      expect(EXPORT_ERRORS.pdfTimeout.title).toBe('PDF 生成超时')
      expect(EXPORT_ERRORS.pdfTimeout.message).toContain('PDF 生成时间过长')
      expect(EXPORT_ERRORS.pdfTimeout.action).toBe('查看图片')
    })

    it('should have canvasFailed error', () => {
      expect(EXPORT_ERRORS.canvasFailed).toBeDefined()
      expect(EXPORT_ERRORS.canvasFailed.title).toBe('生成失败')
      expect(EXPORT_ERRORS.canvasFailed.message).toContain('内存不足')
      expect(EXPORT_ERRORS.canvasFailed.action).toBe('好的')
    })

    it('should have downloadBlocked error', () => {
      expect(EXPORT_ERRORS.downloadBlocked).toBeDefined()
      expect(EXPORT_ERRORS.downloadBlocked.title).toBe('下载被拦截')
      expect(EXPORT_ERRORS.downloadBlocked.message).toContain('拦截了下载')
      expect(EXPORT_ERRORS.downloadBlocked.action).toBe('我知道了')
    })

    it('should have shareFailed error', () => {
      expect(EXPORT_ERRORS.shareFailed).toBeDefined()
      expect(EXPORT_ERRORS.shareFailed.title).toBe('分享失败')
      expect(EXPORT_ERRORS.shareFailed.message).toContain('分享功能不可用')
      expect(EXPORT_ERRORS.shareFailed.action).toBe('好的')
    })

    it('should have memoryError error', () => {
      expect(EXPORT_ERRORS.memoryError).toBeDefined()
      expect(EXPORT_ERRORS.memoryError.title).toBe('内存不足')
      expect(EXPORT_ERRORS.memoryError.message).toContain('减少题目数量')
      expect(EXPORT_ERRORS.memoryError.action).toBe('好的')
    })

    it('should have crossOrigin error', () => {
      expect(EXPORT_ERRORS.crossOrigin).toBeDefined()
      expect(EXPORT_ERRORS.crossOrigin.title).toBe('跨域图片限制')
      expect(EXPORT_ERRORS.crossOrigin.message).toContain('跨域')
      expect(EXPORT_ERRORS.crossOrigin.action).toBe('好的')
    })

    it('should have unknown error', () => {
      expect(EXPORT_ERRORS.unknown).toBeDefined()
      expect(EXPORT_ERRORS.unknown.title).toBe('导出失败')
      expect(EXPORT_ERRORS.unknown.message).toContain('未知错误')
      expect(EXPORT_ERRORS.unknown.action).toBe('好的')
    })
  })

  describe('getExportError', () => {
    it('should return unknown error for null input', () => {
      expect(getExportError(null)).toEqual(EXPORT_ERRORS.unknown)
    })

    it('should return unknown error for undefined input', () => {
      expect(getExportError(undefined)).toEqual(EXPORT_ERRORS.unknown)
    })

    it('should return pdfTimeout for timeout errors', () => {
      const error = new Error('PDF 生成超时')
      expect(getExportError(error)).toEqual(EXPORT_ERRORS.pdfTimeout)
    })

    it('should return memoryError for memory errors', () => {
      const error = new Error('memory limit exceeded')
      expect(getExportError(error)).toEqual(EXPORT_ERRORS.memoryError)
    })

    it('should return memoryError for Chinese memory error', () => {
      const error = new Error('内存不足')
      expect(getExportError(error)).toEqual(EXPORT_ERRORS.memoryError)
    })

    it('should return memoryError for code 12', () => {
      const error = new Error('Some error')
      error.code = 12
      expect(getExportError(error)).toEqual(EXPORT_ERRORS.memoryError)
    })

    it('should return crossOrigin for tainted errors', () => {
      const error = new Error('tainted canvas')
      expect(getExportError(error)).toEqual(EXPORT_ERRORS.crossOrigin)
    })

    it('should return crossOrigin for SecurityError', () => {
      const error = new Error('SecurityError: Cross-site request')
      expect(getExportError(error)).toEqual(EXPORT_ERRORS.crossOrigin)
    })

    it('should return crossOrigin for Chinese cross-origin error', () => {
      const error = new Error('跨域限制了导出功能')
      expect(getExportError(error)).toEqual(EXPORT_ERRORS.crossOrigin)
    })

    it('should return canvasFailed for canvas errors', () => {
      const error = new Error('canvas rendering failed')
      expect(getExportError(error)).toEqual(EXPORT_ERRORS.canvasFailed)
    })

    it('should return canvasFailed for generation failure', () => {
      const error = new Error('图片生成失败')
      expect(getExportError(error)).toEqual(EXPORT_ERRORS.canvasFailed)
    })

    it('should return unknown for unrecognized errors', () => {
      const error = new Error('some random error')
      expect(getExportError(error)).toEqual(EXPORT_ERRORS.unknown)
    })
  })
})
