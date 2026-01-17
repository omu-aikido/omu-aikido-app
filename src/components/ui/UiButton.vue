<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'discord';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  fullWidth: false,
  disabled: false,
  type: 'button',
});

const classes = computed(() => {
  return ['btn', `btn-${props.variant}`, `btn-${props.size}`, { 'btn-full': props.fullWidth }];
});
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid transparent;
  width: fit-content;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

/* Variants */
.btn-primary {
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  box-shadow: var(--shadow-sm);
}
.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-dim);
  box-shadow: var(--shadow-sm);
}
.btn-secondary:hover:not(:disabled) {
  background: var(--bg-muted);
}

.btn-danger {
  background: var(--red-500);
  color: white;
  border: none;
}
.btn-danger:hover:not(:disabled) {
  background: var(--red-600);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}
.btn-ghost:hover:not(:disabled) {
  background: var(--bg-muted);
  color: var(--text-primary);
}

.btn-discord {
  background: #5865f2;
  color: white;
}
.btn-discord:hover:not(:disabled) {
  background: #4752c4;
}

/* Sizes */
.btn-sm {
  padding: var(--space-1-5) var(--space-3);
  font-size: var(--text-sm);
}

.btn-md {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-base);
}

.btn-lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-lg);
}

/* Modifiers */
.btn-full {
  width: 100%;
}
</style>
