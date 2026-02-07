<script setup lang="ts">
import type { Activity } from '@/share/types/records';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { computed } from 'vue';

interface Props {
  activities: readonly Activity[];
  loading?: boolean;
  currentMonth?: Date;
}

interface Emits {
  (e: 'changeMonth', date: Date): void;
  (e: 'selectDate', date: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  currentMonth: () => new Date(),
});

const emit = defineEmits<Emits>();

const daysInMonth = computed(() => {
  const start = startOfMonth(props.currentMonth);
  const end = endOfMonth(props.currentMonth);
  return eachDayOfInterval({ start, end });
});

const getActivitiesForDay = (date: Date) => {
  return props.activities.filter((a) => isSameDay(parseISO(a.date), date));
};

const handlePrevMonth = () => {
  emit('changeMonth', subMonths(props.currentMonth, 1));
};

const handleNextMonth = () => {
  emit('changeMonth', addMonths(props.currentMonth, 1));
};

const handleDateClick = (date: Date) => {
  emit('selectDate', format(date, 'yyyy-MM-dd'));
};

const formatHeader = (date: Date) => {
  return format(date, 'yyyy年 M月', { locale: ja });
};

const getDay = (date: Date) => {
  return format(date, 'd');
};

const getWeekday = (date: Date) => {
  return format(date, 'E', { locale: ja });
};

const isSunday = (date: Date) => {
  return date.getDay() === 0;
};

const isSaturday = (date: Date) => {
  return date.getDay() === 6;
};

const isToday = (date: Date) => {
  return isSameDay(date, new Date());
};
</script>

<template>
  <div class="sticky top-0 z-20 flex-between p-3 px-4 bg-base">
    <button
      class="p-1 rounded-full bg-transparent border-none text-subtext cursor-pointer transition-colors hover:bg-overlay11-active"
      data-testid="prev-month-btn"
      @click="handlePrevMonth">
      <div class="i-lucide:chevron-left" />
    </button>

    <h2 class="text-lg font-bold text-text" data-testid="month-header">
      {{ formatHeader(currentMonth) }}
    </h2>

    <button
      class="p-1 rounded-full bg-transparent border-none text-subtext cursor-pointer transition-colors hover:bg-overlay11-active"
      data-testid="next-month-btn"
      @click="handleNextMonth">
      <div class="i-lucide:chevron-right" />
    </button>
  </div>

  <div class="p-0 overflow-hidden flex flex-col h-full flex-1 overflow-y-auto" data-testid="activity-list">
    <div v-if="loading && activities.length === 0" class="p-4 stack">
      <div v-for="i in 28" :key="i" class="flex items-center gap-4 animate-pulse">
        <div class="w-12 h-12 rounded-lg flex-shrink-0 bg-overlay1" />
        <div class="h-4 w-1/3 rounded-md bg-overlay1" />
      </div>
    </div>

    <div v-else class="flex flex-col">
      <div
        v-for="day in daysInMonth"
        :key="day.toISOString()"
        :class="[
          'flex items-stretch min-h-16 cursor-pointer transition-colors relative border-b border-overlay0',
          isToday(day) ? 'bg-blue-50/10' : 'hover:bg-surface0',
        ]"
        data-testid="day-item"
        @click="handleDateClick(day)">
        <div class="stack items-center justify-center w-12 flex-shrink-0 p-2 transition-colors">
          <span
            :class="[
              'text-lg font-bold leading-none text-text',
              isSunday(day) ? 'text-red-500' : isSaturday(day) ? 'text-blue-500' : '',
            ]">
            {{ getDay(day) }}
          </span>
          <span
            :class="[
              'text-xs font-medium leading-none mt-1 text-subtext',
              isSunday(day) ? 'text-red-500' : isSaturday(day) ? 'text-blue-500' : '',
            ]">
            {{ getWeekday(day) }}
          </span>
        </div>

        <div class="flex-1 flex flex-col justify-center p-2">
          <div v-if="getActivitiesForDay(day).length > 0" class="flex-between">
            <div class="flex items-baseline gap-2">
              <span class="text-sub">合計</span>
              <span class="text-xl font-bold text-text">
                {{ getActivitiesForDay(day).reduce((sum, a) => sum + a.period, 0) }}
              </span>
              <span class="text-sub">時間</span>
            </div>
            <span class="text-sm text-subtext"> {{ getActivitiesForDay(day).length }}件の記録 </span>
          </div>

          <div v-else class="h-full flex items-center opacity-0 hover:opacity-100">
            <span class="inline-flex items-center gap-1 text-overlay0 transition-opacity day-row:hover:opacity-100">
              <div class="i-lucide:plus" />
              記録を追加
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
