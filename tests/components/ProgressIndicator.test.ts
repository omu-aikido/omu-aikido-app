import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import ProgressIndicator from '@/src/components/signup/ProgressIndicator.vue'

describe('ProgressIndicator.vue', () => {
  it('highlights basic step correctly', () => {
    const wrapper = mount(ProgressIndicator, {
      props: { step: 'basic' },
    })

    // Basic should be blue/bold
    const basic = wrapper.find('[data-testid="step-basic"]')
    expect(basic.classes()).toContain('text-blue-600')

    // Others gray
    expect(wrapper.find('[data-testid="step-personal"]').classes()).toContain('text-gray-500')
  })

  it('highlights personal step correctly', () => {
    const wrapper = mount(ProgressIndicator, {
      props: { step: 'personal' },
    })

    // Basic should be green (completed)
    expect(wrapper.find('[data-testid="step-basic"]').classes()).toContain('text-green-600')

    // Personal should be blue (active)
    expect(wrapper.find('[data-testid="step-personal"]').classes()).toContain('text-blue-600')
  })

  it('highlights profile step correctly', () => {
    const wrapper = mount(ProgressIndicator, {
      props: { step: 'profile' },
    })

    expect(wrapper.find('[data-testid="step-basic"]').classes()).toContain('text-green-600')
    expect(wrapper.find('[data-testid="step-personal"]').classes()).toContain('text-green-600')
    expect(wrapper.find('[data-testid="step-profile"]').classes()).toContain('text-blue-600')
  })
})
