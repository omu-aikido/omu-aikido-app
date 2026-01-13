import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import ActivityForm from '@/src/components/record/ActivityForm.vue';

describe('ActivityForm.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(ActivityForm);
    expect(wrapper.find('[data-testid="activity-form"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="date-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="period-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="submit-btn"]').exists()).toBe(true);
  });

  it('initializes with default values', () => {
    const wrapper = mount(ActivityForm);
    const periodInput = wrapper.find<HTMLInputElement>('[data-testid="period-input"]');

    // Default date is today, hard to test exact string without mocking date,
    // but we can check period default 1.5
    expect(periodInput.element.value).toBe('1.5');
  });

  it('initializes with props', () => {
    const wrapper = mount(ActivityForm, {
      props: {
        initialDate: '2024-01-01',
      },
    });
    const dateInput = wrapper.find<HTMLInputElement>('[data-testid="date-input"]');
    expect(dateInput.element.value).toBe('2024-01-01');
  });

  it('emits submit event with form data', async () => {
    const wrapper = mount(ActivityForm);

    const dateInput = wrapper.find('[data-testid="date-input"]');
    await dateInput.setValue('2024-01-02');

    const periodInput = wrapper.find('[data-testid="period-input"]');
    await periodInput.setValue('2.0');

    await wrapper.find('[data-testid="activity-form"]').trigger('submit');

    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')?.[0]).toEqual(['2024-01-02', 2.0]);
  });

  it('disables submit button when loading', () => {
    const wrapper = mount(ActivityForm, {
      props: {
        loading: true,
      },
    });
    const btn = wrapper.find('[data-testid="submit-btn"]');
    expect(btn.attributes('disabled')).toBeDefined();
    expect(btn.text()).toBe('保存中...');
  });
});
