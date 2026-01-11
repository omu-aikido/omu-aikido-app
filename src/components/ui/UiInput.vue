<script setup lang="ts">
interface Props {
  modelValue?: string | number | null | undefined
  type?: string
  placeholder?: string
  disabled?: boolean
  label?: string
  id?: string
  error?: string | undefined
  required?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: "",
  type: "text",
  placeholder: "",
  disabled: false,
  required: false,
})

defineEmits<{
  (e: "update:modelValue", value: string | number): void
}>()
</script>

<template>
  <div class="input-wrapper">
    <label v-if="label" :for="id" class="label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <div class="input-container">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="['input', { 'input-error': error }]"
        class="input"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
      <div v-if="$slots.suffix" class="suffix">
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="error" class="error-text">{{ error }}</p>
  </div>
</template>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1-5);
  width: 100%;
}

.label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.required {
  color: var(--red-500);
  margin-left: var(--space-0-5);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
  color: var(--text-primary);
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.input::placeholder {
  color: var(--text-placeholder);
}

.input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
  border-color: var(--primary);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--bg-muted);
}

.input-error {
  border-color: var(--red-500);
}

.input-error:focus {
  box-shadow: 0 0 0 2px var(--red-500);
}

.error-text {
  font-size: var(--text-xs);
  color: var(--red-500);
}

.suffix {
  position: absolute;
  right: var(--space-3);
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  pointer-events: none;
}
</style>
