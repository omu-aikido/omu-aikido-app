<template>
  <div class="space-y-6">
    <div
      class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
      <UserHeader :user="user" @updated="fetchUser" />

      <hr class="my-6 border-neutral-100 dark:border-neutral-700" />

      <ProfileCard />

      <MessageDisplay :error-message="errorMessage" :success-message="successMessage" />
      <div class="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          メールアドレス・パスワード変更などは
          <a
            class="text-indigo-600 dark:text-indigo-400 break-all inline-flex items-center hover:underline font-medium"
            href="https://accounts.omu-aikido.com/user"
            target="_blank"
            rel="noopener noreferrer"
            >こちら <ArrowUpRightFromSquareIcon class="inline w-3 h-3 ml-0.5" /> </a
          >&MediumSpace;から。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from "vue"
import type { InferResponseType } from "hono/client"
import hc from "@/src/lib/honoClient"
import UserHeader from "@/src/components/account/UserHeader.vue"
import MessageDisplay from "@/src/components/common/MessageDisplay.vue"
import ProfileCard from "@/src/components/account/ProfileCard.vue"

import { ArrowUpRightFromSquareIcon } from "lucide-vue-next"

const $account = hc.user.clerk.account.$get
type AccountRes = InferResponseType<typeof $account>

const user: Ref<AccountRes | null> = ref(null)
const errorMessage = ref("")
const successMessage = ref("")

async function fetchUser() {
  try {
    const res = await $account()
    if (!res.ok) {
      console.error("Failed to fetch user")
      return
    }
    user.value = await res.json()
  } catch (error) {
    console.error("Error loading user data:", error)
    errorMessage.value = "ユーザーデータの読み込みに失敗しました"
  }
}

onMounted(fetchUser)
</script>
