import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import ErrorBoundary from '@/src/components/common/ErrorBoundary.vue'

describe('ErrorBoundary.vue', () => {
  it('renders slot content when no error', () => {
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div data-testid="content">Content</div>',
      },
    })

    expect(wrapper.find('[data-testid="content"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="error-boundary"]').exists()).toBe(false)
  })
})
