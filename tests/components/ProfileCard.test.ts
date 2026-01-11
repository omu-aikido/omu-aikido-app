import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

import ProfileCard from '@/src/components/account/ProfileCard.vue'

// Mock Hono Client
const mockGetProfile = vi.fn()
const mockUpdateProfile = vi.fn()

vi.mock('@/src/lib/honoClient', () => ({
  default: {
    user: {
      clerk: {
        profile: {
          $get: (...args: any[]) => mockGetProfile(...args),
          $patch: (...args: any[]) => mockUpdateProfile(...args),
        },
      },
    },
  },
}))

// Mock Vue Query
const mockUseQuery = vi.fn()
const mockUseMutation = vi.fn()
const mockInvalidateQueries = vi.fn()

vi.mock('@tanstack/vue-query', () => ({
  useQuery: (options: any) => mockUseQuery(options),
  useMutation: (options: any) => mockUseMutation(options),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}))

// Mock Utils
vi.mock('@/share/lib/grade', () => ({
  translateGrade: (g: number) => `Grade ${g}`,
  grade: [{ grade: 1, name: 'Grade 1' }],
}))

vi.mock('@/share/lib/year', () => ({
  translateYear: (y: string) => `Year ${y}`,
  year: [{ year: 'b1', name: 'B1' }],
}))

describe('ProfileCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mocks
    mockUseQuery.mockReturnValue({
      data: ref(null),
      isLoading: ref(false),
      error: ref(null),
    })

    mockUseMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: ref(false),
      onError: vi.fn(),
      onSuccess: vi.fn(),
    })
  })

  it('renders loading state (or empty) correctly', () => {
    mockUseQuery.mockReturnValue({
      data: ref(null),
      isLoading: ref(true),
    })

    const wrapper = mount(ProfileCard)
    // Check for skeleton or loading state
    // The component shows skeleton if !profile
    expect(wrapper.find('[data-testid="loading-skeleton"]').exists()).toBe(true)
  })

  it('renders profile data correctly', async () => {
    const mockProfile = {
      id: 'test_id',
      userId: 'test_user_id',
      grade: 1,
      getGradeAt: '2024-01-01',
      joinedAt: 2024,
      year: 'b1',
      role: 'member',
    }

    mockUseQuery.mockReturnValue({
      data: ref(mockProfile),
      isLoading: ref(false),
    })

    const wrapper = mount(ProfileCard)
    await flushPromises()

    expect(wrapper.text()).toContain('プロフィール')
    expect(wrapper.text()).toContain('Grade 1')
    // new Date('2024-01-01').toLocaleDateString() format might vary by locale in test env
    // But we expect some date string.
    expect(wrapper.text()).toContain('2024')
    expect(wrapper.text()).toContain('Year b1')
    expect(wrapper.find('button').text()).toBe('編集')
  })

  it('switches to edit mode', async () => {
    const mockProfile = {
      grade: 1,
      joinedAt: 2024,
      year: 'b1',
    }
    mockUseQuery.mockReturnValue({
      data: ref(mockProfile),
    })

    const wrapper = mount(ProfileCard)
    await wrapper.find('button').trigger('click')

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('submits update correctly', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({})
    mockUseMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: ref(false),
      onSuccess: vi.fn(),
    })

    const mockProfile = {
      grade: 1,
      joinedAt: 2024,
      year: 'b1',
    }
    mockUseQuery.mockReturnValue({
      data: ref(mockProfile),
    })

    const wrapper = mount(ProfileCard)

    // Enter edit mode
    await wrapper.find('button').trigger('click')

    // Change value (e.g. joinedAt)
    const joinedAtInput = wrapper.find('input[type="number"]')
    await joinedAtInput.setValue('2025')

    // Submit
    await wrapper.find('form').trigger('submit')

    expect(mockMutateAsync).toHaveBeenCalled()
    // Check arguments
    // The component calls updateProfile with { grade, getGradeAt, joinedAt, year }
    // We changed joinedAt to 2025
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        joinedAt: 2025,
      })
    )
  })
})
