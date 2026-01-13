import { mount, RouterLinkStub } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import NotFound from '@/src/views/NotFound.vue';

describe('NotFound.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(NotFound, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });

    expect(wrapper.text()).toContain('ページが見つかりません');
  });

  it('contains a link to home', () => {
    const wrapper = mount(NotFound, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });
    const link = wrapper.findComponent(RouterLinkStub);

    expect(link.exists()).toBe(true);
    expect(link.text()).toContain('トップに戻る');
  });

  it('has proper styling classes', () => {
    const wrapper = mount(NotFound, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });
    const container = wrapper.find('[data-testid="not-found-page"]');

    expect(container.exists()).toBe(true);
  });
});
