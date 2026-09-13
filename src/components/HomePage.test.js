import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from './HomePage.vue'
import { BaseButton } from './base'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/generator', component: { template: '<div/>' } },
    { path: '/workbench', component: { template: '<div/>' } },
  ],
})

describe('HomePage(极简引导页)', () => {
  it('渲染大标题', () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('为你的孩子')
    expect(wrapper.text()).toContain('定制一份数学练习')
  })

  it('渲染副标题描述', () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('可打印的练习题')
  })

  it('用 BaseButton(ember lg) 渲染"开始 →"按钮', () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    const buttons = wrapper.findAllComponents(BaseButton)
    expect(buttons).toHaveLength(1)
    expect(buttons[0].props('variant')).toBe('ember')
    expect(buttons[0].props('size')).toBe('lg')
    expect(buttons[0].text()).toContain('开始')
  })

  it('点击按钮跳转到 /generator(当前可用路由,Task 9 统一改 workbench)', async () => {
    const push = vi.spyOn(router, 'push')
    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    const btn = wrapper.findComponent(BaseButton)
    await btn.trigger('click')
    expect(push).toHaveBeenCalledWith('/generator')
  })

  it('a11y: 标题层级唯一(只有一个 <h1>)', () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    expect(wrapper.findAll('h1')).toHaveLength(1)
  })

  it('布局: max-w-narrow + 居中容器类', () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    // 内容容器应包含 max-w-narrow + text-center
    const html = wrapper.html()
    expect(html).toMatch(/max-w-narrow/)
    expect(html).toMatch(/text-center/)
  })
})
