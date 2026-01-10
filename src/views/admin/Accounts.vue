<template>
  <div class="page-container">
    <AdminMenu />
    <div class="controls">
      <div class="search-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="名前・メアドで検索..."
          class="search-input"
          @keyup.enter="handleSearch" />
        <button class="search-btn" @click="handleSearch">検索</button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <Loading />
    </div>

    <div v-else-if="error" class="error-banner">
      {{ error }}
    </div>

    <div v-else class="table-container">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="sortable" @click="toggleSort('name')">
                名前
                <span v-if="sortBy === 'name'" class="sort-icon">{{
                  sortOrder === "asc" ? "↑" : "↓"
                }}</span>
              </th>
              <th class="sortable" @click="toggleSort('role')">
                役職
                <span v-if="sortBy === 'role'" class="sort-icon">{{
                  sortOrder === "asc" ? "↑" : "↓"
                }}</span>
              </th>
              <th class="sortable" @click="toggleSort('grade')">
                級段位
                <span v-if="sortBy === 'grade'" class="sort-icon">{{
                  sortOrder === "asc" ? "↑" : "↓"
                }}</span>
              </th>
              <th class="sortable" @click="toggleSort('year')">
                学年
                <span v-if="sortBy === 'year'" class="sort-icon">{{
                  sortOrder === "asc" ? "↑" : "↓"
                }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in sortedUsers"
              :key="user.id"
              class="table-row"
              @click="$router.push(`/admin/users/${user.id}`)">
              <td>
                <div class="user-cell">
                  <img :src="user.imageUrl" alt="" class="avatar" />
                  <div class="user-details">
                    <span class="user-name"> {{ user.lastName }} {{ user.firstName }} </span>
                    <small class="user-email">{{ user.emailAddress }}</small>
                  </div>
                </div>
              </td>
              <td class="cell-center">
                <span class="cell-text">{{ user.profile.roleLabel }}</span>
              </td>
              <td class="cell-center">
                <span class="cell-text">{{ user.profile.gradeLabel }}</span>
              </td>
              <td class="cell-center">
                <span class="cell-text">{{ user.profile.yearLabel }}</span>
              </td>
            </tr>
            <tr v-if="sortedUsers.length === 0">
              <td colspan="4" class="empty-cell">ユーザーが見つかりませんでした</td>
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

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-4) var(--space-3);
}

@media (width >= 768px) {
  .page-container {
    gap: var(--space-6);
    padding-inline: var(--space-6);
  }
}

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: flex-start;
}

@media (width >= 640px) {
  .controls {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.search-group {
  display: flex;
  gap: var(--space-2);
  width: 100%;
}

@media (width >= 640px) {
  .search-group {
    width: auto;
    margin-left: auto;
  }
}

.search-input {
  flex: 1;
  min-width: 0;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: box-shadow var(--transition-normal);
}

@media (width >= 640px) {
  .search-input {
    width: 16rem;
  }
}

.search-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.search-btn {
  padding: var(--space-2) var(--space-4);
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.search-btn:hover {
  background: var(--primary-hover);
}

.search-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: var(--space-12) 0;
}

.error-banner {
  padding: var(--space-4);
  background: rgb(239 68 68 / 10%);
  color: var(--red-500);
  border-radius: var(--radius-md);
  border: 1px solid rgb(239 68 68 / 20%);
}

.table-container {
  width: 100%;
}

.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  text-align: left;
  border-collapse: collapse;
  font-size: var(--text-base);
}

.data-table thead {
  border-bottom: 1px solid var(--border);
}

.sortable {
  padding: var(--space-3);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-normal);
}

@media (width >= 768px) {
  .sortable {
    padding-inline: var(--space-6);
  }
}

.sortable:hover {
  background: var(--bg-muted);
}

.sort-icon {
  margin-left: var(--space-1);
}

.table-row {
  cursor: pointer;
  transition: background var(--transition-normal);
  border-bottom: 1px solid var(--border);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--bg-muted);
}

.table-row td {
  padding: var(--space-4);
}

@media (width >= 768px) {
  .table-row td {
    padding-inline: var(--space-6);
  }
}

.user-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-full);
  background: var(--bg-muted-active);
  object-fit: cover;
  margin-left: 0.25rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.user-email {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.cell-center {
  text-align: center;
}

.cell-text {
  color: var(--text-primary);
}

.empty-cell {
  padding: var(--space-12);
  text-align: center;
  color: var(--text-secondary);
}
</style>
