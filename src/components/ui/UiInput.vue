<script setup lang="ts">
interface Props {
  modelValue?: string | number | null | undefined;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  id?: string;
  error?: string | undefined;
  required?: boolean;
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  required: false,
});

defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
}>();

defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" :for="id" class="text-sm font-medium text-fg-dim">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <div class="relative flex items-center">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'w-full px-3 py-2 text-base text-fg bg-bg-card border border-border rounded-md transition-all',
          'placeholder:text-fg-muted focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-muted',
          error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : '',
        ]"
        v-bind="$attrs"
        @input="
          $emit(
            'update:modelValue',
            type === 'number'
              ? Number(($event.target as HTMLInputElement).value)
              : ($event.target as HTMLInputElement).value
          )
        " />
      <div v-if="$slots.suffix" class="absolute right-3 flex items-center text-fg-dim pointer-events-none">
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
  </div>
</template>
