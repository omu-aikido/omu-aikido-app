<template>
  <div class="flex items-center justify-center p-4">
    <Card class="mx-auto max-w-md">
      <div class="px-6 pt-4">
        <h1 class="text-2xl font-bold text-neutral-800 dark:text-neutral-100">認証コードの確認</h1>
        <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          メールアドレスに送信された認証コードを入力してください。
        </p>
      </div>
      <div class="p-6 pt-0">
        <form @submit.prevent="handleVerify">
          <div class="space-y-2">
            <label for="code" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">認証コード</label>
            <input
              id="code"
              v-model="code"
              type="text"
              name="code"
              required
              placeholder="123456"
              :disabled="isLoading"
              class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed" />
          </div>

          <div v-if="error" class="mt-4 text-sm text-red-600 dark:text-red-400">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
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
    router.replace("/sign-up")
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
