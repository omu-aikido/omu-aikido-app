<template>
  <div class="dashboard-page">
    <AdminMenu />

    <div v-if="loading" class="loading-container">
      <Loading />
    </div>

    <div v-else-if="error" class="error-banner">
      {{ error }}
    </div>

    <div v-else class="content">
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">直近3週間活動のない部員</h2>
          <span class="section-subtitle">{{ thresholdDate }} 以降の記録なし</span>
        </div>

        <div v-if="inactiveUsers.length === 0" class="empty-state">該当する部員はいません。全員活動中です！</div>

        <div v-else class="user-list">
          <div
            v-for="user in inactiveUsers"
            :key="user.id"
            class="user-item"
            @click="$router.push(`/admin/users/${user.id}`)">
            <img :src="user.imageUrl" alt="" class="avatar" />
            <div class="user-info">
              <div class="user-name">{{ user.lastName }} {{ user.firstName }}</div>
              <div class="user-role">
                {{ user.profile.roleLabel }}
              </div>
            </div>
            <div class="status-badge">注意</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminMenu from "@/src/components/admin/AdminMenu.vue"
import Loading from "@/src/components/ui/UiLoading.vue"
import hc from "@/src/lib/honoClient"
import { queryKeys } from "@/src/lib/queryKeys"
import { useQuery } from "@tanstack/vue-query"
import { computed } from "vue"

// Queries
const {
  data,
  isLoading: loading,
  error: queryError,
} = useQuery({
  queryKey: queryKeys.admin.dashboard(),
  queryFn: async () => {
    const res = await hc.admin.dashboard.$get()
    if (!res.ok) throw new Error("Failed to fetch dashboard data")
    return res.json()
  },
})

const inactiveUsers = computed(() => data.value?.inactiveUsers ?? [])
const thresholdDate = computed(() => data.value?.thresholdDate ?? "")
const error = computed(() =>
  queryError.value ? "ダッシュボード情報の取得に失敗しました" : ""
)
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-4) var(--space-3);
  padding-bottom: var(--space-12);
}

@media (width >= 768px) {
  .dashboard-page {
    padding-inline: var(--space-6);
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: var(--space-12) 0;
}

.error-banner {
  background: rgb(var(--red-500) / 10%);
  color: var(--red-500);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid rgb(239 68 68 / 20%);
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.section-header {
  padding: 0 var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--red-500);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.section-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.empty-state {
  padding: var(--space-8);
  text-align: center;
  color: var(--text-secondary);
}

.user-list {
  display: flex;
  flex-direction: column;
  max-height: 31.25rem; /* 500px */
  overflow-y: auto;
  border-top: 1px solid var(--border-dim);
  border-bottom: 1px solid var(--border-dim);
}

.user-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  cursor: pointer;
  transition: background var(--transition-normal);
  border-bottom: 1px solid var(--border-dim);
}

.user-item:last-child {
  border-bottom: none;
}

.user-item:hover {
  background: var(--bg-muted);
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-full);
  background: var(--bg-muted-active);
  object-fit: cover;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  background: rgb(239 68 68 / 10%);
  color: var(--red-500);
  margin-left: auto;
}
</style>
