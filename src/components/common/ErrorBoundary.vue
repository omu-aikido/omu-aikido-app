<template>
  <div v-if="hasError" class="error-container" data-testid="error-boundary">
    <div class="error-content">
      <img src="/500%20InternalServerError.png" alt="500 Internal Server Error" class="error-image" />
      <p class="error-text">予期せぬエラーが発生しました。しばらく時間を置いてから再度お試しください。</p>
      <div v-if="errorMessage" class="error-details" data-testid="error-content">
        <p class="error-message">
          {{ errorMessage }}
        </p>
      </div>

      <div class="error-actions">
        <button class="btn-primary" data-testid="reload-btn" @click="handleReload">ページを再読み込み</button>
        <button class="btn-secondary" data-testid="home-btn" @click="handleGoHome">ホームに戻る</button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { onErrorCaptured, onMounted, onUnmounted, ref } from "vue"
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

<style scoped>
.error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  padding: var(--space-4);
}

.error-content {
  text-align: center;
  width: 100%;
  max-width: 32rem;
}

.error-image {
  width: 100%;
  height: auto;
  margin-bottom: var(--space-8);
  margin-inline: auto;
}

.error-text {
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
}

.error-details {
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: var(--error-bg);
  border: 1px solid var(--red-500);
  border-radius: var(--radius-lg);
}

.error-message {
  font-size: var(--text-sm);
  color: var(--red-500);
  font-family: monospace;
  text-align: left;
  overflow-wrap: break-word;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.btn-primary {
  width: 100%;
  padding: var(--space-3) var(--space-6);
  background: var(--accent);
  color: var(--on-primary);
  font-weight: var(--font-medium);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.btn-primary:hover {
  background: var(--accent-hover);
}

.btn-secondary {
  width: 100%;
  padding: var(--space-3) var(--space-6);
  background: var(--bg-muted-active);
  color: var(--text-primary);
  font-weight: var(--font-medium);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.btn-secondary:hover {
  background: var(--border-strong);
}
</style>
