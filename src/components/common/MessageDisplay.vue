<template>
  <div v-if="errorMessage" class="message error" data-testid="error-message">
    {{ errorMessage }}
  </div>

  <div v-if="successMessage" class="message success" data-testid="success-message">
    {{ successMessage }}
  </div>
</template>

<script setup lang="ts">
defineProps<{ errorMessage?: string; successMessage?: string }>();
</script>

<style scoped>
.message {
  margin-top: var(--space-4);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.error {
  background: var(--error-bg);
  border: 1px solid var(--red-500);
  color: var(--red-500);
}

.success {
  background: rgb(34 197 94 / 10%);
  border: 1px solid var(--green-500);
  color: var(--green-500);
}
</style>
