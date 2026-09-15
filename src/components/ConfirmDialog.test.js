import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from './ConfirmDialog.vue'

function makeWrapper(props = {}) {
  return mount(ConfirmDialog, {
    props: { message: '确定要执行此操作吗？', ...props },
    attachTo: document.body,
  })
}

describe('ConfirmDialog', () => {
  it('modelValue 为 false 时不渲染对话框', () => {
    const wrapper = makeWrapper({ modelValue: false })
    expect(document.body.querySelector('.fixed.inset-0')).toBeNull()
    wrapper.unmount()
  })

  it('modelValue 为 true 时渲染 title 和 message', async () => {
    const wrapper = makeWrapper({
      modelValue: true,
      title: '删除记录',
      message: '确定删除这份试卷吗？',
    })
    await wrapper.vm.$nextTick()
    const text = document.body.textContent
    expect(text).toContain('删除记录')
    expect(text).toContain('确定删除这份试卷吗？')
    wrapper.unmount()
  })

  it('点击确认按钮触发 confirm 与 update:modelValue(false)', async () => {
    const wrapper = makeWrapper({
      modelValue: true,
      title: '删除记录',
      confirmText: '删除',
    })
    await wrapper.vm.$nextTick()
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const confirmBtn = buttons.find((b) => b.textContent.trim() === '删除')
    expect(confirmBtn).toBeTruthy()
    confirmBtn.click()
    await wrapper.vm.$nextTick()
    const events = wrapper.emitted()
    expect(events.confirm).toBeTruthy()
    expect(events['update:modelValue']).toBeTruthy()
    expect(events['update:modelValue'][0]).toEqual([false])
    wrapper.unmount()
  })

  it('点击取消按钮触发 cancel 与 update:modelValue(false)', async () => {
    const wrapper = makeWrapper({ modelValue: true })
    await wrapper.vm.$nextTick()
    const cancelBtn = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent.trim() === '取消',
    )
    expect(cancelBtn).toBeTruthy()
    cancelBtn.click()
    await wrapper.vm.$nextTick()
    const events = wrapper.emitted()
    expect(events.cancel).toBeTruthy()
    expect(events['update:modelValue'][0]).toEqual([false])
    wrapper.unmount()
  })

  it('点击遮罩触发 update:modelValue(false) 而非 confirm', async () => {
    const wrapper = makeWrapper({ modelValue: true })
    await wrapper.vm.$nextTick()
    const backdrop = document.body.querySelector('.fixed.inset-0')
    expect(backdrop).toBeTruthy()
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    const events = wrapper.emitted()
    expect(events.confirm).toBeFalsy()
    expect(events['update:modelValue'][0]).toEqual([false])
    wrapper.unmount()
  })

  it('默认 confirmText 为 "确认"，默认 title 为 "确认"', () => {
    const wrapper = makeWrapper({ modelValue: true })
    const html = document.body.innerHTML
    expect(html).toContain('确认')
    wrapper.unmount()
  })
})

describe('ConfirmDialog v-model integration (回归)', () => {
  it('父组件用 v-model 绑定时不产生 Vue 警告', async () => {
    const warnings = []
    const originalWarn = console.warn
    console.warn = (...args) => {
      warnings.push(args.join(' '))
      originalWarn(...args)
    }
    const Parent = {
      components: { ConfirmDialog },
      template: `
        <ConfirmDialog
          v-model="visible"
          title="删除记录"
          message="确定删除这份试卷吗？此操作无法撤销。"
          confirm-text="删除"
          @confirm="onConfirm"
        />
      `,
      data: () => ({ visible: true }),
      methods: {
        onConfirm() {},
      },
    }
    const wrapper = mount(Parent, { attachTo: document.body })
    await wrapper.vm.$nextTick()
    console.warn = originalWarn
    const offending = warnings.filter((w) => /Extraneous non-props|modelValue/i.test(w))
    expect(offending).toEqual([])
    wrapper.unmount()
  })
})
