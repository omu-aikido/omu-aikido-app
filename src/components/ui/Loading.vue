<template>
  <div class="flex flex-col items-center justify-center min-h-50" data-testid="loading-container">
    <div
      class="w-10 h-10 mb-4 border-4 border-neutral-200 dark:border-neutral-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"
      data-testid="loading-spinner" />
    <p class="text-sm text-neutral-600 dark:text-neutral-400">Loading...</p>
  </div>
</template>

<script setup lang="ts"></script>
