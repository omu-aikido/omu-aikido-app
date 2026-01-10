<template>
  <div class="page-container">
    <SignedIn>
      <Card>
        <h1 class="title">Welcome Back</h1>
        <p class="subtitle">
          ログインが完了しました。<br />
          ホームへリダイレクトしています。
        </p>
        <div class="gauge-container">
          <div class="gauge-bg">
            <div :style="{ width: gaugePercent + '%' }" class="gauge-fill" />
          </div>
        </div>
        <p class="redirect-text">
          画面が切り替わらない場合は
          <RouterLink :to="redirectUrl" class="link"> こちら </RouterLink>
        </p>
      </Card>
    </SignedIn>

    <SignedOut>
      <Card class="form-card">
        <div class="card-header">
          <h1 class="form-title">サインイン</h1>
        </div>
        <div class="card-body">
          <div class="form-container">
            <form v-if="needsVerification" @submit.prevent="handleVerifyCode">
              <div class="field">
                <label for="code" class="label">認証コード</label>
                <input
                  id="code"
                  v-model="code"
                  type="text"
                  name="code"
                  required
                  placeholder="認証コードを入力"
                  class="input" />
                <p class="hint">{{ email }} に認証コードを送信しました</p>
              </div>
              <div v-if="error" class="error">
                <p>{{ error }}</p>
              </div>
              <button type="submit" :disabled="isLoading" class="btn-primary full-width">
                {{ isLoading ? "認証中..." : "認証" }}
              </button>
            </form>

            <form v-else @submit.prevent="handleSignIn">
              <div class="field">
                <label for="email" class="label">メールアドレス</label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="example@mail.com"
                  class="input" />
              </div>
              <div class="field mt-4">
                <div class="label-row">
                  <label for="password" class="label">パスワード</label>
                  <a
                    href="https://accounts.omu-aikido.com/sign-in/"
                    class="forgot-link"
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
                  class="input" />
              </div>
              <div v-if="error" class="error">
                <p>{{ error }}</p>
                <div class="error-help">
                  サインインに失敗する場合は、
                  <a href="https://accounts.omu-aikido.com" target="_blank" rel="noopener noreferrer" class="link">
                    こちら
                  </a>
                  からサインインをお試しください。
                </div>
              </div>
              <button type="submit" :disabled="isLoading" class="btn-primary full-width mt-6">
                {{ isLoading ? "サインイン中..." : "サインイン" }}
              </button>
            </form>
            <button type="button" class="btn-discord full-width" :disabled="isLoading" @click="handleSignInWithDiscord">
              <svg
                class="discord-icon"
                aria-hidden="true"
                focusable="false"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256">
                <g>
                  <circle stroke="none" cx="96" cy="144" r="12" fill="currentColor" />
                  <circle stroke="none" cx="160" cy="144" r="12" fill="currentColor" />
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="16"
                    d="M74 80a175 175 0 0 1 54-8 175 175 0 0 1 54 8m0 96a175 175 0 0 1-54 8 175 175 0 0 1-54-8" />
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="16"
                    d="m155 182 12 24a8 8 0 0 0 9 4c25-6 46-16 61-30a8 8 0 0 0 3-8L206 59a8 8 0 0 0-5-5 176 176 0 0 0-30-9 8 8 0 0 0-9 5l-8 24m-53 108-12 24a8 8 0 0 1-9 4c-25-6-46-16-61-30a8 8 0 0 1-3-8L50 59a8 8 0 0 1 5-5 176 176 0 0 1 30-9 8 8 0 0 1 9 5l8 24" />
                </g>
              </svg>
              Discordで認証
            </button>
          </div>
          <hr class="divider" />
          <div class="footer-text">
            まだアカウントがありませんか?
            <RouterLink to="/sign-up" class="link"> サインアップ </RouterLink>
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
      const parsedRedirectUrl = new URL(redirectParam, url.origin)
      if (parsedRedirectUrl.origin === url.origin) {
        redirectUrl.value =
          parsedRedirectUrl.pathname +
          parsedRedirectUrl.search +
          parsedRedirectUrl.hash
      }
    } catch {
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
  await signIn()
}

const handleVerifyCode = async () => {
  await verifyCode()
}

const handleSignInWithDiscord = async () => {
  await signInWithDiscord()
}
</script>

<style scoped>
.page-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.title {
  font-size: var(--text-3xl);
  text-align: center;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.subtitle {
  font-size: var(--text-base);
  color: var(--text-secondary);
  opacity: 0.8;
}

.gauge-container {
  width: 100%;
  margin-top: var(--space-4);
  margin-bottom: var(--space-2);
  display: flex;
  justify-content: center;
}

.gauge-bg {
  width: 12rem;
  height: 0.75rem;
  background: var(--bg-muted-active);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.gauge-fill {
  height: 100%;
  background: var(--accent);
  transition: width 1s ease;
}

.redirect-text {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.form-card {
  margin-inline: auto;
  max-width: 28rem;
}

.card-header {
  padding: var(--space-2);
}

.form-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.card-body {
  padding: var(--space-2);
  padding-top: 0;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
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

.label-row {
  display: flex;
  align-items: center;
}

.forgot-link {
  margin-left: auto;
  display: inline-block;
  font-size: var(--text-base);
  color: var(--text-secondary);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.forgot-link:hover {
  text-decoration: underline;
}

.input {
  width: -webkit-fill-available;
  height: -webkit-fit-content;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-card);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
  color: var(--text-primary);
  transition: box-shadow var(--transition-normal);
}

.input::placeholder {
  color: var(--border-strong);
}

.input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.hint {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.error {
  margin-top: var(--space-4);
  font-size: var(--text-base);
  color: var(--red-500);
}

.error-help {
  margin-top: var(--space-4);
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.btn-primary {
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

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-discord {
  border-radius: var(--radius-md);
  background: #5865f2;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  transition: background var(--transition-normal);
}

.btn-discord:hover:not(:disabled) {
  background: #4752c4;
}

.btn-discord:focus {
  outline: none;
  box-shadow: 0 0 0 2px #5865f2;
}

.btn-discord:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.discord-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.full-width {
  width: 100%;
}

.mt-4 {
  margin-top: var(--space-4);
}

.mt-6 {
  margin-top: var(--space-6);
}

.divider {
  margin: var(--space-6) 0;
}

.footer-text {
  margin-top: var(--space-4);
  text-align: center;
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.link {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.link:hover {
  color: var(--accent-hover);
}
</style>
