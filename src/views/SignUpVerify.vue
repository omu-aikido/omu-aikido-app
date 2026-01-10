<template>
  <div class="page-container">
    <Card class="card-container">
      <div class="card-header">
        <h1 class="title">認証コードの確認</h1>
        <p class="subtitle">メールアドレスに送信された認証コードを入力してください。</p>
      </div>
      <div class="card-body">
        <form class="verify-form" @submit.prevent="handleVerify">
          <div class="field">
            <label for="code" class="label">認証コード</label>
            <input
              id="code"
              v-model="code"
              type="text"
              name="code"
              required
              placeholder="123456"
              :disabled="isLoading"
              class="input" />
          </div>

          <div v-if="error" class="error">
            {{ error }}
          </div>

          <button type="submit" :disabled="isLoading" class="btn-primary">
            {{ isLoading ? "確認中..." : "確認してサインアップ" }}
          </button>
        </form>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import { useClerk } from "@clerk/vue"
import { useSignUpVerify } from "@/src/composable/useSignUpVerify"
import Card from "@/src/components/ui/Card.vue"

const router = useRouter()
const clerk = useClerk()
const { code, isLoading, error, verifyCode } = useSignUpVerify()

const handleVerify = async () => {
  const success = await verifyCode()
  if (success) {
    router.push("/")
  }
}

const checkSignUpStatus = () => {
  // If clerk is not ready, we wait
  if (!clerk.value?.loaded) return

  const signUp = clerk.value.client?.signUp
  console.log(signUp)
  if (!signUp || signUp.status !== "missing_requirements") {
    // router.replace("/sign-up")
  }
}

onMounted(() => {
  document.title = "認証コードの確認 - 稽古記録"
  checkSignUpStatus()
})

watch(
  () => clerk.value?.loaded,
  () => {
    checkSignUpStatus()
  }
)
</script>

<style scoped>
.page-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.card-container {
  margin-inline: auto;
  max-width: 28rem;
}

.card-header {
  padding: var(--space-6);
  padding-bottom: var(--space-4);
}

.title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.subtitle {
  margin-top: var(--space-2);
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.card-body {
  padding: var(--space-6);
  padding-top: 0;
}

.verify-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.label {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.input {
  width: -webkit-fill-available;
  height: fit-content;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-card);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
  color: var(--text-primary);
  transition: box-shadow var(--transition-normal);
}

.input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  font-size: var(--text-base);
  color: var(--red-500);
}

.btn-primary {
  margin-top: var(--space-2);
  width: 100%;
  border-radius: var(--radius-md);
  background: var(--primary);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: white;
  border: none;
  cursor: pointer;
  transition: background var(--transition-normal);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}
</style>
