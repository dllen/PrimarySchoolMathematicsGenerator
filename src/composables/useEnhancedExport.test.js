import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'

// Mock html2canvas-pro
vi.mock('html2canvas-pro', () => ({
  default: vi.fn(() =>
    Promise.resolve({
      toBlob: (callback) => {
        callback(new Blob(['mock'], { type: 'image/png' }))
      }
    })
  )
}))

// Mock useExportEnv
vi.mock('./useExportEnv', () => ({
  useExportEnv: () => ({
    env: ref({
      platform: 'desktop',
      browser: 'chrome',
      features: {
        download: true,
        print: true,
        share: true,
        clipboard: true,
        fileSaver: false
      }
    })
  })
}))

// Mock useToast
const mockToastWarnings = []
const mockToastSuccess = []

vi.mock('./useToast', () => ({
  useToast: () => ({
    success: vi.fn((msg, detail) => mockToastSuccess.push({ msg, detail })),
    error: vi.fn(),
    warning: vi.fn((msg, detail) => mockToastWarnings.push({ msg, detail })),
    info: vi.fn()
  })
}))

// Mock usePrint
vi.mock('./usePrint', () => ({
  usePrint: () => ({ print: vi.fn() })
}))

// Mock usePdfExport
vi.mock('./usePdfExport', () => ({
  usePdfExport: () => ({
    exportPdf: vi.fn(),
    exportPdfWithTimeout: vi.fn(),
    buildFilename: vi.fn((config) => {
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')
      const gradeLabel = `${config.grade}年级${config.semester || ''}`
      return `数学练习题_${gradeLabel}_${yyyy}-${mm}-${dd}.pdf`
    })
  })
}))

import { useEnhancedExport } from './useEnhancedExport'

describe('useEnhancedExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToastWarnings.length = 0
    mockToastSuccess.length = 0
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { exporting, previewVisible, previewType, previewData } = useEnhancedExport()

      expect(exporting.value).toBe(false)
      expect(previewVisible.value).toBe(false)
      expect(previewType.value).toBe('')
      expect(previewData.value).toBeNull()
    })

    it('should expose env from useExportEnv', () => {
      const { env } = useEnhancedExport()
      expect(env.value).toBeDefined()
      expect(env.value.platform).toBe('desktop')
      expect(env.value.browser).toBe('chrome')
    })

    it('should expose all required functions', () => {
      const {
        smartExport,
        exportAsPdf,
        exportAsImage,
        showPreview,
        closePreview,
        saveImage,
        shareImage,
        downloadPdf,
        handlePrint
      } = useEnhancedExport()

      expect(smartExport).toBeDefined()
      expect(exportAsPdf).toBeDefined()
      expect(exportAsImage).toBeDefined()
      expect(showPreview).toBeDefined()
      expect(closePreview).toBeDefined()
      expect(saveImage).toBeDefined()
      expect(shareImage).toBeDefined()
      expect(downloadPdf).toBeDefined()
      expect(handlePrint).toBeDefined()
    })
  })

  describe('showPreview', () => {
    it('should set preview state correctly', () => {
      const { showPreview, previewVisible, previewType, previewData } = useEnhancedExport()

      showPreview('image', { url: 'blob:test', filename: 'test.png', blob: new Blob() })

      expect(previewVisible.value).toBe(true)
      expect(previewType.value).toBe('image')
      expect(previewData.value).toEqual({
        url: 'blob:test',
        filename: 'test.png',
        blob: expect.any(Blob)
      })
    })

    it('should handle PDF preview type', () => {
      const { showPreview, previewType } = useEnhancedExport()

      showPreview('pdf', { url: 'blob:test', filename: 'test.pdf', blob: new Blob() })

      expect(previewType.value).toBe('pdf')
    })
  })

  describe('closePreview', () => {
    it('should reset preview state', () => {
      const { showPreview, closePreview, previewVisible, previewData } = useEnhancedExport()

      showPreview('image', { url: 'blob:test', filename: 'test.png', blob: new Blob() })
      expect(previewVisible.value).toBe(true)

      closePreview()

      expect(previewVisible.value).toBe(false)
      expect(previewData.value).toBeNull()
    })

    it('should release blob URL when closing preview', () => {
      const { showPreview, closePreview } = useEnhancedExport()

      showPreview('image', { url: 'blob:test', filename: 'test.png', blob: new Blob() })
      closePreview()

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test')
    })

    it('should handle close without url', () => {
      const { showPreview, closePreview } = useEnhancedExport()

      // Should not throw when previewData has no url
      showPreview('image', { filename: 'test.png', blob: new Blob() })
      expect(() => closePreview()).not.toThrow()
    })
  })

  describe('shareImage', () => {
    it('should share image using navigator.share', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined)
      global.navigator.share = mockShare

      const { showPreview, shareImage } = useEnhancedExport()
      const mockBlob = new Blob(['image'], { type: 'image/png' })

      showPreview('image', {
        blob: mockBlob,
        filename: 'test.png'
      })

      await shareImage()

      expect(mockShare).toHaveBeenCalledWith({
        files: [expect.any(File)],
        title: '数学练习题',
        text: '分享数学练习题'
      })
    })

    it('should handle share abort gracefully', async () => {
      const mockShare = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'))
      global.navigator.share = mockShare

      const { showPreview, shareImage } = useEnhancedExport()

      showPreview('image', {
        blob: new Blob(['image'], { type: 'image/png' }),
        filename: 'test.png'
      })

      // Should not throw
      await expect(shareImage()).resolves.toBeUndefined()
    })
  })

  describe('downloadPdf', () => {
    it('should download PDF file', () => {
      const { downloadPdf, showPreview } = useEnhancedExport()

      showPreview('pdf', {
        url: 'blob:test',
        filename: 'test.pdf'
      })

      // Mock the a element creation for download
      const mockA = document.createElement('a')
      vi.spyOn(document, 'createElement').mockReturnValue(mockA)

      downloadPdf()

      expect(mockA.href).toBe('blob:test')
      expect(mockA.download).toBe('test.pdf')
    })
  })

  describe('smartExport', () => {
    it('should set exporting state during export', async () => {
      const { smartExport, exporting } = useEnhancedExport()

      const promise = smartExport({
        element: document.createElement('div'),
        grade: 3
      })

      // exporting should be true during the operation
      expect(exporting.value).toBe(true)

      await promise
      expect(exporting.value).toBe(false)
    })
  })

  describe('saveImage', () => {
    it('should handle saveImage call without throwing', async () => {
      const { saveImage, showPreview } = useEnhancedExport()

      showPreview('image', {
        url: 'blob:test',
        blob: new Blob(['image'], { type: 'image/png' }),
        filename: 'test.png'
      })

      // Should not throw
      expect(() => saveImage()).not.toThrow()
    })
  })
})

// 在 vi.mock 工厂外预先创建 mock 函数,使各测试可通过引用配置返回值
const {
  mockExportPdfWithTimeout,
  mockExportPdf,
} = vi.hoisted(() => ({
  mockExportPdfWithTimeout: vi.fn(),
  mockExportPdf: vi.fn(),
}))

// 覆盖文件顶部对 usePdfExport 的 mock,使 exportPdfWithTimeout / exportPdf
// 指向各测试可独立配置的 vi.fn()
vi.mock('./usePdfExport', () => ({
  usePdfExport: () => ({
    exportPdf: mockExportPdf,
    exportPdfWithTimeout: mockExportPdfWithTimeout,
    buildFilename: vi.fn(({ grade, semester }) =>
      `数学练习题_${grade}年级${semester || ''}.pdf`
    ),
  }),
}))

describe('AbortSignal support', () => {
  beforeEach(() => {
    mockExportPdfWithTimeout.mockReset()
    mockExportPdf.mockReset()
  })

  it('smartExport 接受 options 并把 signal 透传给 exportPdfWithTimeout', async () => {
    const { useEnhancedExport } = await import('./useEnhancedExport.js')
    const { smartExport } = useEnhancedExport()

    const controller = new AbortController()
    mockExportPdfWithTimeout.mockResolvedValue(
      new Blob(['mock'], { type: 'application/pdf' })
    )

    await smartExport(
      { element: document.createElement('div'), grade: 3, semester: '上' },
      { signal: controller.signal }
    )

    expect(mockExportPdfWithTimeout).toHaveBeenCalledTimes(1)
    const opts = mockExportPdfWithTimeout.mock.calls[0][2]
    expect(opts.signal).toBe(controller.signal)
  })

  it('smartExport 在调用前已 abort 时直接返回,不调用 exportPdfWithTimeout', async () => {
    const { useEnhancedExport } = await import('./useEnhancedExport.js')
    const { smartExport, exporting } = useEnhancedExport()

    const controller = new AbortController()
    controller.abort()

    await smartExport(
      { element: document.createElement('div'), grade: 3 },
      { signal: controller.signal }
    )

    expect(mockExportPdfWithTimeout).not.toHaveBeenCalled()
    expect(exporting.value).toBe(false)
  })

  it('exportAsPdf 把 signal + timeoutMs 透传给 exportPdfWithTimeout', async () => {
    const { useEnhancedExport } = await import('./useEnhancedExport.js')
    const { exportAsPdf } = useEnhancedExport()

    const controller = new AbortController()
    mockExportPdfWithTimeout.mockResolvedValue(
      new Blob(['mock'], { type: 'application/pdf' })
    )

    await exportAsPdf(
      { element: document.createElement('div'), grade: 3, semester: '上' },
      { signal: controller.signal, timeoutMs: 5000 }
    )

    expect(mockExportPdfWithTimeout).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.stringContaining('数学练习题'),
      expect.objectContaining({ signal: controller.signal, timeoutMs: 5000 })
    )
  })

  it('exportAsPdf 透传 abort 错误并不再触发降级', async () => {
    const { useEnhancedExport } = await import('./useEnhancedExport.js')
    const { exportAsPdf } = useEnhancedExport()

    const controller = new AbortController()
    const abortError = new Error('PDF 导出已取消')
    abortError.name = 'AbortError'
    mockExportPdfWithTimeout.mockImplementation((_el, _fn, opts) => {
      expect(opts.signal).toBe(controller.signal)
      return Promise.reject(abortError)
    })

    await expect(
      exportAsPdf(
        { element: document.createElement('div'), grade: 3 },
        { signal: controller.signal }
      )
    ).rejects.toThrow('PDF 导出已取消')
  })
})
