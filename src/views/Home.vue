<script setup lang="ts">
import { computed, ref } from "vue"
import { SignedIn } from "@clerk/vue"
import { ClipboardListIcon, UserIcon, SettingsIcon } from "lucide-vue-next"

import PracticeCountGraph from "@/src/components/home/PracticeCountGraph.vue"
import PracticeRanking from "@/src/components/home/PracticeRanking.vue"
import ActivityForm from "@/src/components/record/ActivityForm.vue"
import { useAddActivity } from "@/src/composable/useActivity"
import hc from "@/src/lib/honoClient"
import { queryKeys } from "@/src/lib/queryKeys"
import { useQuery, useQueryClient } from "@tanstack/vue-query"
import type { InferResponseType } from "hono/client"

// Types
type ProfileResponse = InferResponseType<typeof hc.user.clerk.profile.$get, 200>
type PracticeCountResponse = InferResponseType<typeof hc.user.record.count.$get, 200>
type RankingResponse = InferResponseType<typeof hc.user.record.ranking.$get, 200>
type MenuResponse = InferResponseType<typeof hc.user.clerk.menu.$get, 200>

const { mutateAsync: addActivity } = useAddActivity()
const queryClient = useQueryClient()

// State
const activityLoading = ref(false)

const iconMap = {
  "clipboard-list": ClipboardListIcon,
  user: UserIcon,
  settings: SettingsIcon,
}

// Queries
const { data: profileData } = useQuery({
  queryKey: queryKeys.user.clerk.profile(),
  queryFn: async () => {
    const res = await hc.user.clerk.profile.$get()
    if (!res.ok) throw new Error("Failed to fetch profile")
    return res.json() as Promise<ProfileResponse>
  },
})

const {
  data: practiceDataRaw,
  isLoading: countLoading,
  error: validationError,
} = useQuery({
  queryKey: queryKeys.user.record.count(),
  queryFn: async () => {
    const res = await hc.user.record.count.$get()
    if (!res.ok) throw new Error("Failed to fetch practice count")
    return res.json() as Promise<PracticeCountResponse>
  },
})

const practiceData = computed(() => practiceDataRaw.value ?? null)

// Error handling wrapper for template compatibility
const error = computed(() =>
  validationError.value ? "稽古データの取得に失敗しました" : null,
)

const currentGrade = computed(() => {
  if (!profileData.value || !('profile' in profileData.value)) return 0
  return profileData.value.profile.grade ?? 0
})

const {
  data: rankingDataRaw,
  isLoading: rankingLoading,
  //  error: rankingErrorObj,
} = useQuery({
  queryKey: queryKeys.user.record.ranking(),
  queryFn: async () => {
    const res = await hc.user.record.ranking.$get({ query: {} })
    if (!res.ok) throw new Error("Failed to fetch ranking")
    return res.json() as Promise<RankingResponse>
  },
})

const rankingData = computed(() => rankingDataRaw.value ?? null)

/*
const rankingError = computed(() =>
  rankingErrorObj.value ? "ランキングの取得に失敗しました" : null
)
*/

const { data: menuData } = useQuery({
  queryKey: queryKeys.user.clerk.menu(),
  queryFn: async () => {
    const res = await hc.user.clerk.menu.$get()
    if (!res.ok) throw new Error("Failed to fetch menu")
    return res.json() as Promise<MenuResponse>
  },
})

const menuItems = computed(() => menuData.value?.menu ?? [])

const handleAddActivity = async (date: string, period: number) => {
  activityLoading.value = true
  try {
    await addActivity({ date, period })
    // Re-fetch data relevant to updates
    queryClient.invalidateQueries({ queryKey: queryKeys.user.clerk.profile() })
    queryClient.invalidateQueries({ queryKey: queryKeys.user.record.count() })
    queryClient.invalidateQueries({ queryKey: queryKeys.user.record.ranking() })
  } finally {
    activityLoading.value = false
  }
}

const getIconBgClass = (theme: string) => {
  switch (theme) {
    case "blue":
      return "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
    case "indigo":
      return "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
    default:
      return "bg-neutral-100 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400"
  }
}

const getBorderHoverClass = (theme: string) => {
  switch (theme) {
    case "blue":
      return "hover:border-blue-200 dark:hover:border-blue-800"
    case "indigo":
      return "hover:border-indigo-200 dark:hover:border-indigo-800"
    default:
      return "hover:border-neutral-300 dark:hover:border-neutral-600"
  }
}

const getTextHoverClass = (theme: string) => {
  switch (theme) {
    case "blue":
      return "group-hover:text-blue-600 dark:group-hover:text-blue-400"
    case "indigo":
      return "group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
    default:
      return ""
  }
}
</script>

<template>
  <div class="container mx-auto px-2">
    <SignedIn>
      <div class="max-w-3xl mx-auto space-y-4">
        <!-- Error State -->
        <div
          v-if="error"
          class="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm text-center">
          {{ error }}
        </div>

        <!-- Practice Count Graph -->
        <PracticeCountGraph
          :practice-data="practiceData"
          :current-grade="currentGrade"
          :loading="countLoading"
          :error="error" />

        <!-- Practice Ranking -->
        <PracticeRanking :ranking-data="rankingData" :loading="rankingLoading" />

        <!-- Activity Form -->
        <ActivityForm :loading="activityLoading" @submit="handleAddActivity" />

        <hr class="pb-2 text-neutral-500/60" />

        <!-- Navigation Links -->
        <div class="grid grid-cols-2 gap-4">
          <component
            :is="item.href.startsWith('http') ? 'a' : 'RouterLink'"
            v-for="item in menuItems"
            :key="item.id"
            :to="item.href.startsWith('http') ? undefined : item.href"
            :href="item.href.startsWith('http') ? item.href : undefined"
            class="group flex flex-col items-center cursor-pointer justify-center gap-3 rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-all duration-200"
            :class="getBorderHoverClass(item.theme)">
            <div
              class="rounded-full p-3 group-hover:scale-110 transition-transform duration-200"
              :class="getIconBgClass(item.theme)">
              <component :is="iconMap[item.icon as keyof typeof iconMap]" class="h-6 w-6" />
            </div>
            <span
              class="font-bold text-neutral-700 dark:text-neutral-200 transition-colors"
              :class="getTextHoverClass(item.theme)">
              {{ item.title }}
            </span>
          </component>
        </div>
      </div>
    </SignedIn>
  </div>
</template>
