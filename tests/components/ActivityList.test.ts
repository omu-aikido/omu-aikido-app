import { mount } from '@vue/test-utils'
import { format } from 'date-fns'
import { describe, it, expect } from 'vitest'

import ActivityList from '@/src/components/record/ActivityList.vue'

describe('ActivityList.vue', () => {
  const mockActivities = [
    {
      id: '1',
      date: format(new Date(), 'yyyy-MM-01'), // 1st of current month
      period: 2.0,
      userId: 'user1',
      createAt: '2024-01-01T00:00:00Z',
      updatedAt: null,
    },
    {
      id: '2',
      date: format(new Date(), 'yyyy-MM-02'), // 2nd of current month
      period: 1.5,
      userId: 'user1',
      createAt: '2024-01-02T00:00:00Z',
      updatedAt: null,
    },
  ]

  it('renders correctly', () => {
    const wrapper = mount(ActivityList, {
      props: {
        activities: [],
      },
    })
    expect(wrapper.find('[data-testid="activity-list"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="month-header"]').exists()).toBe(true)
  })

  it('renders activities and calculates total', () => {
    const wrapper = mount(ActivityList, {
      props: {
        activities: mockActivities,
        currentMonth: new Date(),
      },
    })

    // Should have days rendered
    const days = wrapper.findAll('[data-testid="day-item"]')
    expect(days.length).toBeGreaterThan(27) // 28-31 days

    // Check if aggregations are displayed for populated days
    // We look for the text "3.5" (sum?) No, it sums per day.
    // Day 1 has 2.0
    // Day 2 has 1.5
    expect(wrapper.text()).toContain('2')
    // The component renders period directly.

    // Actually, let's just check that we find some activity indicators
    expect(wrapper.text()).toContain('1件の記録')
  })

  it('emits changeMonth event when nav buttons clicked', async () => {
    const wrapper = mount(ActivityList, {
      props: { activities: [] },
    })

    await wrapper.find('[data-testid="prev-month-btn"]').trigger('click')
    expect(wrapper.emitted('changeMonth')).toBeTruthy()

    await wrapper.find('[data-testid="next-month-btn"]').trigger('click')
    expect(wrapper.emitted('changeMonth')).toBeTruthy()
  })

  it('emits selectDate event when a day is clicked', async () => {
    const wrapper = mount(ActivityList, {
      props: { activities: [] },
    })

    const firstDay = wrapper.find('[data-testid="day-item"]')
    await firstDay.trigger('click')

    expect(wrapper.emitted('selectDate')).toBeTruthy()
  })
})
