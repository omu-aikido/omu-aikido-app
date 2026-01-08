<template>
  <div class="flex justify-center items-center my-4" data-testid="progress-indicator">
    <div
      :class="[
        'text-sm p-2',
        step === 'basic'
          ? 'text-blue-600 dark:text-blue-400 font-semibold'
          : 'text-green-600 dark:text-green-400',
      ]"
      data-testid="step-basic">
      基本情報
    </div>
    <div class="flex-auto border-t-2 transition duration-500 ease-in-out border-gray-300 dark:border-neutral-700"></div>
    <div
      :class="[
        'text-sm p-2',
        step === 'personal'
          ? 'text-blue-600 dark:text-blue-400 font-semibold'
          : step === 'profile'
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-500 dark:text-neutral-500',
      ]"
      data-testid="step-personal">
      個人情報
    </div>
    <div class="flex-auto border-t-2 transition duration-500 ease-in-out border-gray-300 dark:border-neutral-700"></div>
    <div
      :class="[
        'text-sm p-2',
        step === 'profile'
          ? 'text-blue-600 dark:text-blue-400 font-semibold'
          : 'text-gray-500 dark:text-neutral-500',
      ]"
      data-testid="step-profile">
      プロフィール
    </div>
  </div>
</template>

<script setup lang="ts">
type SignUpStep = "basic" | "personal" | "profile"

defineProps<{ step: SignUpStep }>()
</script>
