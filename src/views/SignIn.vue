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
              <Input id="code" v-model="code" label="認証コード" name="code" required placeholder="認証コードを入力" />
              <p class="hint">{{ email }} に認証コードを送信しました</p>

              <div v-if="error" class="error">
                <p>{{ error }}</p>
              </div>
              <Button type="submit" :disabled="isLoading" full-width class="mt-4">
                {{ isLoading ? "認証中..." : "認証" }}
              </Button>
            </form>

            <form v-else @submit.prevent="handleSignIn">
              <Input
                id="email"
                v-model="email"
                type="email"
                label="メールアドレス"
                name="email"
                required
                autocomplete="email"
                placeholder="example@mail.com" />

              <div class="mt-4 user-select-none">
                <!-- added wrapper for layout spacing if needed, though Input handles vertical gap -->
                <!-- Password input needs custom label layout for 'Forgot Password' link?
                      Input component has internal label. If we want the link next to label, we might need a slot or different approach.
                      The Input component puts label above.
                      Let's use the Input component but maybe we can't easily put the link *inside* the label line without a slot.
                      However, the Input component doesn't have a label-right slot.

                      Workaround: Don't use 'label' prop on Input, render label manually above it.
                 -->
                <div class="label-row">
                  <label for="password" class="field-label">パスワード</label>
                  <a
                    href="https://accounts.omu-aikido.com/sign-in/"
                    class="forgot-link"
                    target="_blank"
                    rel="noopener noreferrer">
                    パスワードを忘れた
                  </a>
                </div>
                <Input
                  id="password"
                  v-model="password"
                  type="password"
                  name="password"
                  required
                  autocomplete="current-password" />
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

              <Button type="submit" :disabled="isLoading" full-width class="mt-6">
                {{ isLoading ? "サインイン中..." : "サインイン" }}
              </Button>
            </form>

            <Button type="button" variant="discord" full-width :disabled="isLoading" @click="handleSignInWithDiscord">
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
            </Button>
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
import Card from "@/src/components/ui/UiCard.vue"
import Button from "@/src/components/ui/UiButton.vue"
import Input from "@/src/components/ui/UiInput.vue"
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

.field-label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
}

.label-row {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-1-5);
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

.hint {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: var(--space-2);
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

.discord-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: var(--space-2);
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
