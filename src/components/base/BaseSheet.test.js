import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseSheet from './BaseSheet.vue'

describe('BaseSheet', () => {
  it('默认不渲染(closed)', () => {
    const wrapper = mount(BaseSheet, {
      props: { modelValue: false },
      slots: { default: '<p>面板内容</p>' }
    })
    expect(wrapper.find('[role], div').exists()).toBe(false)
    // Teleport 把内容传送到 body,所以 wrapper 内部不直接含 sheet DOM
    expect(document.body.querySelector('.bg-paper-card')).toBeNull()
  })

  it('modelValue=true 时渲染并 Teleport 到 body', async () => {
    const wrapper = mount(BaseSheet, {
      props: { modelValue: true },
      attachTo: document.body,
      slots: { default: '<p>面板内容</p>' }
    })
    // Teleport 渲染时,slot 内容应当在 document.body 中
    expect(document.body.textContent).toContain('面板内容')
    wrapper.unmount()
  })

  it('点击遮罩 (self) 触发 update:modelValue=false', async () => {
    const wrapper = mount(BaseSheet, {
      props: { modelValue: true },
      attachTo: document.body,
      slots: { default: '<p>x</p>' }
    })
    const overlay = document.body.querySelector('.fixed.inset-0')
    expect(overlay).toBeTruthy()
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeTruthy()
    expect(events[events.length - 1]).toEqual([false])
    wrapper.unmount()
  })
})
