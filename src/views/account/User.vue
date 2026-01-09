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
import { computed } from "vue"
import { useQuery } from "@tanstack/vue-query"
import { queryKeys } from "@/src/lib/queryKeys"
import hc from "@/src/lib/honoClient"
import UserHeader from "@/src/components/account/UserHeader.vue"
import MessageDisplay from "@/src/components/common/MessageDisplay.vue"
import ProfileCard from "@/src/components/account/ProfileCard.vue"

import { ArrowUpRightFromSquareIcon } from "lucide-vue-next"

// Queries
const {
  data: userData,
  error: queryError,
  refetch,
} = useQuery({
  queryKey: queryKeys.user.clerk.account(),
  queryFn: async () => {
    const res = await hc.user.clerk.account.$get()
    if (!res.ok) throw new Error("Failed to fetch user")
    return res.json()
  },
})

const user = computed(() => userData.value ?? null)
const errorMessage = computed(() =>
  queryError.value ? "ユーザーデータの読み込みに失敗しました" : ""
)
const successMessage = computed(() => "") // Or handle success message if needed

const fetchUser = () => refetch() // Keep for compatibility if needed, or remove usage from UserHeader event
</script>
