import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfigWizard from './ConfigWizard.vue'

describe('ConfigWizard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should start at step 1', () => {
    const wrapper = mount(ConfigWizard)
    // Step 1 content: grade selector visible
    expect(wrapper.findAll('button').some(b => b.text().includes('年级'))).toBe(true)
    // Next step button visible
    expect(wrapper.findAll('button').some(b => b.text().includes('下一步'))).toBe(true)
  })

  it('should navigate to next step', async () => {
    const wrapper = mount(ConfigWizard)
    // Initially at step 1 — click "下一步"
    const nextBtn = wrapper.findAll('button').find(b => b.text().includes('下一步'))
    expect(nextBtn).toBeDefined()
    await nextBtn.trigger('click')
    // Now at step 2: question type selector
    expect(wrapper.findAll('p').some(p => p.text().includes('题型'))).toBe(true)
  })

  it('should emit apply on final step', async () => {
    const wrapper = mount(ConfigWizard)
    // Navigate to step 3 (2 clicks)
    const nextBtn = () => wrapper.findAll('button').find(b => b.text().includes('下一步'))
    await nextBtn().trigger('click')
    await nextBtn().trigger('click')
    // Now at step 3 — "下一步" becomes "完成并生成"
    const finishBtn = wrapper.findAll('button').find(b => b.text().includes('完成并生成'))
    expect(finishBtn).toBeDefined()
    await finishBtn.trigger('click')
    expect(wrapper.emitted('apply')).toBeTruthy()
  })

  it('should update config when grade is selected', async () => {
    const wrapper = mount(ConfigWizard)
    const gradeBtn = wrapper.findAll('button').find(b => b.text().includes('5年级'))
    expect(gradeBtn).toBeDefined()
    await gradeBtn.trigger('click')
    expect(wrapper.vm.state.config.grade).toBe('5')
  })
})
