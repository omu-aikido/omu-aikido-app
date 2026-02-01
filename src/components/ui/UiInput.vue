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
    <label v-if="label" :for="id" class="form-label">
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
        :class="['input-base', error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : '']"
        uno-placeholder="text-overlay1"
        v-bind="$attrs"
        @input="
          $emit(
            'update:modelValue',
            type === 'number'
              ? Number(($event.target as HTMLInputElement).value)
              : ($event.target as HTMLInputElement).value
          )
        " />
      <div v-if="$slots.suffix" class="absolute right-3 flex items-center text-subtext pointer-events-none">
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
  </div>
</template>
