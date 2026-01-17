<script setup lang="ts">
import type { RankingResponse } from '@/share/types/records';

interface Props {
  rankingData: RankingResponse | null;
  loading?: boolean;
  error?: string | null;
}

withDefaults(defineProps<Props>(), { loading: false, error: null });

const getRankClass = (rank: number) => {
  if (rank === 1) return 'rank-gold';
  if (rank === 2) return 'rank-silver';
  if (rank === 3) return 'rank-bronze';
  return '';
};
</script>

<template>
  <div class="container" data-testid="practice-ranking">
    <div v-if="loading" class="card loading-skeleton" data-testid="loading-state">
      <div class="card-content">
        <div class="left">
          <div class="label skeleton-text">月間ランキング (&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;月)</div>
          <div class="rank-row">
            <span class="rank-number skeleton-text">&nbsp;</span>
            <span class="rank-total skeleton-text">/ &nbsp;&nbsp;&nbsp;&nbsp;</span>
          </div>
        </div>
        <div class="right">
          <div class="stat-row">
            <span class="stat-value skeleton-text">&nbsp;</span>
            <span class="stat-unit skeleton-text">&nbsp;&nbsp;</span>
          </div>
          <div class="stat-row">
            <span class="stat-value skeleton-text">&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span class="stat-unit skeleton-text">&nbsp;&nbsp;</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-text">エラー: {{ error }}</div>
    </div>

    <div v-else-if="rankingData?.currentUserRanking" class="card">
      <div class="card-content">
        <div class="left">
          <div class="label">月間ランキング ({{ rankingData.period }})</div>
          <div class="rank-row" data-testid="rank-display">
            <span :class="['rank-number', getRankClass(rankingData.currentUserRanking.rank)]">
              {{ rankingData.currentUserRanking.rank }}
            </span>
            <span class="rank-total">/ {{ rankingData.totalUsers }}</span>
          </div>
        </div>
        <div class="right" data-testid="stats-display">
          <div class="stat-row">
            <span class="stat-value">{{ rankingData.currentUserRanking.practiceCount }}</span>
            <span class="stat-unit">回</span>
          </div>
          <div class="stat-row">
            <span class="stat-value">{{ rankingData.currentUserRanking.totalPeriod }}</span>
            <span class="stat-unit">時間</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="rankingData" class="empty-state">
      <div class="empty-text">この期間の稽古記録がありません</div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-dim);
  padding: var(--space-5);
}

.loading-skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.skeleton-text {
  color: transparent;
  background: var(--bg-muted-active);
  border-radius: var(--radius-md);
}

.card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.625rem;
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.rank-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-1-5);
}

.rank-number {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.025em;
  line-height: 1;
  color: var(--text-primary);
}

.rank-gold {
  color: var(--rank-gold);
}

.rank-silver {
  color: var(--rank-silver);
}

.rank-bronze {
  color: var(--rank-bronze);
}

.rank-total {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-row {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.stat-value {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
}

.stat-unit {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-left: var(--space-0-5);
}

.error-state,
.empty-state {
  text-align: center;
  padding: var(--space-8);
}

.error-text {
  font-size: var(--text-sm);
  color: var(--red-500);
}

.empty-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
</style>
