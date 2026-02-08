<script setup lang="ts">
import { timeForNextGrade, translateGrade } from '@/share/lib/grade';
import type { PracticeCountData } from '@/share/types/records';
import { computed } from 'vue';

interface Props {
  practiceData: PracticeCountData | null;
  currentGrade: number;
  loading?: boolean;
  error?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

const targetGrade = computed(() => {
  const grade: number = props.currentGrade;
  return nextGrade(grade);
});

const nextGrade = (grade: number): number => {
  switch (grade) {
    case 5:
    case 4:
      return 3;
    case 3:
    case 2:
      return 1;
    case 1:
      return -1;
    case 0:
      return 5;
    default:
      return grade - 1;
  }
};

const promotionType = computed(() => {
  const grade = props.currentGrade;
  return grade <= 1 ? (grade === 0 ? '昇級' : '昇段') : '昇級';
});

const requiredCount = computed(() => timeForNextGrade(props.currentGrade));

const needToNextGrade = computed(() => {
  if (!props.practiceData) return 0;
  return Math.max(0, requiredCount.value - props.practiceData.practiceCount);
});

const progressPercentage = computed(() => {
  if (!props.practiceData) return 0;
  const percentage = (props.practiceData.practiceCount / requiredCount.value) * 100;
  return Math.min(Math.round(percentage), 100);
});

const progressComment = computed(() => {
  const progressComments = [
    'まだ始まったばかりです。焦らずコツコツ続けましょう！',
    '少し進みました！この調子！',
    '順調なスタートです。',
    '良いペースです。',
    '着実に積み重ねています。',
    '半分近くまで来ました！',
    '折り返し地点です。',
    '後半戦、集中していきましょう！',
    'ゴールが見えてきました。',
    'あと少しで達成です！',
    'もうすぐ目標達成！',
    '素晴らしい！達成目前です。',
  ];
  const commentIndex = Math.min(11, Math.floor((progressPercentage.value / 100) * 12));
  return progressComments[commentIndex];
});
</script>

<template>
  <div class="w-full" data-testid="practice-count-graph">
    <div v-if="loading" class="card animate-pulse rounded" data-testid="skeleton">
      <div class="flex flex-col justify-center items-center">
        <div class="flex justify-center bg-overlay1 rounded">
          <span class="text-transparent"> &nbsp;&nbsp; </span>
        </div>
        <div class="w-full max-w-96 py-4">
          <div class="rounded-md h-2 w-full bg-overlay0">
            <div class="h-full max-w-full rounded-md bg-text" style="width: 0" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <div class="text-sm text-red-500">エラー: {{ error }}</div>
    </div>

    <details v-else-if="practiceData" class="card select-none">
      <summary class="cursor-pointer list-none rounded-lg [&::-webkit-details-marker]:hidden">
        <div class="w-full cursor-pointer flex flex-col justify-center items-center">
          <div class="text-lg">
            {{ translateGrade(targetGrade) }}{{ promotionType }}まで
            <span class="text font-bold text-3xl">{{ needToNextGrade }}</span>
            日
          </div>

          <div class="w-full max-w-96 py-4">
            <div class="rounded-md h-2 w-full bg-surface1">
              <div
                class="h-full max-w-full rounded-md bg-text"
                :style="{ width: `${progressPercentage}%` }"
                data-testid="progress-bar" />
            </div>
          </div>
        </div>
      </summary>

      <div class="p-4 border-t border-overlay1">
        <div class="space-y-3">
          <p class="text">
            {{ progressComment }}
          </p>
          <p>
            目標の<span class="font-bold">{{ translateGrade(targetGrade) }}</span
            >への{{ promotionType }}まで
            <span class="font-bold">{{ requiredCount }}日分</span>
            の稽古が必要です。
          </p>
          <p class="mt-2">
            現在、<span class="text-green-500 font-medium">{{ practiceData.practiceCount }}日</span>達成しています。
          </p>
          <p class="text-xs text-subtext mt-1">※ 1.5時間の稽古を1日分として換算</p>
        </div>
      </div>
    </details>
  </div>
</template>
