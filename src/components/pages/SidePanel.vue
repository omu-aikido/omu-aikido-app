<template>
  <button
    @click="open"
    class="inline-flex justify-center items-center rounded-md p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600"
    aria-label="メニューを開く">
    <MenuIcon class="h-6 w-6" />
  </button>

  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div
        v-if="isOpen"
        class="fixed inset-0 backdrop-brightness-50 backdrop-blur-sm z-100"
        @click="close"
        aria-hidden="true" />
    </Transition>

    <!-- Drawer Panel -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full">
      <div
        v-if="isOpen"
        class="fixed top-0 right-0 h-full w-full max-w-xs bg-white dark:bg-neutral-900 z-101 shadow-2xl p-6 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="サイドメニュー">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">メニュー</h2>
          <button
            @click="close"
            class="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500"
            aria-label="メニューを閉じる">
            <XIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
          <SignedIn>
            <!-- Navigation -->
            <nav class="space-y-2">
              <RouterLink
                to="/"
                @click="close"
                class="flex items-center gap-3 px-4 py-3 text-base font-medium text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <LayoutDashboardIcon class="h-5 w-5" />
                トップ
              </RouterLink>
              <RouterLink
                to="/record"
                @click="close"
                class="flex items-center gap-3 px-4 py-3 text-base font-medium text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <ClipboardListIcon class="h-5 w-5" />
                活動記録
              </RouterLink>
              <RouterLink
                to="/account"
                @click="close"
                class="flex items-center gap-3 px-4 py-3 text-base font-medium text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <UserAvatar alt="User Avatar" />
                アカウント設定
              </RouterLink>
            </nav>
          </SignedIn>

          <SignedOut>
            <div class="space-y-4">
              <p class="text-neutral-600 dark:text-neutral-400">ログインして稽古の記録を始めましょう。</p>
              <RouterLink
                to="/sign-in"
                @click="close"
                class="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors">
                ログイン
              </RouterLink>
            </div>
          </SignedOut>
        </div>

        <!-- Footer -->
        <div class="mt-auto space-y-4">
          <div class="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <SignedIn>
              <SignOutButton>
                <button
                  class="flex w-full items-center gap-3 px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <LogOutIcon class="h-5 w-5" />
                  ログアウト
                </button>
              </SignOutButton>
            </SignedIn>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { RouterLink } from "vue-router"
import {
  MenuIcon,
  XIcon,
  LayoutDashboardIcon,
  ClipboardListIcon,
  LogOutIcon,
} from "lucide-vue-next"
import { SignedIn, SignedOut, SignOutButton, UserAvatar } from "@clerk/vue"

// State
const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

// Inert & Scroll Lock Logic
watch(isOpen, value => {
  const app = document.querySelector("#app")
  if (value) {
    // Open
    if (app) app.setAttribute("inert", "")
    document.body.style.overflow = "hidden"
  } else {
    // Close
    if (app) app.removeAttribute("inert")
    document.body.style.overflow = ""
  }
})
</script>

<style>
.cl-avatarBox, .cl-userAvatarBox {
  height: 1.5rem;
  width: 1.5rem;
  border-radius: 100%; /* rounded-full */
  box-shadow: 0 0 0 2px #f3f4f6; /* ring-2 ring-neutral-100 */
  overflow: hidden;
  flex-shrink: 0; /* shrink-0 */
}

/* Dark mode override (matches Tailwind's dark: variant which typically applies a .dark class on a parent) */
.dark .cl-avatarBox,
.dark .cl-userAvatarBox {
  box-shadow: 0 0 0 2px #27272a; /* ring-neutral-800 */
}
</style>
