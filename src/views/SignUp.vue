<template>
  <div class="page-container">
    <Card class="form-card">
      <div class="card-header">
        <h1 class="form-title">サインアップ</h1>
      </div>
      <div class="card-body">
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

          <div class="captcha-container">
            <div id="clerk-captcha" />
          </div>
        </form>

        <div v-if="formErrors.general" class="error">
          {{ formErrors.general }}
        </div>
        <div v-if="clerkErrors.length > 0" class="error">
          <div v-for="(e, i) in clerkErrors" :key="i">
            {{ e.longMessage ?? e.message }}
          </div>
        </div>

        <hr class="divider" />
        <div class="footer-text">
          既にアカウントをお持ちですか？<br />
          <RouterLink to="/sign-in" class="link"> こちら </RouterLink>
          からサインインしてください。
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { useRouter } from "vue-router"
import { useSignUpForm } from "@/src/composable/useSignUpForm"
import Card from "@/src/components/ui/UiCard.vue"
import ProgressIndicator from "@/src/components/signup/ProgressIndicator.vue"
import SignUpStepBasic from "@/src/components/signup/SignUpStepBasic.vue"
import SignUpStepPersonal from "@/src/components/signup/SignUpStepPersonal.vue"
import SignUpStepProfile from "@/src/components/signup/SignUpStepProfile.vue"

const router = useRouter()
const currentYear = new Date().getFullYear()

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
} = useSignUpForm(currentYear)

onMounted(() => {
  document.title = "サインアップ - 稽古記録"
})

const handleNext = () => {
  if (validateStep(step.value)) {
    nextStep()
  }
}

const handleSubmit = async () => {
  if (!validateStep("profile")) return

  const success = await handleClerkSignUp()
  if (success) {
    router.push("/sign-up/verify")
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.form-card {
  margin-inline: auto;
  max-width: 28rem;
}

.card-header {
  padding: var(--space-4);
  padding-top: var(--space-2);
}

.form-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.card-body {
  padding: var(--space-6);
  padding-top: 0;
}

.hidden {
  display: none;
}

.captcha-container {
  grid-column: span 3;
  margin: var(--space-4) 0;
}

.error {
  margin-top: var(--space-4);
  font-size: var(--text-base);
  color: var(--red-500);
}

.divider {
  margin: var(--space-6) 0;
}

.footer-text {
  margin-top: var(--space-2);
  text-align: center;
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.link {
  color: var(--accent);
  text-decoration: underline;
}

.link:hover {
  color: var(--accent-hover);
}
</style>
