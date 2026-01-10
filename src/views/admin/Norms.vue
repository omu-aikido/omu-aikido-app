<template>
  <div class="page-container">
    <AdminMenu />
    <div class="controls">
      <div class="filters">
        <div class="filter-group">
          <button :class="['filter-btn', { active: filterStatus === 'all' }]" @click="filterStatus = 'all'">
            全て
          </button>
          <button
            :class="['filter-btn', 'filter-btn-red', { active: filterStatus === 'unmet' }]"
            @click="filterStatus = 'unmet'">
            未達成
          </button>
          <button
            :class="['filter-btn', 'filter-btn-green', { active: filterStatus === 'met' }]"
            @click="filterStatus = 'met'">
            達成済
          </button>
        </div>

        <div class="filter-group">
          <button
            title="進捗率: 低→高"
            :class="['filter-btn', { active: sortOrder === 'asc' }]"
            @click="sortOrder = 'asc'">
            昇順
          </button>
          <button
            title="進捗率: 高→低"
            :class="['filter-btn', { active: sortOrder === 'desc' }]"
            @click="sortOrder = 'desc'">
            降順
          </button>
        </div>
      </div>

      <div class="search-container">
        <input v-model="searchTerm" type="text" placeholder="名前で検索..." class="search-input" />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <Loading />
    </div>

    <div v-else-if="error" class="error-banner">
      {{ error }}
    </div>

    <div v-else class="content">
      <div class="cards-grid">
        <NormCard
          v-for="item in filteredUsers"
          :key="item.user.id"
          :user="item.user"
          :norm="item.norm"
          :progress="item.norm.progress" />
      </div>

      <div v-if="!loading && !error && filteredUsers.length === 0" class="empty-state">
        該当するユーザーが見つかりません
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
import NormCard from "@/src/components/admin/NormCard.vue"
import AdminMenu from "@/src/components/admin/AdminMenu.vue"

const searchTerm = ref("")
const filterStatus = ref<"all" | "met" | "unmet">("all")
const sortOrder = ref<"asc" | "desc">("desc")

const {
  data,
  isLoading: loading,
  error: queryError,
} = useQuery({
  queryKey: computed(() => queryKeys.admin.norms({ query: { query: searchTerm.value, limit: 100 } })),
  queryFn: async () => {
    const res = await hc.admin.norms.$get({
      query: { query: searchTerm.value, limit: 100 },
    })
    if (!res.ok) throw new Error("Failed to fetch norms")
    return res.json()
  },
})

const users = computed(() => {
  if (!data.value || !('users' in data.value)) return []
  return data.value.users
})

const norms = computed(() => {
  if (!data.value || !('norms' in data.value)) return []
  return data.value.norms
})

const error = computed(() => (queryError.value ? "データの取得に失敗しました" : ""))

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
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-4) var(--space-3);
}

@media (min-width: 768px) {
  .page-container {
    padding-inline: var(--space-6);
  }
}

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: flex-start;
}

@media (min-width: 640px) {
  .controls {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  width: 100%;
}

@media (min-width: 640px) {
  .filters {
    width: auto;
  }
}

.filter-group {
  display: flex;
  background: var(--bg-muted-active);
  border-radius: var(--radius-lg);
  padding: var(--space-1);
}

.filter-btn {
  padding: var(--space-1-5) var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.filter-btn:hover {
  color: var(--text-primary);
}

.filter-btn.active {
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.filter-btn-red.active {
  color: var(--red-500);
}

.filter-btn-green.active {
  color: var(--green-500);
}

.search-container {
  width: 100%;
}

@media (min-width: 640px) {
  .search-container {
    width: 18rem;
  }
}

.search-input {
  width: -webkit-fill-available;
      height: -webkit-fit-content;
  padding: var(--space-2) var(--space-3);
  padding-left: 2.5rem; /* For icon if needed */
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: box-shadow var(--transition-normal);
}

.search-input:focus {
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
  background: rgba(239, 68, 68, 0.1);
  color: var(--red-500);
  border-radius: var(--radius-md);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.content {
  width: 100%;
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.empty-state {
  text-align: center;
  padding: var(--space-12) 0;
  color: var(--text-secondary);
}
</style>
