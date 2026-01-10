<template>
  <button class="menu-btn" aria-label="メニューを開く" @click="open">
    <MenuIcon class="icon" />
  </button>

  <Teleport to="body">
    <Transition
      enter-active-class="backdrop-enter"
      enter-from-class="backdrop-enter-from"
      enter-to-class="backdrop-enter-to"
      leave-active-class="backdrop-leave"
      leave-from-class="backdrop-enter-to"
      leave-to-class="backdrop-enter-from">
      <div v-if="isOpen" class="backdrop" aria-hidden="true" @click="close" />
    </Transition>

    <Transition
      enter-active-class="drawer-enter"
      enter-from-class="drawer-enter-from"
      enter-to-class="drawer-enter-to"
      leave-active-class="drawer-leave"
      leave-from-class="drawer-enter-to"
      leave-to-class="drawer-enter-from">
      <div v-if="isOpen" class="drawer" role="dialog" aria-modal="true" aria-label="サイドメニュー">
        <div class="drawer-header">
          <h2 class="drawer-title">メニュー</h2>
          <button class="close-btn" aria-label="メニューを閉じる" @click="close">
            <XIcon class="icon" />
          </button>
        </div>

        <div class="drawer-content">
          <SignedIn>
            <nav class="nav">
              <RouterLink to="/" class="nav-link" @click="close">
                <LayoutDashboardIcon class="nav-icon" />
                トップ
              </RouterLink>
              <RouterLink to="/record" class="nav-link" @click="close">
                <ClipboardListIcon class="nav-icon" />
                活動記録
              </RouterLink>
              <RouterLink to="/account" class="nav-link" @click="close">
                <UserAvatar alt="User Avatar" />
                アカウント設定
              </RouterLink>
            </nav>
          </SignedIn>

          <SignedOut>
            <div class="signed-out">
              <p class="signed-out-text">ログインして稽古の記録を始めましょう。</p>
              <RouterLink to="/sign-in" class="login-btn" @click="close"> ログイン </RouterLink>
            </div>
          </SignedOut>
        </div>

        <div class="drawer-footer">
          <div class="footer-border">
            <SignedIn>
              <SignOutButton>
                <button class="logout-btn">
                  <LogOutIcon class="nav-icon" />
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

<style scoped>
.menu-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius-md);
  padding: var(--space-2);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.menu-btn:hover {
  background: var(--bg-muted);
}

.menu-btn:focus {
  outline: none;
}

.menu-btn:focus-visible {
  box-shadow: 0 0 0 2px var(--border-strong);
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(4px);
  z-index: 100;
}

.backdrop-enter {
  transition: opacity 300ms ease-out;
}

.backdrop-leave {
  transition: opacity 200ms ease-in;
}

.backdrop-enter-from {
  opacity: 0;
}

.backdrop-enter-to {
  opacity: 1;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  max-width: 20rem;
  background: var(--bg-card);
  z-index: 101;
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
}

.drawer-enter {
  transition: transform 300ms ease-out;
}

.drawer-leave {
  transition: transform 200ms ease-in;
}

.drawer-enter-from {
  transform: translateX(100%);
}

.drawer-enter-to {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-8);
}

.drawer-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.close-btn {
  border-radius: var(--radius-md);
  padding: var(--space-2);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.close-btn:hover {
  background: var(--bg-muted);
}

.close-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--border-strong);
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: background var(--transition-normal);
}

.nav-link:hover {
  background: var(--bg-muted);
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.signed-out {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.signed-out-text {
  color: var(--text-secondary);
}

.login-btn {
  display: block;
  width: 100%;
  text-align: center;
  background: var(--primary);
  color: white;
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  text-decoration: none;
  transition: background var(--transition-normal);
}

.login-btn:hover {
  background: var(--primary-hover);
}

.drawer-footer {
  margin-top: auto;
}

.footer-border {
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}

.logout-btn {
  display: flex;
  width: 100%;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--red-500);
  background: transparent;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.logout-btn:hover {
  background: var(--error-bg);
}
</style>

<style>
/* stylelint-disable selector-class-pattern */
.cl-avatarBox, .cl-userAvatarBox {
  height: 1.5rem;
  width: 1.5rem;
  border-radius: var(--radius-full);
  box-shadow: 0 0 0 2px var(--bg-muted);
  overflow: hidden;
  flex-shrink: 0;
}
</style>
