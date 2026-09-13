import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GradeCard from './GradeCard.vue'

describe('GradeCard', () => {
  it('渲染年级标签 + 主题', () => {
    const wrapper = mount(GradeCard, {
      props: { grade: 3, topic: '混合四则运算', difficulty: '中等', duration: 10, recommended: true },
    })
    expect(wrapper.text()).toContain('三年级')
    expect(wrapper.text()).toContain('混合四则运算')
  })

  it('点击触发 select 事件', async () => {
    const wrapper = mount(GradeCard, {
      props: { grade: 3, topic: '混合四则运算', difficulty: '中等', duration: 10 },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('recommended=true 时显示"推荐"徽章', () => {
    const wrapper = mount(GradeCard, {
      props: { grade: 3, topic: '混合四则运算', difficulty: '中等', duration: 10, recommended: true },
    })
    expect(wrapper.text()).toContain('推荐')
  })
})
