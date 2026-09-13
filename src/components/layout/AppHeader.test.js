import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import AppHeader from './AppHeader.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: { template: '<div/>' } },
    { path: '/workbench', component: { template: '<div/>' } },
    { path: '/history', component: { template: '<div/>' } },
    { path: '/about', component: { template: '<div/>' } },
  ],
})

describe('AppHeader', () => {
  beforeEach(async () => {
    await router.replace('/')
  })

  it('渲染 logo 文字', () => {
    const wrapper = mount(AppHeader, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('数学习题')
  })

  it('桌面端渲染 4 个导航链接(用 [data-test="nav-link"] 标记)', () => {
    global.innerWidth = 1200
    const wrapper = mount(AppHeader, { global: { plugins: [router] } })
    const links = wrapper.findAll('[data-test="nav-link"]')
    expect(links.length).toBe(4)
  })

  it('移动端(<768px) 渲染汉堡按钮', () => {
    global.innerWidth = 500
    const wrapper = mount(AppHeader, { global: { plugins: [router] } })
    const burger = wrapper.find('[aria-label="打开菜单"]')
    expect(burger.exists()).toBe(true)
  })

  it('点击汉堡触发 open-menu 事件', async () => {
    global.innerWidth = 500
    const wrapper = mount(AppHeader, { global: { plugins: [router] } })
    await wrapper.find('[aria-label="打开菜单"]').trigger('click')
    expect(wrapper.emitted('open-menu')).toBeTruthy()
  })

  it('a11y: 汉堡按钮为 <button> 元素且含 aria-label', () => {
    global.innerWidth = 500
    const wrapper = mount(AppHeader, { global: { plugins: [router] } })
    const burger = wrapper.find('[aria-label="打开菜单"]')
    expect(burger.element.tagName).toBe('BUTTON')
  })
})
