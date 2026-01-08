<template>
  <div class="space-y-4 md:space-y-6 px-3 md:px-6">
    <AdminMenu />
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <!-- Filter & Sort Controls -->
      <div class="flex flex-wrap items-center gap-4 w-full sm:w-auto">
        <!-- Status Filter -->
        <div class="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
          <button
            @click="filterStatus = 'all'"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
              filterStatus === 'all'
                ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300',
            ]">
            全て
          </button>
          <button
            @click="filterStatus = 'unmet'"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
              filterStatus === 'unmet'
                ? 'bg-white dark:bg-neutral-700 shadow-sm text-red-600 dark:text-red-400'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300',
            ]">
            未達成
          </button>
          <button
            @click="filterStatus = 'met'"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
              filterStatus === 'met'
                ? 'bg-white dark:bg-neutral-700 shadow-sm text-emerald-600 dark:text-emerald-400'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300',
            ]">
            達成済
          </button>
        </div>

        <!-- Sort Order -->
        <div class="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
          <button
            @click="sortOrder = 'asc'"
            title="進捗率: 低→高"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
              sortOrder === 'asc'
                ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300',
            ]">
            昇順
          </button>
          <button
            @click="sortOrder = 'desc'"
            title="進捗率: 高→低"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
              sortOrder === 'desc'
                ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300',
            ]">
            降順
          </button>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="relative w-full sm:w-72">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="名前で検索..."
        class="w-full px-3 py-2 pl-9 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <Loading />
    </div>

    <div v-else-if="error" class="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
      {{ error }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NormCard
        v-for="item in filteredUsers"
        :key="item.user.id"
        :user="item.user"
        :norm="item.norm"
        :progress="item.norm.progress" />
    </div>

    <div v-if="!loading && !error && filteredUsers.length === 0" class="text-center py-12 text-neutral-500">
      該当するユーザーが見つかりません
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import hc from "@/src/lib/honoClient"
import Loading from "@/src/components/ui/Loading.vue"
import NormCard from "@/src/components/admin/NormCard.vue"
import AdminMenu from "@/src/components/admin/AdminMenu.vue"
import type { AdminUserType } from "@/share/types/admin"
import type { InferResponseType } from "hono/client"

type NormsRes = InferResponseType<typeof hc.admin.norms.$get>
type NormItem = Extract<NormsRes, { norms: unknown }>["norms"][number]

const users = ref<AdminUserType[]>([])
const norms = ref<NormItem[]>([])
const loading = ref(false)
const error = ref("")
const searchTerm = ref("")
const filterStatus = ref<"all" | "met" | "unmet">("all")
const sortOrder = ref<"asc" | "desc">("desc")

const fetchNorms = async () => {
  loading.value = true
  error.value = ""
  try {
    const res = await hc.admin.norms.$get({
      query: { query: searchTerm.value, limit: 100 },
    })

    if (!res.ok) throw new Error("Failed to fetch norms")

    const data = await res.json()
    if ("norms" in data) {
      users.value = data.users
      norms.value = data.norms
    }
  } catch (e) {
    console.error(e)
    error.value = "データの取得に失敗しました"
  } finally {
    loading.value = false
  }
}

const processedData = computed(() => {
  return users.value
    .map(user => {
      const norm = norms.value.find(n => n.userId === user.id)
      if (!norm) return null
      return { user, norm }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
})

const filteredUsers = computed(() => {
  let result = processedData.value

  // Filter by Search Term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(item => {
      const fullName =
        `${item.user.lastName || ""} ${item.user.firstName || ""}`.toLowerCase()
      return fullName.includes(term)
    })
  }

  // Filter by Status
  if (filterStatus.value !== "all") {
    result = result.filter(item => {
      if (filterStatus.value === "met") return item.norm.isMet
      if (filterStatus.value === "unmet") return !item.norm.isMet
      return true
    })
  }

  // Sort
  result.sort((a, b) => {
    const diff = a.norm.progress - b.norm.progress
    return sortOrder.value === "asc" ? diff : -diff
  })

  return result
})

onMounted(() => {
  fetchNorms()
})
</script>
