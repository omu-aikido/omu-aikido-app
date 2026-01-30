<script setup lang="ts">
import AppFooter from './components/pages/AppFooter.vue';
import AppHeader from './components/pages/AppHeader.vue';
import ErrorBoundary from './components/common/ErrorBoundary.vue';
</script>

<template>
  <ErrorBoundary>
    <AppHeader />
    <main>
      <RouterView />
    </main>
    <AppFooter />
  </ErrorBoundary>
</template>

<style scoped>
main {
  flex-grow: 1;
  width: 100%;
  max-width: var(--container-max);
  min-height: calc(100dvh - 150px);
  margin-inline: auto;
}

@media (width >= 768px) {
  main {
    padding: var(--space-8) var(--space-4);
  }
}
</style>
