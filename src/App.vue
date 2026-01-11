<script setup lang="ts">
import AppFooter from "./components/pages/AppFooter.vue"
import AppHeader from "./components/pages/AppHeader.vue"
import ErrorBoundary from "./components/common/ErrorBoundary.vue"
</script>

<template>
  <ErrorBoundary>
    <div class="app-container">
      <AppHeader />
      <main class="main">
        <RouterView />
      </main>
      <AppFooter />
    </div>
  </ErrorBoundary>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  transition: color var(--transition-normal), background var(--transition-normal);
}

.main {
  flex-grow: 1;
  width: 100%;
  max-width: var(--container-max);
  margin-inline: auto;
  padding: var(--space-0);
}

@media (width >= 768px) {
  .main {
    padding: var(--space-8) var(--space-4);
  }
}
</style>
