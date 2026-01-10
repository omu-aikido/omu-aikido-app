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
  <div class="container">
    <form class="form" data-testid="activity-form" @submit.prevent="handleSubmit">
      <div class="field">
        <label for="date" class="label">日付</label>
        <div class="input-wrapper">
          <input id="date" v-model="newDate" type="date" required class="input" data-testid="date-input" />
        </div>
      </div>
      <div class="field">
        <label for="period" class="label">時間 (時間)</label>
        <input
          id="period"
          v-model.number="newPeriod"
          type="number"
          step="0.5"
          min="0.5"
          max="8"
          required
          class="input"
          data-testid="period-input" />
      </div>
      <button type="submit" :disabled="loading" class="submit-btn" data-testid="submit-btn">
        {{ loading ? "保存中..." : "記録を追加" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.container {
  padding: var(--space-2);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.label {
  display: block;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.input-wrapper {
  flex: 1;
  width: 100%;
  line-height: normal;
}

.input {
  width: -webkit-fill-available;
  height:var(--text-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  appearance: none;
  color: var(--text-primary);
  background: var(--bg-card);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
  transition: box-shadow var(--transition-normal);
}

.input::placeholder {
  color: var(--border-strong);
}

.input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
  border-color: transparent;
}

.submit-btn {
  width: 100%;
  border-radius: var(--radius-md);
  background: var(--primary);
  padding: var(--space-2-5) 0;

  /* Generate --space-2-5 inline since it wasn't defined */
  padding-block: 0.625rem;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: white;
  border: none;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.submit-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary), 0 0 0 4px var(--bg-card);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}
</style>
