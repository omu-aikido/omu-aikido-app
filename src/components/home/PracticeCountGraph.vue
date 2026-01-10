<script setup lang="ts">
import { computed } from "vue"
import { timeForNextGrade, translateGrade } from "@/share/lib/grade"
import type { PracticeCountData } from "@/share/types/records"

interface Props {
  practiceData: PracticeCountData | null
  currentGrade: number
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
})

const targetGrade = computed(() => {
  const grade = props.currentGrade
  return grade === 0 ? 5 : grade - 1
})

const promotionType = computed(() => {
  const grade = props.currentGrade
  return grade <= 1 ? (grade === 0 ? "昇級" : "昇段") : "昇級"
})

const requiredCount = computed(() => timeForNextGrade(props.currentGrade))

const needToNextGrade = computed(() => {
  if (!props.practiceData) return 0
  return Math.max(0, requiredCount.value - props.practiceData.practiceCount)
})

const progressPercentage = computed(() => {
  if (!props.practiceData) return 0
  const percentage =
    (props.practiceData.practiceCount / requiredCount.value) * 100
  return Math.min(Math.round(percentage), 100)
})

const progressComment = computed(() => {
  const progressComments = [
    "まだ始まったばかりです。焦らずコツコツ続けましょう！",
    "少し進みました！この調子！",
    "順調なスタートです。",
    "良いペースです。",
    "着実に積み重ねています。",
    "半分近くまで来ました！",
    "折り返し地点です。",
    "後半戦、集中していきましょう！",
    "ゴールが見えてきました。",
    "あと少しで達成です！",
    "もうすぐ目標達成！",
    "素晴らしい！達成目前です。",
  ]
  const commentIndex = Math.min(
    11,
    Math.floor((progressPercentage.value / 100) * 12)
  )
  return progressComments[commentIndex]
})
</script>

<template>
  <div class="container" data-testid="practice-count-graph">
    <div v-if="loading" class="card loading-skeleton" data-testid="loading-skeleton">
      <div class="content-center">
        <div class="title-row skeleton-text">
          <span class="number"> &nbsp;&nbsp; </span>
        </div>
        <div class="progress-container">
          <div class="progress-bar-bg">
            <div class="progress-bar" style="width: 0" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-text">エラー: {{ error }}</div>
    </div>

    <details v-else-if="practiceData" class="card details-card">
      <summary class="summary">
        <div class="content-center">
          <div class="title-row">
            <span class="title">{{ translateGrade(targetGrade) }}{{ promotionType }}まで</span>
            <span class="number">&ThinSpace;{{ needToNextGrade }}&ThinSpace;</span>
            <span class="unit">日</span>
          </div>

          <div class="progress-container">
            <div class="progress-bar-bg">
              <div class="progress-bar" :style="{ width: `${progressPercentage}%` }" data-testid="progress-bar" />
            </div>
          </div>
        </div>
      </summary>

      <div class="details-content">
        <div class="details-inner">
          <p class="comment">
            {{ progressComment }}
          </p>
          <p>
            目標の<span class="highlight">{{ translateGrade(targetGrade) }}</span
            >への{{ promotionType }}まで
            <span class="bold">{{ requiredCount }}日分</span>
            の稽古が必要です。
          </p>
          <p class="mt-1">
            現在、<span class="success">{{ practiceData.practiceCount }}日</span>達成しています。
          </p>
          <p class="note">※ 1.5時間の稽古を1日分として換算</p>
        </div>
      </div>
    </details>
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
  border: 1px solid var(--border);
}

.loading-skeleton {
  padding: var(--space-5);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton-text {
  color: transparent;
  background: var(--bg-muted-active);
  border-radius: var(--radius-md);
}

.content-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-row {
  display: flex;
  justify-content: center;
  align-items: baseline;
}

.title {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.number {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--primary);
  letter-spacing: -0.025em;
}

.unit {
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.progress-container {
  width: 100%;
  margin-top: var(--space-4);
  max-width: 24rem;
}

.progress-bar-bg {
  height: 0.5rem;
  width: 100%;
  border-radius: var(--radius-full);
  background: var(--bg-muted);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--primary);
  transition: width 500ms ease-out;
}

.error-state {
  text-align: center;
  padding: var(--space-8);
}

.error-text {
  font-size: var(--text-sm);
  color: var(--red-500);
}

.details-card {
  overflow: hidden;
  transition: background var(--transition-normal);
}

.summary {
  padding: var(--space-5);
  cursor: pointer;
  list-style: none;
  transition: background var(--transition-normal);
}

.summary::-webkit-details-marker {
  display: none;
}

.details-content {
  padding: 0 var(--space-5) var(--space-5);
  border-top: 1px solid var(--border);
  background: var(--bg-card);
}

.details-inner {
  padding-top: var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  text-align: center;
}

.comment {
  font-weight: var(--font-medium);
  color: var(--primary);
  margin-bottom: var(--space-2);
}

.highlight {
  font-weight: var(--font-medium);
}

.bold {
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.mt-1 {
  margin-top: var(--space-1);
}

.success {
  font-weight: var(--font-bold);
  color: var(--green-500);
}

.note {
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
</style>
