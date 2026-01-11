import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'

import AdminMenu from '@/src/components/admin/AdminMenu.vue'

// Override vue-router mock specifically for this test file
const pushMock = vi.fn()
const useRouteMock = vi.fn(() => ({ path: '/admin' }))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  useRoute: () => useRouteMock(),
}))

describe('AdminMenu.vue', () => {
  it('renders tabs', () => {
    const wrapper = mount(AdminMenu)
    expect(wrapper.find('[data-testid="admin-menu"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tab-dashboard"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tab-accounts"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tab-norms"]').exists()).toBe(true)
  })

  it('selects correct tab based on route', async () => {
    useRouteMock.mockReturnValue({ path: '/admin/accounts' })

    const wrapper = mount(AdminMenu)

    const accountTab = wrapper.find('[data-testid="tab-accounts"]')
    expect(accountTab.classes()).toContain('tab-selected')
  })

  it('navigates on tab click', async () => {
    useRouteMock.mockReturnValue({ path: '/admin' })
    const wrapper = mount(AdminMenu)

    await wrapper.find('[data-testid="tab-accounts"]').trigger('click')

    expect(pushMock).toHaveBeenCalledWith('/admin/accounts')
  })
})
