<script setup lang="ts">
import { computed } from "vue"
import {
  format,
  parseISO,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { ja } from "date-fns/locale"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-vue-next"

interface Activity {
  id: string
  date: string
  period: number
  userId: string
  createAt: string
  updatedAt: string | null
}

interface Props {
  activities: readonly Activity[]
  loading?: boolean
  currentMonth?: Date // Default to now if not provided
}

interface Emits {
  (e: "changeMonth", date: Date): void
  (e: "selectDate", date: string): void
}

const props = withDefaults(defineProps<Props>(), {
  currentMonth: () => new Date(),
})

const emit = defineEmits<Emits>()

const daysInMonth = computed(() => {
  const start = startOfMonth(props.currentMonth)
  const end = endOfMonth(props.currentMonth)
  return eachDayOfInterval({ start, end })
})

const getActivitiesForDay = (date: Date) => {
  return props.activities.filter(a => isSameDay(parseISO(a.date), date))
}

const handlePrevMonth = () => {
  emit("changeMonth", subMonths(props.currentMonth, 1))
}

const handleNextMonth = () => {
  emit("changeMonth", addMonths(props.currentMonth, 1))
}

const handleDateClick = (date: Date) => {
  emit("selectDate", format(date, "yyyy-MM-dd"))
}

const formatHeader = (date: Date) => {
  return format(date, "yyyy年 M月", { locale: ja })
}

const getDay = (date: Date) => {
  return format(date, "d")
}

const getWeekday = (date: Date) => {
  return format(date, "E", { locale: ja })
}

const isSunday = (date: Date) => {
  return date.getDay() === 0
}

const isSaturday = (date: Date) => {
  return date.getDay() === 6
}

const isToday = (date: Date) => {
  return isSameDay(date, new Date())
}
</script>

<template>
  <!-- Header with Navigation -->
  <div class="sticky top-0 z-20 flex items-center justify-between px-4 py-3 backdrop-blur-sm">
    <button
      @click="handlePrevMonth"
      class="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-neutral-300"
      data-testid="prev-month-btn">
      <ChevronLeftIcon class="w-5 h-5" />
    </button>

    <h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100" data-testid="month-header">
      {{ formatHeader(currentMonth) }}
    </h2>

    <button
      @click="handleNextMonth"
      class="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-neutral-300"
      data-testid="next-month-btn">
      <ChevronRightIcon class="w-5 h-5" />
    </button>
  </div>

  <div class="p-0 overflow-hidden flex flex-col h-full flex-1 overflow-y-auto" data-testid="activity-list">
    <div v-if="loading && activities.length === 0" class="p-4 space-y-4">
      <!-- Skeleton -->
      <div v-for="i in 28" :key="i" class="flex items-center gap-4 animate-pulse">
        <div class="w-12 h-12 rounded-lg bg-transparent shrink-0"></div>
        <div class="h-4 bg-transparent rounded w-1/3"></div>
      </div>
    </div>

    <div v-else class="divide-y divide-neutral-100 dark:divide-neutral-700/50">
      <div
        v-for="day in daysInMonth"
        :key="day.toISOString()"
        @click="handleDateClick(day)"
        class="flex items-stretch min-h-16 group cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors relative"
        :class="{ 'bg-sky-200/15 dark:bg-sky-800/10': isToday(day) }"
        data-testid="day-item">
        <!-- Date Column -->
        <div
          class="flex flex-col items-center justify-center w-12 shrink-0 border-transparent group-hover:border-neutral-100 dark:group-hover:border-neutral-700/50 transition-colors py-2">
          <span
            class="text-lg font-bold leading-none"
            :class="{
                'text-red-600 dark:text-red-400': isSunday(day),
                'text-blue-600 dark:text-blue-400': isSaturday(day),
                'text-neutral-900 dark:text-neutral-100':
                  !isSunday(day) && !isSaturday(day),
              }">
            {{ getDay(day) }}
          </span>
          <span
            class="text-[10px] font-medium leading-none mt-1"
            :class="{
                'text-red-600 dark:text-red-400': isSunday(day),
                'text-blue-600 dark:text-blue-400': isSaturday(day),
                'text-neutral-500 dark:text-neutral-400':
                  !isSunday(day) && !isSaturday(day),
              }">
            {{ getWeekday(day) }}
          </span>
        </div>

        <!-- Content Column -->
        <div class="flex-1 flex flex-col justify-center px-2 py-2">
          <!-- Aggregated View -->
          <div v-if="getActivitiesForDay(day).length > 0" class="flex items-center justify-between">
            <div class="flex items-baseline gap-2">
              <span class="text-sm text-neutral-500 dark:text-neutral-400">合計</span>
              <span class="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {{
                    getActivitiesForDay(day).reduce(
                      (sum, a) => sum + a.period,
                      0
                    )
                }}
              </span>
              <span class="text-sm text-neutral-500 dark:text-neutral-400">時間</span>
            </div>
            <span class="text-xs text-neutral-400 dark:text-neutral-500">
              {{ getActivitiesForDay(day).length }}件の記録
            </span>
          </div>

          <!-- Empty State / Add Indicator -->
          <div v-else class="h-full flex items-center">
            <span
              class="inline-flex items-center gap-1 text-sm text-neutral-400 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <PlusIcon class="w-4 h-4" /> 記録を追加
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
