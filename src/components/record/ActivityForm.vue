<script setup lang="ts">
import Button from "@/src/components/ui/UiButton.vue"
import Input from "@/src/components/ui/UiInput.vue"
import { format } from "date-fns"
import { ref, watch } from "vue"

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
      <Input id="date" v-model="newDate" label="日付" type="date" required data-testid="date-input" />

      <Input
        id="period"
        v-model.number="newPeriod"
        label="時間 (時間)"
        type="number"
        step="0.5"
        min="0.5"
        max="8"
        required
        data-testid="period-input" />

      <Button type="submit" variant="primary" full-width :disabled="loading" data-testid="submit-btn">
        {{ loading ? "保存中..." : "記録を追加" }}
      </Button>
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
</style>
