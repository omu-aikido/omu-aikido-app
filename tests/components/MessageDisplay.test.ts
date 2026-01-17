import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import MessageDisplay from '@/src/components/common/MessageDisplay.vue';

describe('MessageDisplay.vue', () => {
  it('renders error message', () => {
    const wrapper = mount(MessageDisplay, {
      props: {
        errorMessage: 'エラーが発生しました',
      },
    });

    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('エラーが発生しました');
    expect(wrapper.find('[data-testid="success-message"]').exists()).toBe(false);
  });

  it('renders success message', () => {
    const wrapper = mount(MessageDisplay, {
      props: {
        successMessage: '成功しました',
      },
    });

    expect(wrapper.find('[data-testid="success-message"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('成功しました');
    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(false);
  });

  it('renders both messages if provided', () => {
    const wrapper = mount(MessageDisplay, {
      props: {
        errorMessage: 'Error',
        successMessage: 'Success',
      },
    });

    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="success-message"]').exists()).toBe(true);
  });

  it('renders nothing if no messages', () => {
    const wrapper = mount(MessageDisplay);
    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="success-message"]').exists()).toBe(false);
  });
});
