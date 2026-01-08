<template>
  <div
    class="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900 px-4"
    data-testid="not-found-page">
    <div class="text-center w-full max-w-lg">
      <img src="/404%20NotFound.png" alt="404 Not Found" class="w-full h-auto mb-8 mx-auto" />
      <h1 class="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">ページが見つかりません</h1>
      <p class="text-neutral-600 dark:text-neutral-400 mb-8">
        お探しのページは存在しないか、移動または削除された可能性があります。
      </p>
      <RouterLink
        to="/"
        class="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        data-testid="home-link">
        ホームに戻る
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router"
</script>
