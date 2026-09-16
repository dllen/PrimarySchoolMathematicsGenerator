import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { nextTick } from 'vue'
import HistoryView from './HistoryView.vue'
import { db } from '../db.js'

// Dexie uses setImmediate/MessageChannel for transactions, not microtasks,
// so flushPromises() doesn't wait for it. This helper bridges the gap.
const tick = () => new Promise((r) => setTimeout(r, 0))
const waitDexie = async () => {
  await flushPromises()
  await nextTick()
  await tick()
  await nextTick()
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: { template: '<div/>' } },
    { path: '/workbench', component: { template: '<div/>' } },
    { path: '/history', component: { template: '<div/>' } },
    { path: '/history/:id', component: { template: '<div/>' } },
  ],
})

async function seedHistory(n) {
  await db.problemSets.clear()
  for (let i = 0; i < n; i++) {
    await db.problemSets.add({
      timestamp: `2026-09-15 10:0${i}:00`,
      config: {
        problemCount: 10 + i,
        grade: '3',
        semester: '上',
        operations: { add: true, subtract: false, multiply: false, divide: false },
        difficulty: 'medium',
      },
      problems: [{ id: `p${i}`, question: `${i}+1`, answer: `${i + 1}` }],
    })
  }
}

async function mountView() {
  await router.push('/history')
  await router.isReady()
  const wrapper = mount(HistoryView, {
    global: { plugins: [router] },
    attachTo: document.body,
  })
  await flushPromises()
  return wrapper
}

describe('HistoryView 批量删除', () => {
  beforeEach(async () => {
    await db.problemSets.clear()
  })

  it('默认不显示选择模式控件', async () => {
    await seedHistory(3)
    const wrapper = await mountView()
    expect(wrapper.find('[data-test="enter-batch"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="exit-batch"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="delete-selected"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-test="row-checkbox"]').length).toBe(0)
    wrapper.unmount()
  })

  it('点击"批量删除"进入选择模式并显示每行复选框', async () => {
    await seedHistory(3)
    const wrapper = await mountView()
    await wrapper.find('[data-test="enter-batch"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-test="exit-batch"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="delete-selected"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-test="row-checkbox"]').length).toBe(3)
    // 初始选择数为 0
    expect(wrapper.find('[data-test="delete-selected"]').text()).toContain('(0)')
    wrapper.unmount()
  })

  it('勾选/取消勾选切换选中状态', async () => {
    await seedHistory(3)
    const wrapper = await mountView()
    await wrapper.find('[data-test="enter-batch"]').trigger('click')
    await nextTick()
    const checkboxes = wrapper.findAll('[data-test="row-checkbox"] input')
    await checkboxes[0].setValue(true)
    await checkboxes[1].setValue(true)
    await nextTick()
    expect(wrapper.find('[data-test="delete-selected"]').text()).toContain('(2)')
    await checkboxes[0].setValue(false)
    await nextTick()
    expect(wrapper.find('[data-test="delete-selected"]').text()).toContain('(1)')
    wrapper.unmount()
  })

  it('"全选"按钮一键选中全部，再点切回"全不选"', async () => {
    await seedHistory(4)
    const wrapper = await mountView()
    await wrapper.find('[data-test="enter-batch"]').trigger('click')
    await nextTick()
    const toggleAll = wrapper.find('[data-test="toggle-all"]')
    expect(toggleAll.text()).toContain('全选')
    await toggleAll.trigger('click')
    await nextTick()
    expect(wrapper.find('[data-test="delete-selected"]').text()).toContain('(4)')
    expect(wrapper.find('[data-test="toggle-all"]').text()).toContain('全不选')
    await wrapper.find('[data-test="toggle-all"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-test="delete-selected"]').text()).toContain('(0)')
    wrapper.unmount()
  })

  it('点击"取消"退出选择模式并清空已选', async () => {
    await seedHistory(2)
    const wrapper = await mountView()
    await wrapper.find('[data-test="enter-batch"]').trigger('click')
    await nextTick()
    await wrapper.findAll('[data-test="row-checkbox"] input')[0].setValue(true)
    await nextTick()
    await wrapper.find('[data-test="exit-batch"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-test="enter-batch"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="exit-batch"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-test="row-checkbox"]').length).toBe(0)
    wrapper.unmount()
  })

  it('空选择时"删除选中"按钮被禁用', async () => {
    await seedHistory(2)
    const wrapper = await mountView()
    await wrapper.find('[data-test="enter-batch"]').trigger('click')
    await nextTick()
    const btn = wrapper.find('[data-test="delete-selected"]')
    expect(btn.attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('点击"删除选中"弹出确认对话框，消息含数量', async () => {
    await seedHistory(5)
    const wrapper = await mountView()
    await wrapper.find('[data-test="enter-batch"]').trigger('click')
    await nextTick()
    const checkboxes = wrapper.findAll('[data-test="row-checkbox"] input')
    await checkboxes[0].setValue(true)
    await checkboxes[1].setValue(true)
    await checkboxes[2].setValue(true)
    await nextTick()
    await wrapper.find('[data-test="delete-selected"]').trigger('click')
    await nextTick()
    // ConfirmDialog 渲染到 body
    const dialogText = document.body.textContent
    expect(dialogText).toContain('此操作无法撤销')
    expect(dialogText).toMatch(/确定删除 3 份试卷/)
    wrapper.unmount()
  })

  it('确认后批量删除所选记录并退出选择模式', async () => {
    await seedHistory(5)
    const wrapper = await mountView()
    await wrapper.find('[data-test="enter-batch"]').trigger('click')
    await nextTick()
    const checkboxes = wrapper.findAll('[data-test="row-checkbox"] input')
    await checkboxes[0].setValue(true)
    await checkboxes[1].setValue(true)
    await nextTick()
    await wrapper.find('[data-test="delete-selected"]').trigger('click')
    await nextTick()
    // 点击 ConfirmDialog 的确认按钮
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const confirmBtn = buttons.find((b) => b.textContent.trim() === '删除')
    expect(confirmBtn).toBeTruthy()
    // 通过 ConfirmDialog 的 $emit 触发 confirm（更可靠，绕过 BaseButton DOM 中转）
    wrapper.findComponent({ name: 'ConfirmDialog' }).vm.$emit('confirm')
    // 等待异步链:bulkDelete -> loadHistory -> exitSelectionMode 全部完成
    // 直接轮询 selectionMode,避免依赖 Vue 内部时序
    const deadline = Date.now() + 2000
    while (wrapper.vm.selectionMode !== false && Date.now() < deadline) {
      await waitDexie()
    }
    // DB 应只剩 3 条
    expect(await db.problemSets.count()).toBe(3)
    // 视图应退出选择模式（通过 setup 暴露的 ref 验证，避免 DOM 时序问题）
    expect(wrapper.vm.selectionMode).toBe(false)
    expect(wrapper.vm.history.length).toBe(3)
    wrapper.unmount()
  })

  it('单条删除仍然走原路径（不进入选择模式）', async () => {
    await seedHistory(2)
    const wrapper = await mountView()
    // 找到"删除"按钮（非批量入口）并点击
    const delBtn = wrapper.findAll('button').find((b) => b.text().trim() === '删除')
    expect(delBtn).toBeTruthy()
    await delBtn.trigger('click')
    await nextTick()
    const dialogText = document.body.textContent
    expect(dialogText).toContain('此操作无法撤销')
    expect(dialogText).toContain('这份试卷')  // 单条："这份试卷"
    expect(dialogText).not.toMatch(/\d+ 份试卷/)  // 不应出现 "N 份试卷"
    // 确认
    wrapper.findComponent({ name: 'ConfirmDialog' }).vm.$emit('confirm')
    await waitDexie()
    expect(await db.problemSets.count()).toBe(1)
    // 不应进入选择模式
    expect(wrapper.vm.selectionMode).toBe(false)
    expect(wrapper.vm.history.length).toBe(1)
    wrapper.unmount()
  })
})
