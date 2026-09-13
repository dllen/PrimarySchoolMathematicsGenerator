import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from './BaseButton.vue'

describe('BaseButton', () => {
  it('渲染 slot 内容', () => {
    const wrapper = mount(BaseButton, { slots: { default: '生成' } })
    expect(wrapper.text()).toBe('生成')
  })

  it('点击触发 click 事件', async () => {
    const wrapper = mount(BaseButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('variant=ember 应用暖橙背景', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'ember' },
    })
    expect(wrapper.classes().join(' ')).toMatch(/ember|accent/i)
  })

  it('variant=ink 应用深棕背景', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'ink' },
    })
    expect(wrapper.classes().join(' ')).toMatch(/ink|deep/i)
  })

  it('disabled 状态下不触发 click', async () => {
    const wrapper = mount(BaseButton, { props: { disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  // === (f) a11y + snapshot 补充 ===

  it('a11y: disabled 时设置原生 disabled 属性', () => {
    const wrapper = mount(BaseButton, { props: { disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    // aria-disabled 应当同步设置以便屏幕阅读器识别
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('a11y: 非 disabled 时 aria-disabled=false 且无原生 disabled', () => {
    const wrapper = mount(BaseButton)
    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(wrapper.attributes('aria-disabled')).toBe('false')
  })

  it('默认 type=button(避免意外触发表单 submit)', () => {
    const wrapper = mount(BaseButton)
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('block=true 时含 w-full 类(满宽)', () => {
    const wrapper = mount(BaseButton, { props: { block: true } })
    expect(wrapper.classes()).toContain('w-full')
  })

  it('size=sm 应用较小内边距类', () => {
    const wrapper = mount(BaseButton, { props: { size: 'sm' } })
    expect(wrapper.classes().join(' ')).toMatch(/text-sm/)
  })

  it('size=lg 应用较大尺寸类与最小高度', () => {
    const wrapper = mount(BaseButton, { props: { size: 'lg' } })
    expect(wrapper.classes().join(' ')).toMatch(/min-h-\[48px\]/)
  })

  it('snapshot: 默认变体类结构稳定', () => {
    const wrapper = mount(BaseButton, { slots: { default: '导出' } })
    expect(wrapper.classes().sort()).toEqual(
      expect.arrayContaining([
        'inline-flex',
        'items-center',
        'justify-center',
        'gap-2',
        'bg-ink-deep',
        'text-paper',
        'rounded-md',
        'min-h-[44px]',
      ])
    )
  })
})
