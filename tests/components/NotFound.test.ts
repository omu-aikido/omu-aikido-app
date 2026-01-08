import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import NotFound from '@/src/views/NotFound.vue'

describe('NotFound.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(NotFound)

    expect(wrapper.text()).toContain('ページが見つかりません')
  })

  it('contains a link to home', () => {
    const wrapper = mount(NotFound)
    const link = wrapper.findComponent({ name: 'RouterLink' })

    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('ホームに戻る')
  })

  it('has proper styling classes', () => {
    const wrapper = mount(NotFound)
    const container = wrapper.find('.min-h-screen')

    expect(container.exists()).toBe(true)
  })
})
