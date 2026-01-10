<template>
  <div class="form-container">
    <div class="grid-2">
      <div class="field">
        <label for="lastName" class="label">姓</label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          :value="formValues.lastName"
          required
          placeholder="山田"
          :disabled="isSignUpCreated"
          class="input"
          @input="onUpdate('lastName', ($event.target as HTMLInputElement).value)" />
        <p v-if="formErrors.lastName" class="error">
          {{ formErrors.lastName }}
        </p>
      </div>
      <div class="field">
        <label for="firstName" class="label">名</label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          :value="formValues.firstName"
          required
          placeholder="太郎"
          :disabled="isSignUpCreated"
          class="input"
          @input="onUpdate('firstName', ($event.target as HTMLInputElement).value)" />
        <p v-if="formErrors.firstName" class="error">
          {{ formErrors.firstName }}
        </p>
      </div>
    </div>
    <div class="field">
      <label for="username" class="label">ユーザー名 (任意・6文字以上)</label>
      <input
        id="username"
        name="username"
        type="text"
        autocomplete="username"
        :value="formValues.username"
        placeholder="aikido_taro"
        :disabled="isSignUpCreated"
        class="input"
        @input="onUpdate('username', ($event.target as HTMLInputElement).value)" />
      <p v-if="formErrors.username" class="error">
        {{ formErrors.username }}
      </p>
    </div>
    <div class="actions-between">
      <button type="button" :disabled="isSignUpCreated" class="btn-secondary" @click="prevStep">戻る</button>
      <button type="button" :disabled="isSignUpCreated" class="btn-primary" @click="handleNext">次へ</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SignUpFormData, FormErrors } from "@/src/composable/useSignUpForm"

const props = defineProps<{
  formValues: Partial<SignUpFormData>
  formErrors: Partial<FormErrors>
  isSignUpCreated: boolean
  handleNext: () => void
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

.input {
  width: -webkit-fill-available;
  height: fit-content;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-card);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: box-shadow var(--transition-normal);
}

.input::placeholder {
  color: var(--border-strong);
}

.input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
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

.btn-secondary:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-muted);
}
</style>
