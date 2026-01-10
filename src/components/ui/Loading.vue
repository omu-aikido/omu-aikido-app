<script setup lang="ts"></script>

<template>
  <div class="loading" data-testid="loading-container">
    <div class="spinner" data-testid="loading-spinner" />
    <p class="text">Loading...</p>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 12.5rem;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: var(--space-4);
  border: 4px solid var(--bg-muted-active);
  border-top-color: var(--primary);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

.text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
