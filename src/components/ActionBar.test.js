import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionBar from './ActionBar.vue'
import { BaseButton } from './base'

describe('ActionBar', () => {
  it('渲染三个 BaseButton 按钮(生成 / 导出 / 历史)', () => {
    const wrapper = mount(ActionBar, {
      props: { problems: [] },
    })
    expect(wrapper.findAllComponents(BaseButton)).toHaveLength(3)
  })

  it('点"生成"按钮触发 generate 事件', async () => {
    const wrapper = mount(ActionBar, { props: { problems: [] } })
    const buttons = wrapper.findAllComponents(BaseButton)
    await buttons[0].trigger('click')
    expect(wrapper.emitted('generate')).toBeTruthy()
  })

  it('点"导出"按钮触发 export 事件', async () => {
    const wrapper = mount(ActionBar, { props: { problems: [{ id: 1 }] } })
    const buttons = wrapper.findAllComponents(BaseButton)
    await buttons[1].trigger('click')
    expect(wrapper.emitted('export')).toBeTruthy()
  })

  it('点"查看历史"按钮触发 show-history 事件', async () => {
    const wrapper = mount(ActionBar, { props: { problems: [] } })
    const buttons = wrapper.findAllComponents(BaseButton)
    await buttons[2].trigger('click')
    expect(wrapper.emitted('show-history')).toBeTruthy()
  })

  it('导出按钮在 problems 为空时 disabled', () => {
    const wrapper = mount(ActionBar, { props: { problems: [] } })
    const buttons = wrapper.findAllComponents(BaseButton)
    // 第 2 个按钮是导出 (索引 1)
    expect(buttons[1].props('disabled')).toBe(true)
  })

  it('导出按钮在 problems.length > 0 时可用', () => {
    const wrapper = mount(ActionBar, { props: { problems: [{ id: 1 }] } })
    const buttons = wrapper.findAllComponents(BaseButton)
    expect(buttons[1].props('disabled')).toBe(false)
  })

  it('导出按钮在 exporting=true 时显示"生成中..."且 disabled', () => {
    const wrapper = mount(ActionBar, {
      props: { problems: [{ id: 1 }], exporting: true },
    })
    const buttons = wrapper.findAllComponents(BaseButton)
    const exportBtn = buttons[1]
    expect(exportBtn.props('disabled')).toBe(true)
    expect(exportBtn.text()).toContain('生成中')
  })

  it('导出按钮在 exporting=false 时显示"导出"', () => {
    const wrapper = mount(ActionBar, {
      props: { problems: [{ id: 1 }], exporting: false },
    })
    const buttons = wrapper.findAllComponents(BaseButton)
    expect(buttons[1].text()).toContain('导出')
  })

  it('a11y: 禁用按钮设置 aria-disabled=true', () => {
    const wrapper = mount(ActionBar, { props: { problems: [] } })
    const buttons = wrapper.findAllComponents(BaseButton)
    const exportBtn = buttons[1].find('button')
    expect(exportBtn.attributes('aria-disabled')).toBe('true')
  })
})
