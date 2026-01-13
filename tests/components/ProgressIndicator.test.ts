import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import ProgressIndicator from '@/src/components/signup/ProgressIndicator.vue';

describe('ProgressIndicator.vue', () => {
  it('highlights basic step correctly', () => {
    const wrapper = mount(ProgressIndicator, {
      props: { step: 'basic' },
    });

    // Basic should be active
    const basic = wrapper.find('[data-testid="step-basic"]');
    expect(basic.classes()).toContain('step-active');

    // Others inactive
    expect(wrapper.find('[data-testid="step-personal"]').classes()).toContain('step-inactive');
  });

  it('highlights personal step correctly', () => {
    const wrapper = mount(ProgressIndicator, {
      props: { step: 'personal' },
    });

    // Basic should be complete
    expect(wrapper.find('[data-testid="step-basic"]').classes()).toContain('step-complete');

    // Personal should be active
    expect(wrapper.find('[data-testid="step-personal"]').classes()).toContain('step-active');
  });

  it('highlights profile step correctly', () => {
    const wrapper = mount(ProgressIndicator, {
      props: { step: 'profile' },
    });

    expect(wrapper.find('[data-testid="step-basic"]').classes()).toContain('step-complete');
    expect(wrapper.find('[data-testid="step-personal"]').classes()).toContain('step-complete');
    expect(wrapper.find('[data-testid="step-profile"]').classes()).toContain('step-active');
  });
});
