<template>
  <div class="flex items-center justify-center p-4">
    <div class="card w-full h-full mx-auto max-w-md">
      <div class="p-6 pb-4">
        <h1 class="heading-1">認証コードの確認</h1>
        <p class="mt-2 text-base text-subtext">メールアドレスに送信された認証コードを入力してください。</p>
      </div>
      <div class="p-6 pt-0">
        <form class="stack" @submit.prevent="handleVerify">
          <Input
            id="code"
            v-model="code"
            label="認証コード"
            name="code"
            required
            placeholder="123456"
            :disabled="isLoading" />

          <div v-if="error" class="text-base text-red-500">
            {{ error }}
          </div>

          <button type="submit" class="btn-primary w-full" :disabled="isLoading">
            {{ isLoading ? '確認中...' : '確認する' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useClerk } from '@clerk/vue';
import { useSignUpVerify } from '@/src/composable/useSignUpVerify';
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
