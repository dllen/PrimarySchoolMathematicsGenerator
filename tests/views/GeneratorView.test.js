import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'

// Hoist 纯数据(非 ref),hoisted 代码先于 vue 导入执行
const {
  mockSmartExport,
  mockGenerate,
  bpState,
} = vi.hoisted(() => ({
  mockSmartExport: vi.fn(),
  mockGenerate: vi.fn(),
  // 用普通对象存断点状态,工厂内包装为 ref / computed
  bpState: { width: 1200 },
}))

vi.mock('../../src/composables/useProblemGenerator.js', () => ({
  useProblemGenerator: () => ({
    generate: (...args) => mockGenerate(...args),
  }),
}))

vi.mock('../../src/composables/useEnhancedExport.js', () => ({
  useEnhancedExport: () => ({
    smartExport: (...args) => mockSmartExport(...args),
    exporting: ref(false),
    previewVisible: ref(false),
    previewType: ref(''),
    previewData: ref(null),
    env: ref({ platform: 'desktop', browser: 'chrome', features: {} }),
    showPreview: vi.fn(),
    closePreview: vi.fn(),
    saveImage: vi.fn(),
    shareImage: vi.fn(),
    downloadPdf: vi.fn(),
    handlePrint: vi.fn(),
  }),
}))

// 在工厂内把 bpState.width 包成 ref / computed,实现可读写的断点 mock
vi.mock('../../src/composables/useBreakpoint.js', () => {
  return {
    useBreakpoint: () => {
      const windowWidth = ref(bpState.width)
      const isMobile = computed(() => windowWidth.value <= 639)
      const isTablet = computed(
        () => windowWidth.value > 639 && windowWidth.value <= 1023
      )
      const isDesktop = computed(() => windowWidth.value > 1023)
      // 暴露 setter 给测试
      isMobile.value = isMobile.value
      isTablet.value = isTablet.value
      isDesktop.value = isDesktop.value
      return { windowWidth, isMobile, isTablet, isDesktop }
    },
  }
})

vi.mock('../../src/composables/useToast.js', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    showToast: vi.fn(),
    removeToast: vi.fn(),
    clearAll: vi.fn(),
    toasts: ref([]),
  }),
}))

vi.mock('../../src/db.js', () => ({
  addProblemSet: vi.fn(() => Promise.resolve(1)),
  getHistory: vi.fn(() => Promise.resolve([])),
  db: { problems: { toArray: vi.fn(() => Promise.resolve([])) } },
}))

vi.mock(import('../../src/constants/presets.js'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    deleteCustomPreset: vi.fn(() => true),
  }
})

import GeneratorView from '../../src/views/GeneratorView.vue'

describe('GeneratorView', () => {
  beforeEach(() => {
    mockSmartExport.mockReset()
    mockGenerate.mockReset()
    bpState.width = 1200 // 默认 desktop
  })

  it('使用 useBreakpoint 暴露 isMobile / isDesktop 替换 UA 嗅探', () => {
    const wrapper = mount(GeneratorView, {
      global: {
        mocks: { $router: { push: vi.fn() } },
      },
    })
    expect(wrapper.vm.isMobile).toBe(false)
    expect(wrapper.vm.isDesktop).toBe(true)
  })

  it('isMobile=true 时 useBreakpoint.isMobile 为 true', () => {
    bpState.width = 500
    const wrapper = mount(GeneratorView, {
      global: { mocks: { $router: { push: vi.fn() } } },
    })
    expect(wrapper.vm.isMobile).toBe(true)
    expect(wrapper.vm.isDesktop).toBe(false)
  })

  it('isMobile=true 时年级卡片网格使用 2 列(grid-cols-2)', () => {
    bpState.width = 500
    const wrapper = mount(GeneratorView, {
      global: { mocks: { $router: { push: vi.fn() } } },
    })
    expect(wrapper.html()).toMatch(/grid-cols-2/)
  })

  it('handleExport 调用 smartExport 并传入 AbortSignal options', async () => {
    const wrapper = mount(GeneratorView, {
      global: { mocks: { $router: { push: vi.fn() } } },
    })
    wrapper.vm.printRoot = document.createElement('div')
    await wrapper.vm.handleExport()

    expect(mockSmartExport).toHaveBeenCalledTimes(1)
    const call = mockSmartExport.mock.calls[0]
    expect(call[0].element).toBeDefined()
    expect(call[1]).toEqual(
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
  })

  it('组件卸载时 abort 挂起的导出 signal', async () => {
    const wrapper = mount(GeneratorView, {
      global: { mocks: { $router: { push: vi.fn() } } },
    })
    wrapper.vm.printRoot = document.createElement('div')
    await wrapper.vm.handleExport()

    const signal = mockSmartExport.mock.calls[0][1].signal
    expect(signal.aborted).toBe(false)

    wrapper.unmount()
    expect(signal.aborted).toBe(true)
  })

  it('handleExport 应用 --print-columns CSS 变量(config.export.pdfColumns)', async () => {
    const wrapper = mount(GeneratorView, {
      global: { mocks: { $router: { push: vi.fn() } } },
    })
    wrapper.vm.printRoot = document.createElement('div')
    wrapper.vm.config.export.pdfColumns = 4
    await wrapper.vm.handleExport()
    expect(
      document.documentElement.style.getPropertyValue('--print-columns')
    ).toBe('4')
  })
})
