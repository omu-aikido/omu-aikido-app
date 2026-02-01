<template>
  <div class="flex items-center justify-center p-4">
    <div class="card w-full h-full mx-auto max-w-md">
      <div class="p-4 pt-2">
        <h1 class="text-2xl font-bold text-fg">サインアップ</h1>
      </div>
      <div class="p-6 pt-0">
        <ProgressIndicator :step="step" />
        <form @submit.prevent="handleSubmit">
          <div :class="step === 'basic' ? '' : 'hidden'">
            <SignUpStepBasic
              :form-values="formValues"
              :form-errors="formErrors"
              :is-sign-up-created="isSignUpCreated"
              :handle-next="handleNext"
              @update:form-value="setFormValue" />
          </div>

          <div :class="step === 'personal' ? '' : 'hidden'">
            <SignUpStepPersonal
              :form-values="formValues"
              :form-errors="formErrors"
              :is-sign-up-created="isSignUpCreated"
              :handle-next="handleNext"
              :prev-step="prevStep"
              @update:form-value="setFormValue" />
          </div>

          <div :class="step === 'profile' ? '' : 'hidden'">
            <SignUpStepProfile
              :form-values="formValues"
              :form-errors="formErrors"
              :is-sign-up-created="isSignUpCreated"
              :can-submit="!isSignUpCreated"
              :prev-step="prevStep"
              @update:form-value="setFormValue" />
          </div>

          <div class="col-span-3 my-4">
            <div id="clerk-captcha" />
          </div>
        </form>

        <div v-if="formErrors.general" class="mt-4 text-base text-red-500">
          {{ formErrors.general }}
        </div>
        <div v-if="clerkErrors.length > 0" class="mt-4 text-base text-red-500">
          <div v-for="(e, i) in clerkErrors" :key="i">
            {{ e.longMessage ?? e.message }}
          </div>
        </div>

        <hr class="my-6" />
        <div class="mt-2 text-center text-base text-fg-dim">
          既にアカウントをお持ちですか？<br />
          <RouterLink to="/sign-in" class="text-blue-500 underline hover:text-blue-600"> こちら </RouterLink>
          からサインインしてください。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSignUpForm } from '@/src/composable/useSignUpForm';
import ProgressIndicator from '@/src/components/signup/ProgressIndicator.vue';
import SignUpStepBasic from '@/src/components/signup/SignUpStepBasic.vue';
import SignUpStepPersonal from '@/src/components/signup/SignUpStepPersonal.vue';
import SignUpStepProfile from '@/src/components/signup/SignUpStepProfile.vue';

const router = useRouter();
const currentYear = new Date().getFullYear();

const {
  step,
  formValues,
  formErrors,
  clerkErrors,
  isSignUpCreated,
  validateStep,
  nextStep,
  prevStep,
  setFormValue,
  handleClerkSignUp,
} = useSignUpForm(currentYear);

onMounted(() => {
  document.title = 'サインアップ - 稽古記録';
});

const handleNext = () => {
  if (validateStep(step.value)) {
    nextStep();
  }
};

const handleSubmit = async () => {
  if (!validateStep('profile')) return;

  const success = await handleClerkSignUp();
  if (success) {
    router.push('/sign-up/verify');
  }
};
</script>
