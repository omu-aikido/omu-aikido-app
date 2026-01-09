<script setup lang="ts">
import { ref, watch } from "vue"
import { format } from "date-fns"

interface Props {
  loading?: boolean
  initialDate?: string
}

interface Emits {
  (e: "submit", date: string, period: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const newDate = ref(props.initialDate || format(new Date(), "yyyy-MM-dd"))
const newPeriod = ref(1.5)

watch(
  () => props.initialDate,
  val => {
    if (val) newDate.value = val
  }
)

const handleSubmit = () => {
  emit("submit", newDate.value, newPeriod.value)
  newDate.value = format(new Date(), "yyyy-MM-dd")
  newPeriod.value = 1.5
}
</script>

<template>
  <div class="space-y-4 p-2">
    <form @submit.prevent="handleSubmit" class="space-y-4" data-testid="activity-form">
      <div class="space-y-2">
        <label for="date" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">日付</label>
        <input
          type="date"
          id="date"
          v-model="newDate"
          required
          class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          data-testid="date-input" />
      </div>
      <div class="space-y-2">
        <label for="period" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">時間 (時間)</label>
        <input
          type="number"
          id="period"
          v-model.number="newPeriod"
          step="0.5"
          min="0.5"
          max="8"
          required
          class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          data-testid="period-input" />
      </div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-md bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        data-testid="submit-btn">
        {{ loading ? "保存中..." : "記録を追加" }}
      </button>
    </form>
  </div>
</template>
