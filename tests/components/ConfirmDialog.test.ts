import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';

import ConfirmDialog from '@/src/components/ui/ConfirmDialog.vue';

// Mock Headless UI components
vi.mock('@headlessui/vue', () => {
  const StubComponent = { template: '<div><slot /></div>' };
  return {
    Dialog: StubComponent,
    DialogPanel: StubComponent,
    DialogTitle: StubComponent,
    DialogDescription: StubComponent,
  };
});

describe('ConfirmDialog.vue', () => {
  it('renders correctly when open', () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        open: true,
        title: '確認',
        description: '本当に削除しますか？',
      },
    });

    expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="confirm-title"]').text()).toBe('確認');
    expect(wrapper.text()).toContain('本当に削除しますか？');
  });

  it('emits confirm event when confirm button clicked', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        open: true,
        title: 'Title',
        description: 'Desc',
      },
    });

    await wrapper.find('[data-testid="confirm-btn"]').trigger('click');
    expect(wrapper.emitted('confirm')).toBeTruthy();
  });

  it('emits cancel event when cancel button clicked', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        open: true,
        title: 'Title',
        description: 'Desc',
      },
    });

    await wrapper.find('[data-testid="cancel-btn"]').trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });
});
