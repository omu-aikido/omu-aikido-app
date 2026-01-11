<script setup lang="ts">
import { SignedIn } from "@clerk/vue"
import { ClipboardListIcon, SettingsIcon, UserIcon } from "lucide-vue-next"
import { computed, ref } from "vue"

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
} = useQuery({
  queryKey: queryKeys.user.record.ranking(),
  queryFn: async () => {
    const res = await hc.user.record.ranking.$get({ query: {} })
    if (!res.ok) throw new Error("Failed to fetch ranking")
    return res.json() as Promise<RankingResponse>
  },
})

const rankingData = computed(() => rankingDataRaw.value ?? null)

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
    queryClient.invalidateQueries({ queryKey: queryKeys.user.clerk.profile() })
    queryClient.invalidateQueries({ queryKey: queryKeys.user.record.count() })
    queryClient.invalidateQueries({ queryKey: queryKeys.user.record.ranking() })
  } finally {
    activityLoading.value = false
  }
}

const getThemeClass = (theme: string) => {
  if (theme === "blue") return "theme-blue"
  if (theme === "indigo") return "theme-indigo"
  if (theme === "green") return "theme-green"
  return ""
}
</script>

<template>
  <div class="container">
    <SignedIn>
      <div class="content">
        <div v-if="error" class="error-banner">
          {{ error }}
        </div>

        <PracticeCountGraph
          :practice-data="practiceData"
          :current-grade="currentGrade"
          :loading="countLoading"
          :error="error" />

        <PracticeRanking :ranking-data="rankingData" :loading="rankingLoading" />

        <ActivityForm :loading="activityLoading" @submit="handleAddActivity" />

        <hr class="divider" />

        <div class="nav-grid">
          <component
            :is="item.href.startsWith('http') ? 'a' : 'RouterLink'"
            v-for="item in menuItems"
            :key="item.id"
            :to="item.href.startsWith('http') ? undefined : item.href"
            :href="item.href.startsWith('http') ? item.href : undefined"
            :class="['nav-item', getThemeClass(item.theme)]">
            <div :class="['nav-icon', getThemeClass(item.theme)]">
              <component :is="iconMap[item.icon as keyof typeof iconMap]" class="icon" />
            </div>
            <span class="nav-label">{{ item.title }}</span>
          </component>
        </div>
      </div>
    </SignedIn>
  </div>
</template>

<style scoped>
.container {
  max-width: var(--container-max);
  margin-inline: auto;
  padding-inline: var(--space-4);
}

.content {
  max-width: 48rem;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.error-banner {
  background: var(--error-bg);
  color: var(--red-500);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  text-align: center;
}

.divider {
  padding-bottom: var(--space-2);
  border-color: var(--border-strong);
  opacity: 0.6;
}

.nav-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (width >= 640px) {
  .nav-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-dim);
  cursor: pointer;
  text-decoration: none;
  transition: box-shadow var(--transition-normal), border-color var(--transition-normal);
}

.nav-item:hover {
  box-shadow: var(--shadow-md);
}

.nav-item.theme-blue:hover {
  border-color: var(--blue-500);
}

.nav-item.theme-indigo:hover {
  border-color: var(--indigo-500);
}

.nav-item.theme-green:hover {
  border-color: var(--teal-400);
}

.nav-icon {
  height: 48px;
  width: 48px;
  border-radius: var(--radius-full);
  padding: var(--space-3);
  background: var(--bg-muted);
  color: var(--text-secondary);
  transition: transform var(--transition-normal);
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

.nav-icon.theme-blue {
  background: rgb(59 130 246 / 10%);
  color: var(--blue-500);
  stroke: var(--blue-500);
}

.nav-icon.theme-indigo {
  background: rgb(99 102 241 / 10%);
  color: var(--indigo-500);
  stroke: var(--indigo-500);
}

.nav-icon.theme-green {
  background: rgb(34 197 94 / 10%);
  color: var(--teal-400);
  stroke: var(--teal-400);
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
}

.nav-label {
  font-weight: var(--font-bold);
  color: var(--text-secondary);
  transition: color var(--transition-normal);
}

.nav-item:hover .nav-label {
  color: var(--text-primary);
}

.nav-item.theme-blue:hover .nav-label {
  color: var(--blue-500);
}

.nav-item.theme-indigo:hover .nav-label {
  color: var(--indigo-500);
}

.nav-item.theme-green:hover .nav-label {
  color: var(--teal-400);
}
</style>
