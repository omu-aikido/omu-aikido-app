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
    expect(basic.classes()).toContain('text-blue-500');

    // Others inactive
    expect(wrapper.find('[data-testid="step-personal"]').classes()).toContain('text-subtext');
  });

  it('highlights personal step correctly', () => {
    const wrapper = mount(ProgressIndicator, {
      props: { step: 'personal' },
    });

    // Basic should be complete
    expect(wrapper.find('[data-testid="step-basic"]').classes()).toContain('text-green-500');

    // Personal should be active
    expect(wrapper.find('[data-testid="step-personal"]').classes()).toContain('text-blue-500');
  });

  it('highlights profile step correctly', () => {
    const wrapper = mount(ProgressIndicator, {
      props: { step: 'profile' },
    });

    expect(wrapper.find('[data-testid="step-basic"]').classes()).toContain('text-green-500');
    expect(wrapper.find('[data-testid="step-personal"]').classes()).toContain('text-green-500');
    expect(wrapper.find('[data-testid="step-profile"]').classes()).toContain('text-blue-500');
  });
});
