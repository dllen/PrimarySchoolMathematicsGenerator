import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseCard from './BaseCard.vue'

describe('BaseCard', () => {
  it('渲染 slot 内容', () => {
    const wrapper = mount(BaseCard, { slots: { default: '<p>卡片内容</p>' } })
    expect(wrapper.text()).toBe('卡片内容')
  })

  it('默认 variant=paper 应用 paper 背景 + 边框 + 阴影', () => {
    const wrapper = mount(BaseCard)
    expect(wrapper.classes().join(' ')).toMatch(/paper-card/)
    expect(wrapper.classes().join(' ')).toMatch(/border/)
    expect(wrapper.classes().join(' ')).toMatch(/shadow/)
  })

  it('variant=outline 仅边框无背景', () => {
    const wrapper = mount(BaseCard, { props: { variant: 'outline' } })
    expect(wrapper.classes().join(' ')).toMatch(/border/)
    expect(wrapper.classes().join(' ')).not.toMatch(/paper-card/)
  })

  it('interactive=true 时含 cursor-pointer + hover 效果类', () => {
    const wrapper = mount(BaseCard, { props: { interactive: true } })
    expect(wrapper.classes().join(' ')).toMatch(/cursor-pointer/)
    expect(wrapper.classes().join(' ')).toMatch(/hover:/)
  })

  it('selected=true 时含 ember 描边', () => {
    const wrapper = mount(BaseCard, { props: { selected: true } })
    expect(wrapper.classes().join(' ')).toMatch(/ring-ember/)
  })
})
