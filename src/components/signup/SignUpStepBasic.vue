<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <label for="email" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">メールアドレス</label>
      <input
        id="email"
        name="email"
        type="email"
        :value="formValues.email"
        autocomplete="email"
        @input="onUpdate('email', ($event.target as HTMLInputElement).value)"
        required
        placeholder="name@example.com"
        :disabled="isSignUpCreated"
        class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed" />
      <p v-if="formErrors.email" class="text-sm text-red-600 dark:text-red-400">
        {{ formErrors.email }}
      </p>
    </div>
    <div class="space-y-2">
      <label for="password" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">パスワード</label>
      <div class="relative">
        <input
          id="password"
          name="password"
          autocomplete="new-password"
          :type="showPassword ? 'text' : 'password'"
          :value="formValues.newPassword"
          @input="
            onUpdate('newPassword', ($event.target as HTMLInputElement).value)
          "
          required
          placeholder="10文字以上のパスワード"
          :disabled="isSignUpCreated"
          class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 pr-10 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed" />
        <button
          type="button"
          @click="showPassword = !showPassword"
          :disabled="isSignUpCreated"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
          :aria-label="showPassword ? 'パスワードを隠す' : 'パスワードを表示'">
          <svg
            v-if="!showPassword"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5">
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
            class="w-5 h-5">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        </button>
      </div>
      <p v-if="formErrors.newPassword" class="text-sm text-red-600 dark:text-red-400">
        {{ formErrors.newPassword }}
      </p>
    </div>
    <div class="space-y-2">
      <label for="password-confirm" class="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >パスワード（確認）</label
      >
      <div class="relative">
        <input
          id="password-confirm"
          name="password-confirm"
          autocomplete="new-password"
          :type="showPasswordConfirm ? 'text' : 'password'"
          v-model="passwordConfirm"
          @input="validatePasswordMatch"
          required
          placeholder="パスワードを再入力"
          :disabled="isSignUpCreated"
          class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 pr-10 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed" />
        <button
          type="button"
          @click="showPasswordConfirm = !showPasswordConfirm"
          :disabled="isSignUpCreated"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
          :aria-label="
            showPasswordConfirm ? 'パスワードを隠す' : 'パスワードを表示'
          ">
          <svg
            v-if="!showPasswordConfirm"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5">
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
            class="w-5 h-5">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        </button>
      </div>
      <p v-if="passwordConfirmError" class="text-sm text-red-600 dark:text-red-400">
        {{ passwordConfirmError }}
      </p>
    </div>
    <div class="flex justify-end pt-2">
      <button
        type="button"
        @click="handleNextClick"
        :disabled="isSignUpCreated || !canProceed"
        class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
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
  if (
    passwordConfirm.value &&
    passwordConfirm.value !== props.formValues.newPassword
  ) {
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
