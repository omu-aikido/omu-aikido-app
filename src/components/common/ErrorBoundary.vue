<template>
  <div v-if="hasError" class="min-h-screen flex items-center justify-center bg-bg p-4" data-testid="error-boundary">
    <div class="text-center w-full max-w-lg">
      <img src="/500%20InternalServerError.png" alt="500 Internal Server Error" class="w-full h-auto mb-8 mx-auto" />
      <p class="text-fg-dim mb-8">予期せぬエラーが発生しました。しばらく時間を置いてから再度お試しください。</p>
      <div
        v-if="errorMessage"
        class="mb-6 p-4 bg-red-50 border border-red-500 rounded-lg dark:bg-red-900/10"
        data-testid="error-content">
        <p class="text-sm text-red-500 font-mono text-left break-words">
          {{ errorMessage }}
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <button
          class="w-full px-6 py-3 bg-blue-500 text-white font-medium border-none rounded-lg cursor-pointer transition-colors hover:bg-blue-600"
          data-testid="reload-btn"
          @click="handleReload">
          ページを再読み込み
        </button>
        <button
          class="w-full px-6 py-3 bg-gray-200 text-fg font-medium border-none rounded-lg cursor-pointer transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          data-testid="home-btn"
          @click="handleGoHome">
          ホームに戻る
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { onErrorCaptured, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const hasError = ref(false);
const errorMessage = ref('');

const handleReload = () => {
  window.location.reload();
};

const handleGoHome = () => {
  hasError.value = false;
  errorMessage.value = '';
  router.push('/');
};

// エラーキャプチャハンドラー
const handleError = (err: Error, _instance: unknown, info: string) => {
  console.error('ErrorBoundary caught an error:', err, info);
  hasError.value = true;
  errorMessage.value = err.message || '不明なエラーが発生しました';

  // エラーを伝播させない
  return false;
};

onErrorCaptured(handleError);

// グローバルエラーハンドラー
const handleGlobalError = (event: ErrorEvent) => {
  console.error('Global error handler:', event.error);
  hasError.value = true;
  errorMessage.value = event.error?.message || '不明なエラーが発生しました';
};

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('Unhandled promise rejection:', event.reason);
  hasError.value = true;
  errorMessage.value = event.reason instanceof Error ? event.reason.message : 'Promiseが拒否されました';
};

// グローバルエラーハンドラーの登録
onMounted(() => {
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
});

// クリーンアップ
onUnmounted(() => {
  window.removeEventListener('error', handleGlobalError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
});
</script>
