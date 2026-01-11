import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import Card from '@/src/components/ui/UiCard.vue'

describe('Card.vue', () => {
  it('renders default slot content', () => {
    const wrapper = mount(Card, {
      slots: { default: "<div class='test-content'>Test Content</div>" },
    })

    expect(wrapper.html()).toContain('Test Content')
  })

  it('has proper structure', () => {
    const wrapper = mount(Card)

    expect(wrapper.find('div').exists()).toBe(true)
  })

  it('can render nested content', () => {
    const wrapper = mount(Card, {
      slots: { default: '<h1>Title</h1><p>Content</p>' },
    })

    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('p').exists()).toBe(true)
  })
})
