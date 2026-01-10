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
import type { Activity } from "@/share/types/records"

interface Props {
  activities: readonly Activity[]
  loading?: boolean
  currentMonth?: Date
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
  <div class="header">
    <button class="nav-btn" data-testid="prev-month-btn" @click="handlePrevMonth">
      <ChevronLeftIcon class="nav-icon" />
    </button>

    <h2 class="month-title" data-testid="month-header">
      {{ formatHeader(currentMonth) }}
    </h2>

    <button class="nav-btn" data-testid="next-month-btn" @click="handleNextMonth">
      <ChevronRightIcon class="nav-icon" />
    </button>
  </div>

  <div class="list-container" data-testid="activity-list">
    <div v-if="loading && activities.length === 0" class="skeleton-container">
      <div v-for="i in 28" :key="i" class="skeleton-row">
        <div class="skeleton-date" />
        <div class="skeleton-content" />
      </div>
    </div>

    <div v-else class="day-list">
      <div
        v-for="day in daysInMonth"
        :key="day.toISOString()"
        :class="['day-row', { 'day-today': isToday(day) }]"
        data-testid="day-item"
        @click="handleDateClick(day)">
        <div class="date-column">
          <span
            :class="[
              'day-number',
              isSunday(day) ? 'day-sunday' : isSaturday(day) ? 'day-saturday' : ''
            ]">
            {{ getDay(day) }}
          </span>
          <span
            :class="[
              'weekday',
              isSunday(day) ? 'day-sunday' : isSaturday(day) ? 'day-saturday' : ''
            ]">
            {{ getWeekday(day) }}
          </span>
        </div>

        <div class="content-column">
          <div v-if="getActivitiesForDay(day).length > 0" class="activity-summary">
            <div class="summary-left">
              <span class="summary-label">合計</span>
              <span class="summary-value">
                {{ getActivitiesForDay(day).reduce((sum, a) => sum + a.period, 0) }}
              </span>
              <span class="summary-unit">時間</span>
            </div>
            <span class="record-count"> {{ getActivitiesForDay(day).length }}件の記録 </span>
          </div>

          <div v-else class="empty-day">
            <span class="add-hint"> <PlusIcon class="add-icon" /> 記録を追加 </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  backdrop-filter: blur(12px);
}

.nav-btn {
  padding: var(--space-1);
  border-radius: var(--radius-full);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.nav-btn:hover {
  background: var(--bg-muted-active);
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.month-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.list-container {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow-y: auto;
}

.skeleton-container {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton-date {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.skeleton-content {
  height: 1rem;
  width: 33%;
  border-radius: var(--radius-md);
}

.day-list {
  display: flex;
  flex-direction: column;
}

.day-row {
  display: flex;
  align-items: stretch;
  min-height: 4rem;
  cursor: pointer;
  transition: background var(--transition-normal);
  position: relative;
  border-bottom: 1px solid var(--bg-muted);
}

.day-row:hover {
  background: var(--bg-card);
}

.day-today {
  background: rgba(137, 180, 250, 0.1);
}

.date-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 3rem;
  flex-shrink: 0;
  padding: var(--space-2);
  transition: border-color var(--transition-normal);
}

.day-number {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  line-height: 1;
  color: var(--text-primary);
}

.weekday {
  font-size: 10px;
  font-weight: var(--font-medium);
  line-height: 1;
  margin-top: var(--space-1);
  color: var(--text-secondary);
}

.day-sunday {
  color: var(--red-500);
}

.day-saturday {
  color: var(--blue-500);
}

.content-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-2);
}

.activity-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-left {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.summary-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.summary-value {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.summary-unit {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.record-count {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.empty-day {
  height: 100%;
  display: flex;
  align-items: center;
}

.add-hint {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--border-strong);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.day-row:hover .add-hint {
  opacity: 1;
}

.add-icon {
  width: 1rem;
  height: 1rem;
}
</style>
