<template>
  <div class="page-container">
    <Card class="card-container">
      <div class="card-header">
        <h1 class="title">認証コードの確認</h1>
        <p class="subtitle">メールアドレスに送信された認証コードを入力してください。</p>
      </div>
      <div class="card-body">
        <form class="verify-form" @submit.prevent="handleVerify">
          <Input
            id="code"
            v-model="code"
            label="認証コード"
            name="code"
            required
            placeholder="123456"
            :disabled="isLoading" />

          <div v-if="error" class="error">
            {{ error }}
          </div>

          <Button type="submit" :disabled="isLoading" full-width class="mt-4">
            {{ isLoading ? '確認中...' : '確認してサインアップ' }}
          </Button>
        </form>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useClerk } from '@clerk/vue';
import { useSignUpVerify } from '@/src/composable/useSignUpVerify';
import Card from '@/src/components/ui/UiCard.vue';
import Button from '@/src/components/ui/UiButton.vue';
import Input from '@/src/components/ui/UiInput.vue';

const router = useRouter();
const clerk = useClerk();
const { code, isLoading, error, verifyCode } = useSignUpVerify();

const handleVerify = async () => {
  const success = await verifyCode();
  if (success) {
    router.push('/');
  }
};

const checkSignUpStatus = () => {
  // If clerk is not ready, we wait
  if (!clerk.value?.loaded) return;

  const signUp = clerk.value.client?.signUp;
  console.log(signUp);
  if (!signUp || signUp.status !== 'missing_requirements') {
    // router.replace("/sign-up")
  }
};

onMounted(() => {
  document.title = '認証コードの確認 - 稽古記録';
  checkSignUpStatus();
});

watch(
  () => clerk.value?.loaded,
  () => {
    checkSignUpStatus();
  }
);
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

.error {
  font-size: var(--text-base);
  color: var(--red-500);
}

.mt-4 {
  margin-top: var(--space-4);
}
</style>
