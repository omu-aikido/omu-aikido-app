<template>
  <a
    v-bind:href="'/admin/users/' + user.id"
    class="bg-bg-light border border-border-dim rounded-xl shadow-sm p-4 flex flex-col gap-4 md:p-6 cursor-pointer"
    data-testid="norm-card">
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <img :src="user.imageUrl" alt="" class="avatar-md" />
        <div>
          <div class="font-medium text-fg">{{ user.lastName }} {{ user.firstName }}</div>
          <div class="text-sub flex flex-wrap gap-x-2 gap-y-0">
            <span>{{ norm.gradeLabel }}</span>
            <span v-if="norm.lastPromotionDate" class="text-gray-400">•</span>
            <span v-if="norm.lastPromotionDate">昇級: {{ norm.lastPromotionDate }}</span>
          </div>
        </div>
      </div>
      <div class="shrink-0">
        <span :class="progress >= 100 ? 'badge-green' : 'badge-yellow'" data-testid="norm-status">
          {{ progress >= 100 ? '達成' : '未達成' }}
        </span>
      </div>
    </div>

    <div class="flex-1 flex flex-col justify-end gap-2">
      <div class="flex flex-col gap-1">
        <div class="flex justify-between text-sub">
          <span>進捗率 {{ Math.min(100, Math.round(progress)) }}%</span>
          <span class="font-medium text-fg-dim">{{ norm.current }} / {{ norm.required }} 回</span>
        </div>
        <div class="h-1.5 w-full bg-bg-dim rounded-full overflow-hidden">
          <div
            class="h-full bg-blue-500 rounded-full transition-[width] duration-500 ease-out"
            :style="{ width: `${Math.min(100, progress)}%` }"
            data-testid="norm-progress" />
        </div>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import type { AdminUserType } from '@/share/types/admin';

interface NormData {
  userId: string;
  current: number;
  required: number;
  progress: number;
  isMet: boolean;
  grade: number;
  gradeLabel: string;
  lastPromotionDate: string | null;
}

defineProps<{ user: AdminUserType; norm: NormData; progress: number }>();
</script>
