<script setup lang="ts">
import type { RankingResponse } from '@/share/types/records'

interface Props {
  rankingData: RankingResponse | null
  loading?: boolean
  error?: string | null
}

withDefaults(defineProps<Props>(), { loading: false, error: null })

const getRankColor = (rank: number) => {
  if (rank === 1) return "text-yellow-500"
  if (rank === 2) return "text-slate-400"
  if (rank === 3) return "text-orange-500"
  return "text-neutral-900 dark:text-neutral-100"
}
</script>

<template>
  <div class="w-full" data-testid="practice-ranking">
    <div
      v-if="loading"
      class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden animate-pulse">
      <div class="p-5 flex items-center justify-between">
        <!-- Left: Header & Rank Skeleton -->
        <div class="flex flex-col">
          <div class="text-[10px] font-medium mb-1 text-transparent bg-neutral-200 dark:bg-neutral-700 rounded w-fit">
            月間ランキング (2024年1月)
          </div>
          <div class="flex items-baseline gap-1.5">
            <span
              class="text-4xl font-bold tracking-tight loading-none text-transparent bg-neutral-200 dark:bg-neutral-700 rounded">
              1
            </span>
            <span class="text-sm font-medium text-transparent bg-neutral-200 dark:bg-neutral-700 rounded"> / 100 </span>
          </div>
        </div>

        <!-- Right: Stats Skeleton -->
        <div class="flex flex-col items-end">
          <div class="text-sm">
            <span class="font-bold text-lg text-transparent bg-neutral-200 dark:bg-neutral-700 rounded">100</span>
            <span class="text-xs ml-0.5 text-transparent bg-neutral-200 dark:bg-neutral-700 rounded">回</span>
          </div>
          <div class="text-sm">
            <span class="font-bold text-lg text-transparent bg-neutral-200 dark:bg-neutral-700 rounded">100.5</span>
            <span class="text-xs ml-0.5 text-transparent bg-neutral-200 dark:bg-neutral-700 rounded">時間</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-500 dark:text-red-400 text-sm">エラー: {{ error }}</div>
    </div>

    <div
      v-else-if="rankingData?.currentUserRanking"
      class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-5">
      <div class="flex items-center justify-between">
        <!-- Left: Header & Rank -->
        <div class="flex flex-col">
          <div class="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mb-1">
            月間ランキング ({{ rankingData.period }})
          </div>
          <div class="flex items-baseline gap-1.5" data-testid="rank-display">
            <span
              :class="[
                'text-4xl font-bold tracking-tight loading-none',
                getRankColor(rankingData.currentUserRanking.rank),
              ]">
              {{ rankingData.currentUserRanking.rank }}
            </span>
            <span class="text-sm text-neutral-400 dark:text-neutral-500 font-medium">
              / {{ rankingData.totalUsers }}
            </span>
          </div>
        </div>

        <!-- Right: Stats -->
        <div class="flex flex-col items-end" data-testid="stats-display">
          <div class="text-sm text-neutral-900 dark:text-neutral-100">
            <span class="font-bold text-lg">{{
              rankingData.currentUserRanking.practiceCount
            }}</span>
            <span class="text-xs text-neutral-500 dark:text-neutral-400 ml-0.5">回</span>
          </div>
          <div class="text-sm text-neutral-900 dark:text-neutral-100">
            <span class="font-bold text-lg">{{
              rankingData.currentUserRanking.totalPeriod
            }}</span>
            <span class="text-xs text-neutral-500 dark:text-neutral-400 ml-0.5">時間</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="rankingData" class="text-center py-8">
      <div class="text-neutral-500 dark:text-neutral-400 text-sm">この期間の稽古記録がありません</div>
    </div>
  </div>
</template>
