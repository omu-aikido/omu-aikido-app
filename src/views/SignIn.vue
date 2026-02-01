<template>
  <div class="flex items-center justify-center p-4">
    <SignedIn>
      <div class="card w-full h-full">
        <h1 class="text-3xl text-center font-bold text-fg tracking-tighter">Welcome Back</h1>
        <p class="text-base text-fg-dim opacity-80">
          ログインが完了しました。<br />
          ホームへリダイレクトしています。
        </p>
        <div class="w-full mt-4 mb-2 flex justify-center">
          <div class="w-48 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              :style="{ width: gaugePercent + '%' }"
              class="h-full bg-blue-500 transition-[width] duration-1000 ease" />
          </div>
        </div>
        <p class="text-sub">
          画面が切り替わらない場合は
          <RouterLink :to="redirectUrl" class="text-blue-500 underline underline-offset-4 hover:text-blue-600">
            こちら
          </RouterLink>
        </p>
      </div>
    </SignedIn>

    <SignedOut>
      <div class="card w-full h-full mx-auto max-w-md">
        <div class="p-2">
          <h1 class="text-2xl font-bold text-fg">サインイン</h1>
        </div>
        <div class="p-2 pt-0">
          <div class="flex flex-col gap-6">
            <form v-if="needsVerification" @submit.prevent="handleVerifyCode">
              <Input id="code" v-model="code" label="認証コード" name="code" required placeholder="認証コードを入力" />
              <p class="text-sub mt-2">{{ email }} に認証コードを送信しました</p>

              <div v-if="error" class="mt-4 text-base text-red-500">
                <p>{{ error }}</p>
              </div>
              <button type="submit" class="btn-primary w-full mt-4" :disabled="isLoading">
                {{ isLoading ? '認証中...' : '認証' }}
              </button>
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
                <div class="flex items-center mb-1.5">
                  <label for="password" class="form-label">パスワード</label>
                  <a
                    href="https://accounts.omu-aikido.com/sign-in/"
                    class="ml-auto inline-block text-base text-fg-dim underline underline-offset-4 hover:underline"
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

              <div v-if="error" class="mt-4 text-base text-red-500">
                <p>{{ error }}</p>
                <div class="mt-4 text-base text-fg-dim">
                  サインインに失敗する場合は、
                  <a
                    href="https://accounts.omu-aikido.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-500 underline underline-offset-4 hover:text-blue-600">
                    こちら
                  </a>
                  からサインインをお試しください。
                </div>
              </div>

              <button type="submit" class="btn-primary w-full mt-6" :disabled="isLoading">
                {{ isLoading ? 'サインイン中...' : 'サインイン' }}
              </button>
            </form>

            <button
              type="button"
              class="btn bg-[#5865f2] text-white hover:bg-[#4752c4] w-full"
              :disabled="isLoading"
              @click="handleSignInWithDiscord">
              <svg
                class="w-5 h-5 mr-2"
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
          <hr class="my-6" />
          <div class="mt-4 text-center text-base text-fg-dim">
            まだアカウントがありませんか?
            <RouterLink to="/sign-up" class="text-blue-500 underline underline-offset-4 hover:text-blue-600">
              サインアップ
            </RouterLink>
          </div>
        </div>
      </div>
    </SignedOut>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { SignedOut, SignedIn } from '@clerk/vue';
import { useAuth } from '@/src/composable/useAuth';
import { useSignIn } from '@/src/composable/useSignIn';
import Input from '@/src/components/ui/UiInput.vue';
import { ref, onMounted, watch } from 'vue';

const router = useRouter();
const route = useRoute();

const { email, password, code, isLoading, error, needsVerification, signIn, verifyCode, signInWithDiscord } =
  useSignIn();

const { isAuthenticated } = useAuth();
const gaugePercent = ref(0);
const redirectUrl = ref('/');

const handleSuccessfulSignIn = () => {
  gaugePercent.value = 100;
  setTimeout(() => {
    router.push(redirectUrl.value);
  }, 1000);
};

onMounted(() => {
  document.title = 'サインイン - 稽古記録';

  const url = new URL(window.location.href);
  const redirectParam = route.query.redirect_url as string | undefined;

  if (redirectParam) {
    try {
      const parsedRedirectUrl = new URL(redirectParam, url.origin);
      if (parsedRedirectUrl.origin === url.origin) {
        redirectUrl.value = parsedRedirectUrl.pathname + parsedRedirectUrl.search + parsedRedirectUrl.hash;
      }
    } catch {
      console.error(`Invalid redirect_url: ${redirectParam}`);
    }
  }

  if (isAuthenticated.value) {
    handleSuccessfulSignIn();
  }
});

watch(isAuthenticated, (newValue) => {
  if (newValue) {
    handleSuccessfulSignIn();
  }
});

const handleSignIn = async () => {
  await signIn();
};

const handleVerifyCode = async () => {
  await verifyCode();
};

const handleSignInWithDiscord = async () => {
  await signInWithDiscord();
};
</script>
