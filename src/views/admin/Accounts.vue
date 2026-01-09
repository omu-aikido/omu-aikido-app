<template>
  <div class="space-y-4 md:space-y-6 px-3 md:px-6">
    <AdminMenu />
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex ml-auto gap-2 w-full sm:w-auto">
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="名前・メアドで検索..."
          class="flex-1 sm:w-64 px-3 py-2 text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />

        <button
          @click="handleSearch"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          検索
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <Loading />
    </div>

    <div v-else-if="error" class="p-4 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
      {{ error }}
    </div>

    <div v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th
                @click="toggleSort('name')"
                class="px-3 md:px-6 py-3 font-medium text-neutral-500 dark:text-neutral-400 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800">
                名前
                <span v-if="sortBy === 'name'">{{
                  sortOrder === "asc" ? "↑" : "↓"
                }}</span>
              </th>
              <th
                @click="toggleSort('role')"
                class="px-3 md:px-6 py-3 font-medium text-neutral-500 dark:text-neutral-400 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800">
                役職
                <span v-if="sortBy === 'role'">{{
                  sortOrder === "asc" ? "↑" : "↓"
                }}</span>
              </th>
              <th
                @click="toggleSort('grade')"
                class="px-3 md:px-6 py-3 font-medium text-neutral-500 dark:text-neutral-400 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800">
                級段位
                <span v-if="sortBy === 'grade'">{{
                  sortOrder === "asc" ? "↑" : "↓"
                }}</span>
              </th>
              <th
                @click="toggleSort('year')"
                class="px-3 md:px-6 py-3 font-medium text-neutral-500 dark:text-neutral-400 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800">
                学年
                <span v-if="sortBy === 'year'">{{
                  sortOrder === "asc" ? "↑" : "↓"
                }}</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr
              v-for="user in sortedUsers"
              :key="user.id"
              class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer [&_td]:py-4 [&_td]:text-center"
              @click="$router.push(`/admin/users/${user.id}`)">
              <td>
                <div class="flex items-center gap-2">
                  <img :src="user.imageUrl" alt="" class="w-6 h-6 ml-1 rounded-full bg-neutral-200" />
                  <div class="flex flex-col text-start">
                    <span class="font-medium text-neutral-900 dark:text-neutral-100">
                      {{ user.lastName }}
                      {{ user.firstName }}
                    </span>
                    <small class="text-xs text-neutral-500">{{
                      user.emailAddress
                    }}</small>
                  </div>
                </div>
              </td>
              <td>
                <span class="text-neutral-900 dark:text-neutral-100">
                  {{ user.profile.roleLabel }}
                </span>
              </td>
              <td>
                <span class="text-neutral-900 dark:text-neutral-100">
                  {{ user.profile.gradeLabel }}
                </span>
              </td>
              <td>
                <span class="text-neutral-900 dark:text-neutral-100">
                  {{ user.profile.yearLabel }}
                </span>
              </td>
            </tr>
            <tr v-if="sortedUsers.length === 0">
              <td colspan="5" class="px-3 md:px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                ユーザーが見つかりませんでした
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useQuery } from "@tanstack/vue-query"
import { queryKeys } from "@/src/lib/queryKeys"
import hc from "@/src/lib/honoClient"
import Loading from "@/src/components/ui/Loading.vue"
import AdminMenu from "@/src/components/admin/AdminMenu.vue"


const searchQuery = ref("")
const sortBy = ref<string>("role")
const sortOrder = ref<"asc" | "desc">("asc")

const {
  data,
  isLoading: loading,
  error: queryError,
} = useQuery({
  queryKey: computed(() => queryKeys.admin.accounts({ query: { query: searchQuery.value, limit: 50 } })),
  queryFn: async () => {
    const res = await hc.admin.accounts.$get({
      query: { query: searchQuery.value, limit: 50 },
    })
    if (!res.ok) throw new Error("Failed to fetch accounts")
    return res.json()
  },
})

const users = computed(() => data.value?.users ?? [])
const error = computed(() => (queryError.value ? "データの取得に失敗しました" : ""))

const handleSearch = () => {
  // Triggered by v-model update or enter key, causing query key change
}

const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc"
  } else {
    sortBy.value = field
    sortOrder.value = "asc"
  }
}

const sortedUsers = computed(() => {
  if (!users.value) return []

  return [...users.value].toSorted((a, b) => {
    let valA: string | number = ""
    let valB: string | number = ""

    switch (sortBy.value) {
      case "role":
        valA = a.profile.role || "z"
        valB = b.profile.role || "z"
        break
      case "grade":
        valA = a.profile.grade ?? 99
        valB = b.profile.grade ?? 99
        break
      case "year":
        valA = a.profile.year || ""
        valB = b.profile.year || ""
        break
      case "name":
        valA = `${a.lastName} ${a.firstName}`
        valB = `${b.lastName} ${b.firstName}`
        break
    }

    if (valA < valB) return sortOrder.value === "asc" ? -1 : 1
    if (valA > valB) return sortOrder.value === "asc" ? 1 : -1
    return 0
  })
})
</script>
