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
})
