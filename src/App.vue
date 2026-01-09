<script setup lang="ts">
import AppFooter from "./components/pages/AppFooter.vue"
import AppHeader from "./components/pages/AppHeader.vue"
import ErrorBoundary from "./components/common/ErrorBoundary.vue"
</script>

<template>
  <ErrorBoundary>
    <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col transition-colors duration-200">
      <AppHeader />
      <main class="grow container mx-auto px-4 py-4 md:py-8 max-w-4xl w-full">
        <RouterView />
      </main>
      <AppFooter />
    </div>
  </ErrorBoundary>
</template>

<style scoped></style>
