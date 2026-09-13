import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseSelect from './BaseSelect.vue'

const sampleOptions = [
  { value: '2', label: '2 列(宽松)' },
  { value: '3', label: '3 列(标准)' },
  { value: '4', label: '4 列(紧凑)' },
]

describe('BaseSelect', () => {
  it('渲染为 select 元素', () => {
    const wrapper = mount(BaseSelect, { props: { options: sampleOptions } })
    expect(wrapper.element.tagName).toBe('SELECT')
  })

  it('根据 options 渲染对应 <option>', () => {
    const wrapper = mount(BaseSelect, { props: { options: sampleOptions } })
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(3)
    expect(options[0].text()).toBe('2 列(宽松)')
    expect(options[0].attributes('value')).toBe('2')
  })

  it('change 触发 update:modelValue 事件', async () => {
    const wrapper = mount(BaseSelect, {
      props: { modelValue: '3', options: sampleOptions }
    })
    await wrapper.setValue('4')
    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeTruthy()
    expect(events[events.length - 1]).toEqual(['4'])
  })

  it('disabled 时不可选择', () => {
    const wrapper = mount(BaseSelect, {
      props: { options: sampleOptions, disabled: true }
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
