import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuestionTypePicker from './QuestionTypePicker.vue'

describe('QuestionTypePicker', () => {
  function makeWrapper(value = ['arithmetic']) {
    return mount(QuestionTypePicker, {
      props: { modelValue: value },
    })
  }

  it('渲染三个题型按钮（算术/应用/奥数）', () => {
    const wrapper = makeWrapper(['arithmetic'])
    const buttons = wrapper.findAll('button[type="button"]')
    expect(buttons).toHaveLength(3)
    const labels = buttons.map((b) => b.find('.type-btn__label').text())
    expect(labels).toEqual(['算术', '应用', '奥数'])
  })

  it('已选中的按钮带有 aria-pressed=true', () => {
    const wrapper = makeWrapper(['arithmetic', 'olympiad'])
    const buttons = wrapper.findAll('button[type="button"]')
    expect(buttons[0].attributes('aria-pressed')).toBe('true')   // 算术
    expect(buttons[1].attributes('aria-pressed')).toBe('false')  // 应用
    expect(buttons[2].attributes('aria-pressed')).toBe('true')   // 奥数
  })

  it('未选中时不显示多选提示', () => {
    const wrapper = makeWrapper(['arithmetic'])
    expect(wrapper.text()).not.toContain('已选')
  })

  it('选中多项时显示多选提示', () => {
    const wrapper = makeWrapper(['arithmetic', 'application'])
    expect(wrapper.text()).toContain('已选 2 项')
  })

  it('点击未选中的按钮会发射 update:modelValue 追加该项', async () => {
    const wrapper = makeWrapper(['arithmetic'])
    await wrapper.find('[data-value="application"]').trigger('click')
    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeTruthy()
    expect(events[0][0]).toEqual(['arithmetic', 'application'])
  })

  it('点击已选中的按钮会发射 update:modelValue 移除该项', async () => {
    const wrapper = makeWrapper(['arithmetic', 'application'])
    await wrapper.find('[data-value="arithmetic"]').trigger('click')
    const events = wrapper.emitted('update:modelValue')
    expect(events[0][0]).toEqual(['application'])
  })

  it('发射的数组保持 PICKER_TYPES 中声明的稳定顺序', async () => {
    // 父组件传入乱序值，点击切换后仍按 算术/应用/奥数 输出
    const wrapper = makeWrapper(['olympiad'])
    await wrapper.find('[data-value="arithmetic"]').trigger('click')
    const events = wrapper.emitted('update:modelValue')
    expect(events[0][0]).toEqual(['arithmetic', 'olympiad'])
  })

  it('a11y: 按钮组有 role=group 与 aria-label', () => {
    const wrapper = makeWrapper(['arithmetic'])
    const group = wrapper.find('[role="group"]')
    expect(group.exists()).toBe(true)
    expect(group.attributes('aria-label')).toBeTruthy()
  })
})
