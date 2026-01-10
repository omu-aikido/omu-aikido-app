<script setup lang="ts"></script>

<template>
  <div class="card" data-testid="card">
    <slot />
  </div>
</template>

<style scoped>
.card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  padding: var(--space-4);
  width: 100%;
  height: 100%;
}

@media (min-width: 768px) {
  .card {
    padding: var(--space-5);
  }
}
</style>
