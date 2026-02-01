<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-4">
      <Input
        id="lastName"
        name="lastName"
        label="姓"
        :model-value="formValues.lastName"
        required
        placeholder="山田"
        :disabled="isSignUpCreated"
        :error="formErrors.lastName"
        @update:model-value="onUpdate('lastName', $event)" />
      <Input
        id="firstName"
        name="firstName"
        label="名"
        :model-value="formValues.firstName"
        required
        placeholder="太郎"
        :disabled="isSignUpCreated"
        :error="formErrors.firstName"
        @update:model-value="onUpdate('firstName', $event)" />
    </div>

    <Input
      id="username"
      name="username"
      label="ユーザー名 (任意・6文字以上)"
      type="text"
      autocomplete="username"
      :model-value="formValues.username"
      placeholder="aikido_taro"
      :disabled="isSignUpCreated"
      :error="formErrors.username"
      @update:model-value="onUpdate('username', $event)" />

    <div class="flex justify-between pt-2">
      <button
        type="button"
        class="btn bg-bg-card text-fg-dim border border-bg-dim hover:bg-bg-muted"
        :disabled="isSignUpCreated"
        @click="prevStep">
        戻る
      </button>
      <button
        type="button"
        class="btn bg-blue-500 text-white hover:bg-blue-600 focus-visible:(outline-none ring-2 ring-blue-500)"
        :disabled="isSignUpCreated"
        @click="handleNext">
        次へ
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Input from '@/src/components/ui/UiInput.vue';
import type { FormErrors, SignUpFormData } from '@/src/composable/useSignUpForm';

defineProps<{
  formValues: Partial<SignUpFormData>;
  formErrors: Partial<FormErrors>;
  isSignUpCreated: boolean;
  handleNext: () => void;
  prevStep: () => void;
}>();

const emit = defineEmits<{
  (e: 'update:formValue', key: keyof SignUpFormData, value: string | number): void;
}>();

const onUpdate = (key: keyof SignUpFormData, value: string | number) => {
  emit('update:formValue', key, value);
};
</script>
