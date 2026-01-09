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
  <div class="w-full" data-testid="practice-count-graph">
    <div
      v-if="loading"
      class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-5 animate-pulse"
      data-testid="loading-skeleton">
      <div class="flex flex-col items-center">
        <div class="flex justify-center items-baseline-last">
          <!-- Title Dummy -->
          <span class="text-lg font-medium text-transparent bg-neutral-200 dark:bg-neutral-700 rounded">
            初段昇段まで
          </span>
          <!-- Number Dummy -->
          <span class="text-4xl font-bold tracking-tight text-transparent bg-neutral-200 dark:bg-neutral-700 rounded">
            &ThinSpace;88&ThinSpace;
          </span>
          <!-- Unit Dummy -->
          <span class="text-transparent bg-neutral-200 dark:bg-neutral-700 rounded font-medium"> 日 </span>
        </div>
        <div class="w-full mt-4 max-w-sm">
          <!-- Progress Bar: h-2 -->
          <div class="h-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-500 dark:text-red-400 text-sm">エラー: {{ error }}</div>
    </div>

    <details
      v-else-if="practiceData"
      class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-colors duration-200 group">
      <summary class="p-5 cursor-pointer transition-colors list-none [&::-webkit-details-marker]:hidden">
        <div class="flex flex-col items-center">
          <div class="flex justify-center items-baseline-last">
            <span class="text-lg font-medium text-neutral-600 dark:text-neutral-300">
              {{ translateGrade(targetGrade) }}{{ promotionType }}まで
            </span>
            <span class="text-4xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
              &ThinSpace;{{ needToNextGrade }}&ThinSpace;
            </span>
            <span class="text-neutral-500 dark:text-neutral-400 font-medium">日</span>
          </div>

          <div class="w-full mt-4 max-w-sm">
            <div class="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
              <div
                class="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 ease-out"
                :style="{ width: `${progressPercentage}%` }"
                data-testid="progress-bar" />
            </div>
          </div>
        </div>
      </summary>

      <div
        class="px-5 pb-5 pt-0 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50">
        <div class="pt-4 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed text-center">
          <p class="font-medium text-indigo-600 dark:text-indigo-400 mb-2">
            {{ progressComment }}
          </p>
          <p>
            目標の<span class="font-medium">{{
              translateGrade(targetGrade)
            }}</span
            >への{{ promotionType }}まで
            <span class="font-bold text-neutral-900 dark:text-neutral-100">{{ requiredCount }}日分</span>
            の稽古が必要です。
          </p>
          <p class="mt-1">
            現在、<span class="font-bold text-green-600 dark:text-green-400">{{ practiceData.practiceCount }}日</span
            >達成しています。
          </p>
          <p class="mt-1 text-xs text-neutral-700 dark:text-neutral-400">※ 1.5時間の稽古を1日分として換算</p>
        </div>
      </div>
    </details>
  </div>
</template>
