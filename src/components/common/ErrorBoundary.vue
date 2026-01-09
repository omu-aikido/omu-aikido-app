<template>
  <div
    v-if="hasError"
    class="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4"
    data-testid="error-boundary">
    <div class="text-center w-full max-w-lg">
      <img src="/500%20InternalServerError.png" alt="500 Internal Server Error" class="w-full h-auto mb-8 mx-auto" />
      <p class="text-neutral-600 dark:text-neutral-400 mb-8">
        予期せぬエラーが発生しました。しばらく時間を置いてから再度お試しください。
      </p>
      <div
        v-if="errorMessage"
        class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        data-testid="error-content">
        <p class="text-sm text-red-800 dark:text-red-200 font-mono text-left wrap-break-word">
          {{ errorMessage }}
        </p>
      </div>

      <div class="space-y-3">
        <button
          @click="handleReload"
          class="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          data-testid="reload-btn">
          ページを再読み込み
        </button>
        <button
          @click="handleGoHome"
          class="w-full px-6 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 font-medium rounded-lg transition-colors"
          data-testid="home-btn">
          ホームに戻る
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const hasError = ref(false)
const errorMessage = ref("")

const handleReload = () => {
  window.location.reload()
}

const handleGoHome = () => {
  hasError.value = false
  errorMessage.value = ""
  router.push("/")
}

// エラーキャプチャハンドラー
const handleError = (err: Error, _instance: unknown, info: string) => {
  console.error("ErrorBoundary caught an error:", err, info)
  hasError.value = true
  errorMessage.value = err.message || "不明なエラーが発生しました"

  // エラーを伝播させない
  return false
}

onErrorCaptured(handleError)

// グローバルエラーハンドラー
const handleGlobalError = (event: ErrorEvent) => {
  console.error("Global error handler:", event.error)
  hasError.value = true
  errorMessage.value = event.error?.message || "不明なエラーが発生しました"
}

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error("Unhandled promise rejection:", event.reason)
  hasError.value = true
  errorMessage.value =
    event.reason instanceof Error
      ? event.reason.message
      : "Promiseが拒否されました"
}

// グローバルエラーハンドラーの登録
onMounted(() => {
  window.addEventListener("error", handleGlobalError)
  window.addEventListener("unhandledrejection", handleUnhandledRejection)
})

// クリーンアップ
onUnmounted(() => {
  window.removeEventListener("error", handleGlobalError)
  window.removeEventListener("unhandledrejection", handleUnhandledRejection)
})
</script>
