<template>
  <div
    class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 md:p-6 flex flex-col gap-4"
    data-testid="norm-card">
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <img :src="user.imageUrl" alt="" class="w-10 h-10 rounded-full bg-neutral-200" />
        <div>
          <div class="font-medium text-neutral-900 dark:text-neutral-100">{{ user.lastName }} {{ user.firstName }}</div>
          <div class="text-xs text-neutral-500 flex flex-wrap gap-x-2">
            <span>{{ norm.gradeLabel }}</span>
            <span v-if="norm.lastPromotionDate" class="text-neutral-400">•</span>
            <span v-if="norm.lastPromotionDate">昇級: {{ norm.lastPromotionDate }}</span>
          </div>
        </div>
      </div>
      <div class="shrink-0">
        <span
          :class="[
            'px-2 py-0.5 text-xs font-medium rounded-full',
            progress >= 100
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
          ]"
          data-testid="norm-status">
          {{ progress >= 100 ? "達成" : "未達成" }}
        </span>
      </div>
    </div>

    <div class="flex-1 flex flex-col justify-end gap-2">
      <!-- Progress Bar -->
      <div class="space-y-1">
        <div class="flex justify-between text-xs text-neutral-500">
          <span>進捗率 {{ Math.min(100, Math.round(progress)) }}%</span>
          <span class="font-medium text-neutral-700 dark:text-neutral-300">
            {{ norm.current }} / {{ norm.required }} 回
          </span>
        </div>
        <div class="h-1.5 w-full bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-indigo-600 rounded-full transition-all duration-500"
            :style="{ width: `${Math.min(100, progress)}%` }"
            data-testid="norm-progress"></div>
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
