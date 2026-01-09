import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import PracticeRanking from '@/src/components/home/PracticeRanking.vue'

describe('PracticeRanking.vue', () => {
  const mockRankingData = {
    period: '2024-01',
    periodType: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    ranking: [],
    currentUserRanking: {
      rank: 5,
      userId: 'user1',
      userName: 'User 1',
      isCurrentUser: true,
      totalPeriod: 10.0,
      practiceCount: 5,
    },
    totalUsers: 100,
  }

  it('renders user ranking correctly', () => {
    const wrapper = mount(PracticeRanking, {
      props: {
        rankingData: mockRankingData,
      },
    })

    expect(wrapper.find('[data-testid="practice-ranking"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="rank-display"]').text()).toContain('5')
    expect(wrapper.find('[data-testid="stats-display"]').text()).toContain('5') // count
  })

  it('renders loading state', () => {
    const wrapper = mount(PracticeRanking, {
      props: {
        rankingData: null,
        loading: true,
      },
    })

    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
  })

  it('renders error state', () => {
    const wrapper = mount(PracticeRanking, {
      props: {
        rankingData: null,
        error: 'Network Error',
      },
    })

    expect(wrapper.text()).toContain('エラー: Network Error')
  })
})
