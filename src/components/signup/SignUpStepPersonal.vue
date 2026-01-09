<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <label for="lastName" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">姓</label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          :value="formValues.lastName"
          @input="
            onUpdate('lastName', ($event.target as HTMLInputElement).value)
          "
          required
          placeholder="山田"
          :disabled="isSignUpCreated"
          class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed" />
        <p v-if="formErrors.lastName" class="text-sm text-red-600 dark:text-red-400">
          {{ formErrors.lastName }}
        </p>
      </div>
      <div class="space-y-2">
        <label for="firstName" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">名</label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          :value="formValues.firstName"
          @input="
            onUpdate('firstName', ($event.target as HTMLInputElement).value)
          "
          required
          placeholder="太郎"
          :disabled="isSignUpCreated"
          class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed" />
        <p v-if="formErrors.firstName" class="text-sm text-red-600 dark:text-red-400">
          {{ formErrors.firstName }}
        </p>
      </div>
    </div>
    <div class="space-y-2">
      <label for="username" class="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >ユーザー名 (任意・6文字以上)</label
      >
      <input
        id="username"
        name="username"
        type="text"
        autocomplete="username"
        :value="formValues.username"
        @input="onUpdate('username', ($event.target as HTMLInputElement).value)"
        placeholder="aikido_taro"
        :disabled="isSignUpCreated"
        class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed" />
      <p v-if="formErrors.username" class="text-sm text-red-600 dark:text-red-400">
        {{ formErrors.username }}
      </p>
    </div>
    <div class="flex justify-between pt-2">
      <button
        type="button"
        @click="prevStep"
        :disabled="isSignUpCreated"
        class="rounded-md border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
        戻る
      </button>
      <button
        type="button"
        @click="handleNext"
        :disabled="isSignUpCreated"
        class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
        次へ
      </button>
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
