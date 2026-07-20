import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ExportPreview from './ExportPreview.vue'

describe('ExportPreview', () => {
  const mockImagePreviewData = {
    url: 'data:image/png;base64,test-image-data',
    filename: 'test.png',
    blob: new Blob(['test'], { type: 'image/png' })
  }

  const mockPdfPreviewData = {
    url: 'data:application/pdf;base64,test-pdf-data',
    filename: 'test.pdf',
    blob: new Blob(['test'], { type: 'application/pdf' })
  }

  const mockDesktopEnv = {
    platform: 'desktop',
    browser: 'chrome',
    features: {
      download: true,
      print: true,
      share: true,
      clipboard: true,
      fileSaver: false
    }
  }

  const mockMobileEnv = {
    platform: 'mobile',
    browser: 'mobile',
    features: {
      download: true,
      print: false,
      share: true,
      clipboard: true,
      fileSaver: false
    }
  }

  const mockWechatEnv = {
    platform: 'mobile',
    browser: 'wechat',
    features: {
      download: true,
      print: false,
      share: false,
      clipboard: true,
      fileSaver: false
    }
  }

  describe('渲染', () => {
    it('当 visible=true 时应该渲染组件', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockDesktopEnv
        }
      })

      expect(wrapper.find('.export-preview-overlay').exists()).toBe(true)
      expect(wrapper.find('.export-preview-dialog').exists()).toBe(true)
    })

    it('当 visible=false 时不应该渲染组件', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: false,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockDesktopEnv
        }
      })

      expect(wrapper.find('.export-preview-overlay').exists()).toBe(false)
    })

    it('应该显示正确的标题', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockDesktopEnv
        }
      })

      expect(wrapper.find('h3').text()).toContain('图片已生成')
    })

    it('PDF 类型应该显示 "PDF 已生成" 标题', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'pdf',
          previewData: mockPdfPreviewData,
          env: mockDesktopEnv
        }
      })

      expect(wrapper.find('h3').text()).toContain('PDF 已生成')
    })
  })

  describe('微信用户引导', () => {
    it('微信环境应该显示特殊的绿色引导', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockWechatEnv
        }
      })

      const guideItem = wrapper.find('.guide-item.wechat')
      expect(guideItem.exists()).toBe(true)
      expect(guideItem.find('strong').text()).toContain('微信用户操作指南')
      expect(guideItem.find('ol').exists()).toBe(true)
    })

    it('微信引导应该包含保存步骤', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockWechatEnv
        }
      })

      const guideText = wrapper.find('.guide-item.wechat').text()
      expect(guideText).toContain('长按上方图片')
      expect(guideText).toContain('保存到相册')
      expect(guideText).toContain('转发给老师')
    })
  })

  describe('移动端引导', () => {
    it('非微信移动端应该显示移动端引导', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockMobileEnv
        }
      })

      const guideItem = wrapper.find('.guide-item.mobile')
      expect(guideItem.exists()).toBe(true)
      expect(guideItem.text()).toContain('长按上方图片保存到相册')
    })
  })

  describe('桌面端引导', () => {
    it('桌面端应该显示桌面端引导', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockDesktopEnv
        }
      })

      const guideItem = wrapper.find('.guide-item.desktop')
      expect(guideItem.exists()).toBe(true)
      expect(guideItem.text()).toContain('右键')
      expect(guideItem.text()).toContain('图片另存为')
    })
  })

  describe('图片预览', () => {
    it('图片类型应该显示 img 标签', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockDesktopEnv
        }
      })

      expect(wrapper.find('img').exists()).toBe(true)
      expect(wrapper.find('img').attributes('src')).toBe(mockImagePreviewData.url)
    })

    it('图片类型不应该显示 iframe', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockDesktopEnv
        }
      })

      expect(wrapper.find('iframe').exists()).toBe(false)
    })
  })

  describe('PDF 预览', () => {
    it('PDF 类型应该显示 iframe', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'pdf',
          previewData: mockPdfPreviewData,
          env: mockDesktopEnv
        }
      })

      expect(wrapper.find('iframe').exists()).toBe(true)
      expect(wrapper.find('iframe').attributes('src')).toBe(mockPdfPreviewData.url)
    })

    it('PDF 类型不应该显示 img 标签', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'pdf',
          previewData: mockPdfPreviewData,
          env: mockDesktopEnv
        }
      })

      expect(wrapper.find('img').exists()).toBe(false)
    })
  })

  describe('操作按钮', () => {
    it('点击关闭按钮应该触发 close 事件', async () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockDesktopEnv
        }
      })

      await wrapper.find('.close-btn').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('点击遮罩应该触发 close 事件', async () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockDesktopEnv
        }
      })

      await wrapper.find('.export-preview-overlay').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('桌面端图片应该显示"保存图片"按钮', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockDesktopEnv
        }
      })

      const saveButton = wrapper.find('button.btn-primary')
      expect(saveButton.exists()).toBe(true)
      expect(saveButton.text()).toContain('保存图片')
    })

    it('移动端图片不应该显示"保存图片"按钮', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockMobileEnv
        }
      })

      const saveButton = wrapper.find('button.btn-primary')
      expect(saveButton.exists()).toBe(false)
    })

    it('图片类型应该显示"分享"按钮（如果支持）', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockDesktopEnv
        }
      })

      const shareButton = wrapper.find('button.btn-secondary')
      expect(shareButton.exists()).toBe(true)
      expect(shareButton.text()).toContain('分享')
    })

    it('点击"分享"按钮应该触发 share 事件', async () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockDesktopEnv
        }
      })

      await wrapper.find('button.btn-secondary').trigger('click')
      expect(wrapper.emitted('share')).toBeTruthy()
      expect(wrapper.emitted('share')).toHaveLength(1)
    })

    it('PDF 类型应该显示"下载 PDF"按钮', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'pdf',
          previewData: mockPdfPreviewData,
          env: mockDesktopEnv
        }
      })

      const downloadButton = wrapper.find('button.btn-primary')
      expect(downloadButton.exists()).toBe(true)
      expect(downloadButton.text()).toContain('下载 PDF')
    })

    it('PDF 类型应该显示"打印"按钮（如果支持）', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'pdf',
          previewData: mockPdfPreviewData,
          env: mockDesktopEnv
        }
      })

      const printButton = wrapper.find('button.btn-secondary')
      expect(printButton.exists()).toBe(true)
      expect(printButton.text()).toContain('打印')
    })

    it('点击"下载 PDF"按钮应该触发 download-pdf 事件', async () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'pdf',
          previewData: mockPdfPreviewData,
          env: mockDesktopEnv
        }
      })

      await wrapper.find('button.btn-primary').trigger('click')
      expect(wrapper.emitted('download-pdf')).toBeTruthy()
      expect(wrapper.emitted('download-pdf')).toHaveLength(1)
    })

    it('点击"打印"按钮应该触发 print 事件', async () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'pdf',
          previewData: mockPdfPreviewData,
          env: mockDesktopEnv
        }
      })

      await wrapper.find('button.btn-secondary').trigger('click')
      expect(wrapper.emitted('print')).toBeTruthy()
      expect(wrapper.emitted('print')).toHaveLength(1)
    })

    it('所有类型都应该显示"关闭"按钮', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockDesktopEnv
        }
      })

      const closeButton = wrapper.find('button.btn-tertiary')
      expect(closeButton.exists()).toBe(true)
      expect(closeButton.text()).toBe('关闭')
    })

    it('不显示分享按钮时应该只有两个按钮', () => {
      const envWithoutShare = {
        ...mockDesktopEnv,
        features: { ...mockDesktopEnv.features, share: false }
      }

      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: envWithoutShare
        }
      })

      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(3) // 关闭 x2 + 保存图片
    })
  })

  describe('响应式设计', () => {
    it('应该有关闭按钮', () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockDesktopEnv
        }
      })

      expect(wrapper.find('.close-btn').exists()).toBe(true)
    })
  })

  describe('事件处理', () => {
    it('应该正确触发所有事件', async () => {
      const wrapper = mount(ExportPreview, {
        props: {
          visible: true,
          type: 'image',
          previewData: mockImagePreviewData,
          env: mockDesktopEnv
        }
      })

      // 触发关闭事件
      await wrapper.find('.close-btn').trigger('click')
      expect(wrapper.emitted('close')).toHaveLength(1)

      // 触发保存事件
      await wrapper.find('button.btn-primary').trigger('click')
      expect(wrapper.emitted('save')).toHaveLength(1)

      // 触发分享事件
      await wrapper.find('button.btn-secondary').trigger('click')
      expect(wrapper.emitted('share')).toHaveLength(1)
    })
  })
})
