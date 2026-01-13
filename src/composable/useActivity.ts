import type { InferRequestType } from 'hono/client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'

import type { Activity } from '@/share/types/records'

import hc from '@/src/lib/honoClient'
import { queryKeys } from '@/src/lib/queryKeys'

type RecordQuery = InferRequestType<typeof hc.user.record.$get>['query']

export function useActivities(filters: Ref<RecordQuery | undefined>) {
  return useQuery({
    queryKey: computed(() => queryKeys.user.record({ query: filters.value ?? {} })),
    queryFn: async () => {
      const query = filters.value || {}
      const res = await hc.user.record.$get({ query })
      if (!res.ok) throw new Error('Failed to fetch activities')
      const data = await res.json()
      return data.activities as Activity[]
    },
  })
}

export function useAddActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    retry: 5,
    mutationFn: async ({ date, period }: { date: string; period: number }) => {
      const res = await hc.user.record.$post({ json: { date, period } })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(`Failed to add activity: ${data.error}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'record'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.user.record.count() })
      queryClient.invalidateQueries({ queryKey: queryKeys.user.record.ranking() })
    },
  })
}

export function useDeleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    retry: 3,
    mutationFn: async (ids: string[]) => {
      const res = await hc.user.record.$delete({ json: { ids } })
      if (!res.ok) throw new Error('Failed to delete activities')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'record'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.user.record.count() })
      queryClient.invalidateQueries({ queryKey: queryKeys.user.record.ranking() })
    },
  })
}
