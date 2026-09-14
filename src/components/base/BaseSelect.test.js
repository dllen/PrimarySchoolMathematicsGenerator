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

  it('未传 options 时回落到默认 slot 中的 <option>', () => {
    const wrapper = mount(BaseSelect, {
      props: { modelValue: 2 },
      slots: {
        default: `
          <option value="2">2项</option>
          <option value="3">3项</option>
          <option value="4">4项</option>
        `,
      },
    })
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(3)
    expect(options[1].text()).toBe('3项')
    expect(options[1].attributes('value')).toBe('3')
  })

  it(':options 数组优先于 slot 内容(配置驱动)', () => {
    const wrapper = mount(BaseSelect, {
      props: { options: [{ value: 'a', label: 'From Prop' }] },
      slots: { default: '<option value="b">From Slot</option>' },
    })
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(1)
    expect(options[0].text()).toBe('From Prop')
  })
})
