<script setup lang="ts">
import Input from '@/src/components/ui/UiInput.vue';
import { format } from 'date-fns';
import { ref, watch } from 'vue';

interface Props {
  loading?: boolean;
  initialDate?: string;
}

interface Emits {
  (e: 'submit', date: string, period: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const newDate = ref(props.initialDate || format(new Date(), 'yyyy-MM-dd'));
const newPeriod = ref(1.5);

watch(
  () => props.initialDate,
  (val) => {
    if (val) newDate.value = val;
  }
);

const handleSubmit = () => {
  emit('submit', newDate.value, newPeriod.value);
  newDate.value = format(new Date(), 'yyyy-MM-dd');
  newPeriod.value = 1.5;
};
</script>

<template>
  <div class="p-2">
    <form class="flex flex-col gap-4" data-testid="activity-form" @submit.prevent="handleSubmit">
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

      <button
        type="submit"
        class="btn bg-blue-500 text-white hover:bg-blue-600 focus-visible:(outline-none ring-2 ring-blue-500) w-full"
        :disabled="loading"
        data-testid="submit-btn">
        {{ loading ? '保存中...' : '記録を追加' }}
      </button>
    </form>
  </div>
</template>
