<template>
  <div class="form-container">
    <div class="grid-2">
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

    <div class="actions-between">
      <Button type="button" variant="secondary" :disabled="isSignUpCreated" @click="prevStep"> 戻る </Button>
      <Button type="button" variant="primary" :disabled="isSignUpCreated" @click="handleNext"> 次へ </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "@/src/components/ui/UiButton.vue";
import Input from "@/src/components/ui/UiInput.vue";
import type { FormErrors, SignUpFormData } from "@/src/composable/useSignUpForm";

defineProps<{
  formValues: Partial<SignUpFormData>
  formErrors: Partial<FormErrors>
  isSignUpCreated: boolean
  handleNext: () => void
  prevStep: () => void
}>()

const emit = defineEmits<{
  (e: "update:formValue", key: keyof SignUpFormData, value: string | number): void
}>()

const onUpdate = (key: keyof SignUpFormData, value: string | number) => {
  emit("update:formValue", key, value)
}
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.actions-between {
  display: flex;
  justify-content: space-between;
  padding-top: var(--space-2);
}
</style>
