import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseTabs from './BaseTabs.vue'

const sampleTabs = [
  { value: 'generate', label: '生成题目' },
  { value: 'history', label: '历史记录' },
  { value: 'preset', label: '预设' },
]

describe('BaseTabs', () => {
  it('根据 tabs 渲染对应按钮', () => {
    const wrapper = mount(BaseTabs, {
      props: { modelValue: 'generate', tabs: sampleTabs }
    })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].text()).toBe('生成题目')
    expect(buttons[1].text()).toBe('历史记录')
  })

  it('当前 tab 应用 aria-selected=true', () => {
    const wrapper = mount(BaseTabs, {
      props: { modelValue: 'history', tabs: sampleTabs }
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('aria-selected')).toBe('false')
    expect(buttons[1].attributes('aria-selected')).toBe('true')
    expect(buttons[2].attributes('aria-selected')).toBe('false')
  })

  it('role=tablist 容器', () => {
    const wrapper = mount(BaseTabs, {
      props: { modelValue: 'generate', tabs: sampleTabs }
    })
    expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
  })

  it('role=tab 按钮', () => {
    const wrapper = mount(BaseTabs, {
      props: { modelValue: 'generate', tabs: sampleTabs }
    })
    const buttons = wrapper.findAll('[role="tab"]')
    expect(buttons).toHaveLength(3)
  })

  it('点击非当前 tab 触发 update:modelValue', async () => {
    const wrapper = mount(BaseTabs, {
      props: { modelValue: 'generate', tabs: sampleTabs }
    })
    await wrapper.findAll('button')[2].trigger('click')
    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeTruthy()
    expect(events[0]).toEqual(['preset'])
  })
})
