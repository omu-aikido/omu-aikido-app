<template>
  <div
    v-if="errorMessage"
    class="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-300 text-sm"
    data-testid="error-message">
    {{ errorMessage }}
  </div>

  <div
    v-if="successMessage"
    class="mt-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded text-green-700 dark:text-green-300 text-sm"
    data-testid="success-message">
    {{ successMessage }}
  </div>
</template>

<script setup lang="ts">
defineProps<{ errorMessage?: string; successMessage?: string }>()
</script>
