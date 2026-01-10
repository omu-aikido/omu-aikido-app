<template>
  <div class="card" data-testid="norm-card">
    <div class="header">
      <div class="user-info">
        <img :src="user.imageUrl" alt="" class="avatar" />
        <div>
          <div class="user-name">{{ user.lastName }} {{ user.firstName }}</div>
          <div class="user-meta">
            <span>{{ norm.gradeLabel }}</span>
            <span v-if="norm.lastPromotionDate" class="separator">•</span>
            <span v-if="norm.lastPromotionDate">昇級: {{ norm.lastPromotionDate }}</span>
          </div>
        </div>
      </div>
      <div class="status-container">
        <span :class="['status', progress >= 100 ? 'status-complete' : 'status-pending']" data-testid="norm-status">
          {{ progress >= 100 ? "達成" : "未達成" }}
        </span>
      </div>
    </div>

    <div class="progress-section">
      <div class="progress-info">
        <div class="progress-header">
          <span>進捗率 {{ Math.min(100, Math.round(progress)) }}%</span>
          <span class="progress-count">{{ norm.current }} / {{ norm.required }} 回</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar" :style="{ width: `${Math.min(100, progress)}%` }" data-testid="norm-progress" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminUserType } from "@/share/types/admin"

interface NormData {
  userId: string
  current: number
  required: number
  progress: number
  isMet: boolean
  grade: number
  gradeLabel: string
  lastPromotionDate: string | null
}

defineProps<{ user: AdminUserType; norm: NormData; progress: number }>()
</script>

<style scoped>
.card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .card {
    padding: var(--space-6);
  }
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-full);
  background: var(--bg-muted-active);
}

.user-name {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.user-meta {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--space-2);
}

.separator {
  color: var(--border-strong);
}

.status-container {
  flex-shrink: 0;
}

.status {
  padding: var(--space-0-5) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-full);
}

.status-complete {
  background: rgba(34, 197, 94, 0.1);
  color: var(--green-500);
}

.status-pending {
  background: rgba(234, 179, 8, 0.1);
  color: var(--yellow-400);
}

.progress-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--space-2);
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.progress-count {
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.progress-bar-bg {
  height: 0.375rem;
  width: 100%;
  background: var(--bg-muted);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary);
  border-radius: var(--radius-full);
  transition: width 500ms ease-out;
}
</style>
