<script setup lang="ts">
import AppFooter from './components/pages/AppFooter.vue';
import AppHeader from './components/pages/AppHeader.vue';
import ErrorBoundary from './components/common/ErrorBoundary.vue';
</script>

<template>
  <ErrorBoundary>
    <AppHeader />
    <main class="flex-grow w-full max-w-7xl min-h-[calc(100dvh-150px)] mx-auto md:px-4 md:py-8">
      <RouterView />
    </main>
    <AppFooter />
  </ErrorBoundary>
</template>
