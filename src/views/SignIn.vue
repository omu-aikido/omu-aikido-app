<template>
  <div class="flex items-center justify-center p-4">
    <SignedIn>
      <Card>
        <h1 class="text-3xl text-center font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
          Welcome Back
        </h1>
        <p class="text-base text-neutral-600 dark:text-neutral-300 opacity-80">
          ログインが完了しました。<br />
          ホームへリダイレクトしています。
        </p>
        <div class="w-full mt-4 mb-2 flex justify-center">
          <div class="w-48 h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div :style="{ width: gaugePercent + '%' }" class="h-full bg-blue-500 transition-all duration-1000"></div>
          </div>
        </div>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          画面が切り替わらない場合は
          <RouterLink
            :to="redirectUrl"
            class="text-blue-600 dark:text-blue-300 underline hover:text-blue-800 dark:hover:text-blue-400 transition-colors">
            こちら
          </RouterLink>
        </p>
      </Card>
    </SignedIn>

    <SignedOut>
      <Card class="mx-auto max-w-md">
        <div class="p-2">
          <h1 class="text-2xl font-bold text-neutral-800 dark:text-neutral-100">サインイン</h1>
        </div>
        <div class="p-2 pt-0">
          <div class="flex flex-col gap-6">
            <form v-if="needsVerification" @submit.prevent="handleVerifyCode">
              <div class="grid gap-2">
                <label for="code" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">認証コード</label>
                <input
                  id="code"
                  v-model="code"
                  type="text"
                  name="code"
                  required
                  placeholder="認証コードを入力"
                  class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-neutral-100" />
                <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ email }} に認証コードを送信しました</p>
              </div>
              <div v-if="error" class="mt-4 text-sm text-red-600 dark:text-red-400">
                <p>{{ error }}</p>
              </div>
              <button
                type="submit"
                :disabled="isLoading"
                class="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isLoading ? "認証中..." : "認証" }}
              </button>
            </form>

            <form v-else @submit.prevent="handleSignIn">
              <div class="grid gap-2">
                <label for="email" class="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >メールアドレス</label
                >
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="example@mail.com"
                  class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-neutral-100" />
              </div>
              <div class="mt-4 grid gap-2">
                <div class="flex items-center">
                  <label for="password" class="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >パスワード</label
                  >
                  <a
                    href="https://accounts.omu-aikido.com/sign-in/"
                    class="ml-auto inline-block text-sm text-neutral-600 dark:text-neutral-400 underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer">
                    パスワードを忘れた
                  </a>
                </div>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-neutral-100" />
              </div>
              <div v-if="error" class="mt-4 text-sm text-red-600 dark:text-red-400">
                <p>{{ error }}</p>
                <div class="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                  サインインに失敗する場合は、
                  <a
                    href="https://accounts.omu-aikido.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline hover:text-neutral-900 dark:hover:text-neutral-200">
                    こちら
                  </a>
                  からサインインをお試しください。
                </div>
              </div>
              <button
                type="submit"
                :disabled="isLoading"
                class="mt-6 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isLoading ? "サインイン中..." : "サインイン" }}
              </button>
            </form>
            <button
              type="button"
              class="w-full rounded-md bg-[#5865F2]! px-4 py-2 text-sm font-medium text-white! hover:bg-[#4752C4]! focus:outline-none focus:ring-2 focus:ring-[#5865F2] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              @click="handleSignInWithDiscord"
              :disabled="isLoading">
              <svg
                class="h-5 w-5 fill-white stroke-white"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="discord"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256">
                <g>
                  <circle stroke="none" cx="96" cy="144" r="12" />
                  <circle stroke="none" cx="160" cy="144" r="12" />
                  <path
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="16"
                    d="M74 80a175 175 0 0 1 54-8 175 175 0 0 1 54 8m0 96a175 175 0 0 1-54 8 175 175 0 0 1-54-8" />
                  <path
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="16"
                    d="m155 182 12 24a8 8 0 0 0 9 4c25-6 46-16 61-30a8 8 0 0 0 3-8L206 59a8 8 0 0 0-5-5 176 176 0 0 0-30-9 8 8 0 0 0-9 5l-8 24m-53 108-12 24a8 8 0 0 1-9 4c-25-6-46-16-61-30a8 8 0 0 1-3-8L50 59a8 8 0 0 1 5-5 176 176 0 0 1 30-9 8 8 0 0 1 9 5l8 24" />
                </g>
              </svg>
              Discordで認証
            </button>
          </div>
          <hr class="my-6" />
          <div class="mt-4 text-center text-sm text-neutral-700 dark:text-neutral-300">
            まだアカウントがありませんか?
            <RouterLink to="/sign-up" class="underline underline-offset-4"> サインアップ </RouterLink>
          </div>
        </div>
      </Card>
    </SignedOut>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router"
import { SignedOut, SignedIn } from "@clerk/vue"
import { useAuth } from "@/src/composable/useAuth"
import { useSignIn } from "@/src/composable/useSignIn"
import Card from "@/src/components/ui/Card.vue"
import { ref, onMounted, watch } from "vue"

const router = useRouter()
const route = useRoute()

const {
  email,
  password,
  code,
  isLoading,
  error,
  needsVerification,
  signIn,
  verifyCode,
  signInWithDiscord,
} = useSignIn()

const { isAuthenticated } = useAuth()
const gaugePercent = ref(0)
const redirectUrl = ref("/")

const handleSuccessfulSignIn = () => {
  gaugePercent.value = 100
  setTimeout(() => {
    router.push(redirectUrl.value)
  }, 1000)
}

onMounted(() => {
  document.title = "サインイン - 稽古記録"

  const url = new URL(window.location.href)
  const redirectParam = route.query.redirect_url as string | undefined

  if (redirectParam) {
    try {
      // Prevent open redirection vulnerability
      const parsedRedirectUrl = new URL(redirectParam, url.origin)
      if (parsedRedirectUrl.origin === url.origin) {
        redirectUrl.value =
          parsedRedirectUrl.pathname +
          parsedRedirectUrl.search +
          parsedRedirectUrl.hash
      }
    } catch (e) {
      console.error(`Invalid redirect_url: ${redirectParam}`)
    }
  }

  if (isAuthenticated.value) {
    handleSuccessfulSignIn()
  }
})

watch(isAuthenticated, newValue => {
  if (newValue) {
    handleSuccessfulSignIn()
  }
})

const handleSignIn = async () => {
  const success = await signIn()
  if (success) {
    // The watcher will handle the redirect
  }
}

const handleVerifyCode = async () => {
  const success = await verifyCode()
  if (success) {
    // The watcher will handle the redirect
  }
}

const handleSignInWithDiscord = async () => {
  await signInWithDiscord()
}
</script>
