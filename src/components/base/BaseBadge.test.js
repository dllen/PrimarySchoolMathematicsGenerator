import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseBadge from './BaseBadge.vue'

describe('BaseBadge', () => {
  it('渲染 slot 内容', () => {
    const wrapper = mount(BaseBadge, { slots: { default: 'NEW' } })
    expect(wrapper.text()).toBe('NEW')
  })

  it('默认 variant=soft 应用浅色背景类', () => {
    const wrapper = mount(BaseBadge)
    expect(wrapper.classes().join(' ')).toMatch(/rule-softer|ink-muted/)
  })

  it('variant=ember 应用暖橙背景类', () => {
    const wrapper = mount(BaseBadge, { props: { variant: 'ember' } })
    expect(wrapper.classes().join(' ')).toMatch(/ember/)
  })

  it('variant=ink 应用深色背景类', () => {
    const wrapper = mount(BaseBadge, { props: { variant: 'ink' } })
    expect(wrapper.classes().join(' ')).toMatch(/ink-deep/)
  })

  it('使用 span 元素(行内语义)', () => {
    const wrapper = mount(BaseBadge)
    expect(wrapper.element.tagName).toBe('SPAN')
  })
})
