import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ConfigWizard from './ConfigWizard.vue';

describe('ConfigWizard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start at step 1', () => {
    const wrapper = mount(ConfigWizard);
    expect(wrapper.find('.wizard-step').exists()).toBe(true);
    expect(wrapper.find('.btn-primary').text()).toContain('下一步');
  });

  it('should navigate to next step', async () => {
    const wrapper = mount(ConfigWizard);
    await wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.find('.btn-primary').text()).toContain('下一步');
  });

  it('should emit complete on final step', async () => {
    const wrapper = mount(ConfigWizard);

    // Navigate to step 3
    await wrapper.find('.btn-primary').trigger('click'); // 1→2
    await wrapper.find('.btn-primary').trigger('click'); // 2→3
    await wrapper.find('.btn-primary').trigger('click');

    expect(wrapper.emitted('complete')).toBeTruthy();
  });

  it('should save config to localStorage', async () => {
    const wrapper = mount(ConfigWizard);

    await wrapper.find('.btn-primary').trigger('click'); // 1→2

    expect(localStorage.getItem('math-generator-config')).toBeTruthy();
  });

  it('should restore config from localStorage', () => {
    const savedConfig = JSON.stringify({
      grade: '5',
      semester: '下',
      questionTypes: ['arithmetic', 'application'],
    });
    localStorage.setItem('math-generator-config', savedConfig);

    const wrapper = mount(ConfigWizard);
    // Verify config is loaded
    expect(wrapper.vm.state.config.grade).toBe('5');
  });
});
