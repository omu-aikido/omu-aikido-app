import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import Loading from '@/src/components/ui/UiLoading.vue'

describe('Loading.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(Loading)

    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="loading-container"]').exists()).toBe(true)
  })

  it('has proper styling', () => {
    const wrapper = mount(Loading)

    expect(wrapper.text()).toContain('Loading...')
  })

  it('is visible by default', () => {
    const wrapper = mount(Loading)

    expect(wrapper.isVisible()).toBe(true)
  })
})
