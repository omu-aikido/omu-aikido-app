import { describe, it, expect, vi, beforeEach } from 'vitest'

import { type ActivityType } from '../../../server/db/schema'
import { useActivity } from '../../../src/composable/useActivity'

vi.mock('../../../src/lib/honoClient', () => ({
  default: {
    user: { record: { $get: vi.fn(), $post: vi.fn(), $delete: vi.fn() } },
  },
}))

const mockHonoClient = (await import('../../../src/lib/honoClient')).default

describe('useActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty activities', () => {
    const { activities } = useActivity()
    expect(activities.value).toEqual([])
  })

  it('should fetch activities successfully', async () => {
    const mockActivities: ActivityType[] = [
      {
        id: '1',
        userId: 'user-1',
        date: '2024-01-01',
        period: 1.5,
        createAt: '2024-01-01T00:00:00.000Z',
        updatedAt: null,
      },
    ]

    vi.mocked(mockHonoClient.user.record.$get).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ activities: mockActivities }),
    } as any)

    const { activities, fetchActivities, loading, error } = useActivity()

    await fetchActivities()

    expect(mockHonoClient.user.record.$get).toHaveBeenCalled()
    expect(activities.value).toEqual(mockActivities)
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('should handle fetch error', async () => {
    vi.mocked(mockHonoClient.user.record.$get).mockResolvedValue({ ok: false } as any)

    const { activities, fetchActivities, loading, error } = useActivity()

    await fetchActivities()

    expect(activities.value).toEqual([])
    expect(loading.value).toBe(false)
    expect(error.value).toBe('Failed to fetch activities')
  })

  it('should add activity successfully', async () => {
    const mockActivities: ActivityType[] = [
      {
        id: '2',
        userId: 'user-1',
        date: '2024-01-02',
        period: 2.0,
        createAt: '2024-01-02T00:00:00.000Z',
        updatedAt: null,
      },
    ]

    vi.mocked(mockHonoClient.user.record.$post).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    } as any)

    vi.mocked(mockHonoClient.user.record.$get).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ activities: mockActivities }),
    } as any)

    const { addActivity } = useActivity()

    await expect(addActivity('2024-01-02', 2.0)).resolves.not.toThrow()

    expect(mockHonoClient.user.record.$post).toHaveBeenCalledWith({
      json: { date: '2024-01-02', period: 2.0 },
    })
  })

  it('should handle add activity error', async () => {
    vi.mocked(mockHonoClient.user.record.$post).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to add activity' }),
    } as any)

    const { addActivity, loading, error } = useActivity()

    await expect(addActivity('2024-01-02', 2.0)).rejects.toThrow('Failed to add activity: Failed to add activity')

    expect(loading.value).toBe(false)
    expect(error.value).toBe('Failed to add activity: Failed to add activity')
  })

  it('should delete activity successfully', async () => {
    const mockActivities: ActivityType[] = []

    vi.mocked(mockHonoClient.user.record.$delete).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    } as any)

    vi.mocked(mockHonoClient.user.record.$get).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ activities: mockActivities }),
    } as any)

    const { deleteActivity } = useActivity()

    await expect(deleteActivity(['1', '2'])).resolves.not.toThrow()

    expect(mockHonoClient.user.record.$delete).toHaveBeenCalledWith({
      json: { ids: ['1', '2'] },
    })
  })

  it('should handle delete activity error', async () => {
    vi.mocked(mockHonoClient.user.record.$delete).mockResolvedValue({
      ok: false,
    } as any)

    const { deleteActivity, loading, error } = useActivity()

    await expect(deleteActivity(['1'])).rejects.toThrow()

    expect(loading.value).toBe(false)
    expect(error.value).toBe('Failed to delete activities')
  })

  it('should handle activities with filters', async () => {
    const mockActivities: ActivityType[] = [
      {
        id: '1',
        userId: 'user-1',
        date: '2024-01-01',
        period: 1.5,
        createAt: '2024-01-01T00:00:00.000Z',
        updatedAt: null,
      },
    ]

    vi.mocked(mockHonoClient.user.record.$get).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ activities: mockActivities }),
    } as any)

    const { fetchActivities } = useActivity()

    await fetchActivities({ startDate: '2024-01-01', endDate: '2024-01-31' })

    expect(mockHonoClient.user.record.$get).toHaveBeenCalledWith({
      query: { startDate: '2024-01-01', endDate: '2024-01-31' },
    })
  })
})
