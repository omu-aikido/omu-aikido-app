<template>
  <div class="stack">
    <Input
      id="email"
      name="email"
      type="email"
      :model-value="formValues.email"
      label="メールアドレス"
      autocomplete="email"
      required
      placeholder="name@example.com"
      :disabled="isSignUpCreated"
      :error="formErrors.email"
      @update:model-value="onUpdate('email', $event)" />

    <div class="flex flex-col gap-2">
      <Input
        id="password"
        name="password"
        autocomplete="new-password"
        :type="showPassword ? 'text' : 'password'"
        :model-value="formValues.newPassword"
        label="パスワード"
        required
        placeholder="10文字以上のパスワード"
        :disabled="isSignUpCreated"
        :error="formErrors.newPassword"
        @update:model-value="onUpdate('newPassword', $event)">
        <template #suffix>
          <button
            type="button"
            :disabled="isSignUpCreated"
            class="bg-transparent border-none text-subtext cursor-pointer transition-colors p-0 flex items-center justify-center hover:text disabled:opacity-50 disabled:cursor-not-allowed"
            :aria-label="showPassword ? 'パスワードを隠す' : 'パスワードを表示'"
            @click="showPassword = !showPassword">
            <svg
              v-if="!showPassword"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          </button>
        </template>
      </Input>
    </div>

    <div class="flex flex-col gap-2">
      <Input
        id="password-confirm"
        v-model="passwordConfirm"
        name="password-confirm"
        autocomplete="new-password"
        :type="showPasswordConfirm ? 'text' : 'password'"
        label="パスワード（確認）"
        required
        placeholder="パスワードを再入力"
        :disabled="isSignUpCreated"
        :error="passwordConfirmError"
        @input="validatePasswordMatch">
        <template #suffix>
          <button
            type="button"
            :disabled="isSignUpCreated"
            class="bg-transparent border-none text-subtext cursor-pointer transition-colors p-0 flex items-center justify-center hover:text disabled:opacity-50 disabled:cursor-not-allowed"
            :aria-label="showPasswordConfirm ? 'パスワードを隠す' : 'パスワードを表示'"
            @click="showPasswordConfirm = !showPasswordConfirm">
            <svg
              v-if="!showPasswordConfirm"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          </button>
        </template>
      </Input>
    </div>

    <div class="flex justify-end pt-2">
      <button type="button" class="btn-primary" :disabled="isSignUpCreated || !canProceed" @click="handleNextClick">
        次へ
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Input from '@/src/components/ui/UiInput.vue';
import type { FormErrors, SignUpFormData } from '@/src/composable/useSignUpForm';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  formValues: Partial<SignUpFormData>;
  formErrors: Partial<FormErrors>;
  isSignUpCreated: boolean;
  handleNext: () => void;
}>();

const emit = defineEmits<{
  (e: 'update:formValue', key: keyof SignUpFormData, value: string | number): void;
}>();

const showPassword = ref(false);
const showPasswordConfirm = ref(false);
const passwordConfirm = ref('');
const passwordConfirmError = ref('');

const onUpdate = (key: keyof SignUpFormData, value: string | number) => {
  emit('update:formValue', key, value);
};

const validatePasswordMatch = () => {
  if (passwordConfirm.value && passwordConfirm.value !== props.formValues.newPassword) {
    passwordConfirmError.value = 'パスワードが一致しません';
  } else {
    passwordConfirmError.value = '';
  }
};

const canProceed = computed(() => {
  return (
    props.formValues.email &&
    props.formValues.newPassword &&
    props.formValues.newPassword.length >= 10 &&
    passwordConfirm.value &&
    passwordConfirm.value === props.formValues.newPassword
  );
});

const handleNextClick = () => {
  if (canProceed.value) {
    props.handleNext();
  }
};

watch(
  () => props.formValues.newPassword,
  (newPassword) => {
    if (newPassword && !passwordConfirm.value) {
      passwordConfirm.value = newPassword;
    }
    validatePasswordMatch();
  }
);
</script>
