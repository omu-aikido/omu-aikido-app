<script setup lang="ts">
import type { RankingResponse } from '@/share/types/records';

interface Props {
  rankingData: RankingResponse | null;
  loading?: boolean;
  error?: string | null;
}

withDefaults(defineProps<Props>(), { loading: false, error: null });

const getRankClass = (rank: number) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-slate-400';
  if (rank === 3) return 'text-orange-400';
  return '';
};
</script>

<template>
  <div class="w-full" data-testid="practice-ranking">
    <div v-if="loading" class="card skeleton" data-testid="loading-state">
      <div class="flex-between">
        <div class="flex flex-col">
          <div class="text-xs font-medium text-subtext mb-1 text-transparent bg-gray-200 dark:bg-gray-700 rounded-md">
            月間ランキング (&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;月)
          </div>
          <div class="flex items-baseline gap-1.5">
            <span
              class="text-4xl font-bold tracking-tight text-text text-transparent bg-gray-200 dark:bg-gray-700 rounded-md"
              >&nbsp;</span
            >
            <span class="form-label text-transparent bg-gray-200 dark:bg-gray-700 rounded-md"
              >/ &nbsp;&nbsp;&nbsp;&nbsp;</span
            >
          </div>
        </div>
        <div class="flex flex-col items-end">
          <div class="text-sm text-text flex gap-0.5">
            <span class="text-lg font-bold text-transparent bg-gray-200 dark:bg-gray-700 rounded-md">&nbsp;</span>
            <span class="text-sub text-transparent bg-gray-200 dark:bg-gray-700 rounded-md">&nbsp;&nbsp;</span>
          </div>
          <div class="text-sm text-text flex gap-0.5">
            <span class="text-lg font-bold text-transparent bg-gray-200 dark:bg-gray-700 rounded-md"
              >&nbsp;&nbsp;&nbsp;&nbsp;</span
            >
            <span class="text-sub text-transparent bg-gray-200 dark:bg-gray-700 rounded-md">&nbsp;&nbsp;</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <div class="text-sm text-red-500">エラー: {{ error }}</div>
    </div>

    <div v-else-if="rankingData?.currentUserRanking" class="card">
      <div class="flex-between">
        <div class="flex flex-col">
          <div class="text-xs font-medium text-subtext mb-1">月間ランキング ({{ rankingData.period }})</div>
          <div class="flex items-baseline gap-1.5" data-testid="rank-display">
            <span
              :class="[
                'text-4xl font-bold tracking-tight text-text',
                getRankClass(rankingData.currentUserRanking.rank),
              ]">
              {{ rankingData.currentUserRanking.rank }}
            </span>
            <span class="form-label">/ {{ rankingData.totalUsers }}</span>
          </div>
        </div>
        <div class="flex flex-col items-end" data-testid="stats-display">
          <div class="text-sm text-text flex gap-0.5 items-baseline">
            <span class="text-lg font-bold">{{ rankingData.currentUserRanking.practiceCount }}</span>
            <span class="text-sub">回</span>
          </div>
          <div class="text-sm text-text flex gap-0.5 items-baseline">
            <span class="heading-2">{{ rankingData.currentUserRanking.totalPeriod }}</span>
            <span class="text-sub">時間</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="rankingData" class="text-center py-8">
      <div class="text-sub">この期間の稽古記録がありません</div>
    </div>
  </div>
</template>
