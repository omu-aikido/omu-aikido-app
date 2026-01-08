<script setup lang="ts">
import { ref, onMounted } from "vue"
import { SignedIn } from "@clerk/vue"
import { ClipboardListIcon, UserIcon, SettingsIcon } from "lucide-vue-next"

import PracticeCountGraph from "@/src/components/home/PracticeCountGraph.vue"
import PracticeRanking from "@/src/components/home/PracticeRanking.vue"
import ActivityForm from "@/src/components/record/ActivityForm.vue"
import { useActivity } from "@/src/composable/useActivity"
import hc from "@/src/lib/honoClient"

// Types
interface PracticeCountData {
  practiceCount: number
  totalPeriod: number
  since: string
}

interface UserProfile {
  profile: {
    id: string
    role: string
    grade: number
    getGradeAt: string | null | ""
    joinedAt: number
    year: string
  }
}

interface RankingUser {
  rank: number
  userId: string
  userName: string
  isCurrentUser: boolean
  totalPeriod: number
  practiceCount: number
}

interface RankingResponse {
  period: string
  periodType: string
  startDate: string
  endDate: string
  ranking: RankingUser[]
  currentUserRanking: RankingUser | null
  totalUsers: number
}

interface MenuItem {
  id: string
  title: string
  href: string
  icon: string
  theme: string
}

const { addActivity } = useActivity()

// State
const countLoading = ref(true)
const rankingLoading = ref(true)
const activityLoading = ref(false) // Helper for activity submission loading state
const error = ref<string | null>(null)
const rankingError = ref<string | null>(null)

const practiceData = ref<PracticeCountData | null>(null)
const currentGrade = ref(0)
const rankingData = ref<RankingResponse | null>(null)
const menuItems = ref<MenuItem[]>([])

const iconMap = {
  "clipboard-list": ClipboardListIcon,
  user: UserIcon,
  settings: SettingsIcon,
}

// Independent Fetch Functions
const fetchProfileAndCount = async () => {
  countLoading.value = true
  try {
    const [profileRes, countRes] = await Promise.all([
      hc.user.clerk.profile.$get(),
      hc.user.record.count.$get(),
    ])

    if (!profileRes.ok || !countRes.ok)
      throw new Error("Failed to fetch profile/count data")

    const profileData = (await profileRes.json()) as UserProfile
    const countData = await countRes.json()

    currentGrade.value = profileData.profile.grade
    practiceData.value = countData
  } catch (err) {
    console.error("Fetch Profile/Count Error:", err)
    error.value = "稽古データの取得に失敗しました"
  } finally {
    countLoading.value = false
  }
}

const fetchRanking = async () => {
  rankingLoading.value = true
  rankingError.value = null
  try {
    const res = await hc.user.record.ranking.$get({ query: {} })
    if (!res.ok) throw new Error("Failed to fetch ranking data")

    const data = (await res.json()) as RankingResponse
    rankingData.value = data
  } catch (err) {
    console.error("Fetch Ranking Error:", err)
    rankingError.value = "ランキングの取得に失敗しました"
  } finally {
    rankingLoading.value = false
  }
}

const fetchMenu = async () => {
  try {
    const res = await hc.user.clerk.menu.$get()
    if (res.ok) {
      const data = await res.json()
      menuItems.value = data.menu
    }
  } catch (err) {
    console.error("Failed to fetch menu", err)
  }
}

// Fetch All Staggered
const fetchData = async () => {
  error.value = null // Reset error

  // 1. Critical Data (Progress Graph)
  // We await this so it gets full bandwidth/priority
  await fetchProfileAndCount()

  // 2. Secondary Data (Ranking, Menu)
  // Fire these in parallel after critical data is loaded
  fetchRanking()
  fetchMenu()
}

const handleAddActivity = async (date: string, period: number) => {
  activityLoading.value = true
  await addActivity(date, period)
  // Re-fetch data relevant to updates
  fetchProfileAndCount()
  fetchRanking()
  activityLoading.value = false
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

onMounted(() => {
  fetchData()
})
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
