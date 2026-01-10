<template>
  <div class="form-container">
    <div class="field">
      <label for="email" class="label">メールアドレス</label>
      <input
        id="email"
        name="email"
        type="email"
        :value="formValues.email"
        autocomplete="email"
        required
        placeholder="name@example.com"
        :disabled="isSignUpCreated"
        class="input"
        @input="onUpdate('email', ($event.target as HTMLInputElement).value)" />
      <p v-if="formErrors.email" class="error">
        {{ formErrors.email }}
      </p>
    </div>
    <div class="field">
      <label for="password" class="label">パスワード</label>
      <div class="input-wrapper">
        <input
          id="password"
          name="password"
          autocomplete="new-password"
          :type="showPassword ? 'text' : 'password'"
          :value="formValues.newPassword"
          required
          placeholder="10文字以上のパスワード"
          :disabled="isSignUpCreated"
          class="input input-with-icon"
          @input="onUpdate('newPassword', ($event.target as HTMLInputElement).value)" />
        <button
          type="button"
          :disabled="isSignUpCreated"
          class="icon-btn"
          :aria-label="showPassword ? 'パスワードを隠す' : 'パスワードを表示'"
          @click="showPassword = !showPassword">
          <svg
            v-if="!showPassword"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="icon">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="icon">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        </button>
      </div>
      <p v-if="formErrors.newPassword" class="error">
        {{ formErrors.newPassword }}
      </p>
    </div>
    <div class="field">
      <label for="password-confirm" class="label">パスワード（確認）</label>
      <div class="input-wrapper">
        <input
          id="password-confirm"
          v-model="passwordConfirm"
          name="password-confirm"
          autocomplete="new-password"
          :type="showPasswordConfirm ? 'text' : 'password'"
          required
          placeholder="パスワードを再入力"
          :disabled="isSignUpCreated"
          class="input input-with-icon"
          @input="validatePasswordMatch" />
        <button
          type="button"
          :disabled="isSignUpCreated"
          class="icon-btn"
          :aria-label="showPasswordConfirm ? 'パスワードを隠す' : 'パスワードを表示'"
          @click="showPasswordConfirm = !showPasswordConfirm">
          <svg
            v-if="!showPasswordConfirm"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="icon">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="icon">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        </button>
      </div>
      <p v-if="passwordConfirmError" class="error">
        {{ passwordConfirmError }}
      </p>
    </div>
    <div class="actions-end">
      <button type="button" :disabled="isSignUpCreated || !canProceed" class="btn-primary" @click="handleNextClick">
        次へ
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue"
import type { SignUpFormData, FormErrors } from "@/src/composable/useSignUpForm"

const props = defineProps<{
  formValues: Partial<SignUpFormData>
  formErrors: Partial<FormErrors>
  isSignUpCreated: boolean
  handleNext: () => void
}>()

const emit = defineEmits<{
  (e: "update:formValue", key: keyof SignUpFormData, value: any): void
}>()

const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const passwordConfirm = ref("")
const passwordConfirmError = ref("")

const onUpdate = (key: keyof SignUpFormData, value: any) => {
  emit("update:formValue", key, value)
}

const validatePasswordMatch = () => {
  if (passwordConfirm.value && passwordConfirm.value !== props.formValues.newPassword) {
    passwordConfirmError.value = "パスワードが一致しません"
  } else {
    passwordConfirmError.value = ""
  }
}

const canProceed = computed(() => {
  return (
    props.formValues.email &&
    props.formValues.newPassword &&
    props.formValues.newPassword.length >= 10 &&
    passwordConfirm.value &&
    passwordConfirm.value === props.formValues.newPassword
  )
})

const handleNextClick = () => {
  if (canProceed.value) {
    props.handleNext()
  }
}

watch(
  () => props.formValues.newPassword,
  newPassword => {
    if (newPassword && !passwordConfirm.value) {
      passwordConfirm.value = newPassword
    }
    validatePasswordMatch()
  }
)
</script>

<style scoped>
.form-container {
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
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.input {
  width: -webkit-fill-available;
  height: -webkit-fit-content;
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

.input-wrapper {
  position: relative;
}

.input-with-icon {
  padding-right: 2.5rem;
}

.icon-btn {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--transition-normal);
}

.icon-btn:hover:not(:disabled) {
  color: var(--text-primary);
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.error {
  font-size: var(--text-sm);
  color: var(--red-500);
}

.actions-end {
  display: flex;
  justify-content: flex-end;
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
</style>
