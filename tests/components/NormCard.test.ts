import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import NormCard from '@/src/components/admin/NormCard.vue'

describe('NormCard.vue', () => {
  const mockUser = {
    id: 'user1',
    firstName: 'First',
    lastName: 'Last',
    imageUrl: 'propfile.jpg',
    emailAddress: 'test@example.com',
    profile: {
      role: 'member',
      roleLabel: '部員',
      grade: 1,
      gradeLabel: '一級',
      year: 'b2',
      yearLabel: '2回生',
      joinedAt: 2024,
      getGradeAt: null,
    },
  }

  const mockNorm = {
    userId: 'user1',
    current: 10,
    required: 20,
    progress: 50,
    isMet: false,
    grade: 1,
    gradeLabel: '一級',
    lastPromotionDate: '2023-12-01',
  }

  it('renders user info and progress', () => {
    const wrapper = mount(NormCard, {
      props: {
        user: mockUser,
        norm: mockNorm,
        progress: 50,
      },
    })

    expect(wrapper.find('[data-testid="norm-card"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Last First')
    expect(wrapper.text()).toContain('一級')
    expect(wrapper.text()).toContain('50%')

    const status = wrapper.find('[data-testid="norm-status"]')
    expect(status.text()).toBe('未達成')
    expect(status.classes()).toContain('bg-amber-100')
  })

  it('renders met status correctly', () => {
    const wrapper = mount(NormCard, {
      props: {
        user: mockUser,
        norm: { ...mockNorm, isMet: true },
        progress: 100,
      },
    })

    const status = wrapper.find('[data-testid="norm-status"]')
    expect(status.text()).toBe('達成')
    expect(status.classes()).toContain('bg-emerald-100')
  })
})
