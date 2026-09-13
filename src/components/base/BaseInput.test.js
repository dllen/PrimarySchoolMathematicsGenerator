import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseInput from './BaseInput.vue'

describe('BaseInput', () => {
  it('渲染为 input 元素', () => {
    const wrapper = mount(BaseInput)
    expect(wrapper.element.tagName).toBe('INPUT')
  })

  it('默认 type=text', () => {
    const wrapper = mount(BaseInput)
    expect(wrapper.attributes('type')).toBe('text')
  })

  it('支持 type=number 等', () => {
    const wrapper = mount(BaseInput, { props: { type: 'number' } })
    expect(wrapper.attributes('type')).toBe('number')
  })

  it('输入触发 update:modelValue 事件并传新值', async () => {
    const wrapper = mount(BaseInput, { props: { modelValue: '' } })
    await wrapper.setValue('hello')
    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeTruthy()
    expect(events[events.length - 1]).toEqual(['hello'])
  })

  it('disabled 时不可输入', () => {
    const wrapper = mount(BaseInput, { props: { disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('渲染 placeholder', () => {
    const wrapper = mount(BaseInput, { props: { placeholder: '请输入' } })
    expect(wrapper.attributes('placeholder')).toBe('请输入')
  })
})
