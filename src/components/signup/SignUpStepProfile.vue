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

    <div class="field">
      <label for="joinedAt" class="label">入部年度</label>
      <input
        id="joinedAt"
        type="number"
        :value="formValues.joinedAt"
        :disabled="isSignUpCreated"
        class="input"
        @input="onUpdate('joinedAt', Number(($event.target as HTMLInputElement).value))" />
      <p v-if="formErrors.joinedAt" class="error">
        {{ formErrors.joinedAt }}
      </p>
    </div>

    <div class="field">
      <label for="getGradeAt" class="label">取得年月日 (任意)</label>
      <input
        id="getGradeAt"
        type="date"
        :value="formValues.getGradeAt"
        :disabled="isSignUpCreated"
        class="input"
        @input="onUpdate('getGradeAt', ($event.target as HTMLInputElement).value)" />
      <p v-if="formErrors.getGradeAt" class="error">
        {{ formErrors.getGradeAt }}
      </p>
    </div>

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
      <button type="button" :disabled="isSignUpCreated" class="btn-secondary" @click="prevStep">戻る</button>
      <button type="submit" :disabled="!canSubmit" class="btn-primary">
        {{ isSignUpCreated ? "登録中..." : "登録" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { year as yearOptions } from "@/share/lib/year"
import { grade as gradeOptions } from "@/share/lib/grade"
import type { SignUpFormData, FormErrors } from "@/src/composable/useSignUpForm"

const props = defineProps<{
  formValues: Partial<SignUpFormData>
  formErrors: Partial<FormErrors>
  isSignUpCreated: boolean
  canSubmit: boolean
  prevStep: () => void
}>()

const emit = defineEmits<{
  (e: "update:formValue", key: keyof SignUpFormData, value: any): void
}>()

const onUpdate = (key: keyof SignUpFormData, value: any) => {
  emit("update:formValue", key, value)
}
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

.input,
.select {
  width: -webkit-fill-available;
  height: -webkit-fit-content;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-card);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
  color: var(--text-primary);
  transition: box-shadow var(--transition-normal);
}

.input:focus,
.select:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.input:disabled,
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
  border: 1px solid var(--border);
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

.btn-primary {
  border-radius: var(--radius-md);
  background: var(--primary);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: white;
  border: none;
  cursor: pointer;
  transition: background var(--transition-normal);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  border-radius: var(--radius-md);
  background: transparent;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-muted);
}

.btn-secondary:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
