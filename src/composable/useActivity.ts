import type { Ref } from 'vue'

import { ref, readonly } from 'vue'

import hc from '@/src/lib/honoClient'

interface Activity {
  id: string
  userId: string
  date: string
  period: number
  createAt: string
  updatedAt: string | null
}

interface ActivityFilters {
  startDate?: string
  endDate?: string
}

export function useActivity() {
  const activities: Ref<Activity[]> = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchActivities = async (filters?: ActivityFilters) => {
    loading.value = true
    error.value = null
    try {
      const query: { userId?: string; startDate?: string; endDate?: string } = {}
      if (filters?.startDate) query.startDate = filters.startDate
      if (filters?.endDate) query.endDate = filters.endDate

      const response = await hc.user.record.$get({ query })
      if (!response.ok) throw new Error('Failed to fetch activities')
      const data = await response.json()
      activities.value = data.activities
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  const addActivity = async (date: string, period: number) => {
    loading.value = true
    error.value = null
    try {
      const json: { date: string; period: number } = { date, period }

      const response = await hc.user.record.$post({ json })
      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(`Failed to add activity: ${error}`)
      }
      await fetchActivities()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteActivity = async (ids: string[]) => {
    loading.value = true
    error.value = null
    try {
      const response = await hc.user.record.$delete({ json: { ids } })
      if (!response.ok) throw new Error('Failed to delete activities')
      await fetchActivities()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    activities: readonly(activities),
    loading: readonly(loading),
    error: readonly(error),
    fetchActivities,
    addActivity,
    deleteActivity,
  }
}
