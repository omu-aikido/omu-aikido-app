<template>
  <div class="form-container">
    <div class="grid-2">
      <div class="field">
        <label for="year" class="label">学年</label>
        <select
          id="year"
          :value="formValues.year"
          :disabled="isSignUpCreated"
          class="select"
          @change="onUpdate('year', ($event.target as HTMLSelectElement).value)">
          <option v-for="y in yearOptions" :key="y.year" :value="y.year">
            {{ y.name }}
          </option>
        </select>
        <p v-if="formErrors.year" class="error">
          {{ formErrors.year }}
        </p>
      </div>
      <div class="field">
        <label for="grade" class="label">級段位</label>
        <select
          id="grade"
          :value="formValues.grade"
          :disabled="isSignUpCreated"
          class="select"
          @change="onUpdate('grade', Number(($event.target as HTMLSelectElement).value))">
          <option v-for="g in gradeOptions" :key="g.grade" :value="g.grade">
            {{ g.name }}
          </option>
        </select>
        <p v-if="formErrors.grade" class="error">
          {{ formErrors.grade }}
        </p>
      </div>
    </div>

    <Input
      id="joinedAt"
      :model-value="formValues.joinedAt"
      type="number"
      label="入部年度"
      :disabled="isSignUpCreated"
      :error="formErrors.joinedAt"
      @update:model-value="onUpdate('joinedAt', Number($event))" />

    <Input
      id="getGradeAt"
      :model-value="formValues.getGradeAt"
      type="date"
      label="取得年月日 (任意)"
      :disabled="isSignUpCreated"
      :error="formErrors.getGradeAt"
      @update:model-value="onUpdate('getGradeAt', $event)" />

    <div class="checkbox-field">
      <input
        id="legalAccepted"
        type="checkbox"
        :checked="formValues.legalAccepted"
        :disabled="isSignUpCreated"
        class="checkbox"
        @change="onUpdate('legalAccepted', ($event.target as HTMLInputElement).checked)" />
      <label for="legalAccepted" class="checkbox-label"> 利用規約とプライバシーポリシーに同意します。 </label>
    </div>
    <p v-if="formErrors.legalAccepted" class="error">
      {{ formErrors.legalAccepted }}
    </p>

    <div class="actions-between">
      <Button type="button" variant="secondary" :disabled="isSignUpCreated" @click="prevStep"> 戻る </Button>
      <Button type="submit" variant="primary" :disabled="!canSubmit">
        {{ isSignUpCreated ? '登録中...' : '登録' }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { grade as gradeOptions } from '@/share/lib/grade';
import { year as yearOptions } from '@/share/lib/year';
import Button from '@/src/components/ui/UiButton.vue';
import Input from '@/src/components/ui/UiInput.vue';
import type { FormErrors, SignUpFormData } from '@/src/composable/useSignUpForm';

defineProps<{
  formValues: Partial<SignUpFormData>;
  formErrors: Partial<FormErrors>;
  isSignUpCreated: boolean;
  canSubmit: boolean;
  prevStep: () => void;
}>();

const emit = defineEmits<{
  (e: 'update:formValue', key: keyof SignUpFormData, value: string | number | boolean): void;
}>();

const onUpdate = (key: keyof SignUpFormData, value: string | number | boolean) => {
  emit('update:formValue', key, value);
};
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.label {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.select {
  width: -webkit-fill-available;
  height: fit-content;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-dim);
  background: var(--bg-card);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
  color: var(--text-primary);
  transition: box-shadow var(--transition-normal);
}

.select:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.checkbox {
  width: 1rem;
  height: 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-dim);
  accent-color: var(--primary);
}

.checkbox-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.error {
  font-size: var(--text-sm);
  color: var(--red-500);
}

.actions-between {
  display: flex;
  justify-content: space-between;
  padding-top: var(--space-2);
}
</style>
