import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import PracticeCountGraph from '@/src/components/home/PracticeCountGraph.vue';

describe('PracticeCountGraph.vue', () => {
  const mockData = {
    practiceCount: 50,
    totalPeriod: 75.0,
    since: '2024-01-01',
  };

  it('renders correctly with data', () => {
    const wrapper = mount(PracticeCountGraph, {
      props: {
        practiceData: mockData,
        currentGrade: 0, // 無級
      },
    });

    expect(wrapper.find('[data-testid="practice-count-graph"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="progress-bar"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('50'); // practice count
  });

  it('renders loading skeleton when loading', () => {
    const wrapper = mount(PracticeCountGraph, {
      props: {
        practiceData: null,
        currentGrade: 0,
        loading: true,
      },
    });

    expect(wrapper.find('[data-testid="loading-skeleton"]').exists()).toBe(true);
  });

  it('renders error message', () => {
    const wrapper = mount(PracticeCountGraph, {
      props: {
        practiceData: null,
        currentGrade: 0,
        error: 'Failed to data',
      },
    });

    expect(wrapper.text()).toContain('エラー: Failed to data');
  });
});
