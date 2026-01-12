<template>
  <div class="user-page">
    <div class="card">
      <UserHeader :user="user" @updated="fetchUser" />

      <hr class="divider" />

      <ProfileCard />

      <MessageDisplay :error-message="errorMessage" :success-message="successMessage" />
      <div class="footer">
        <p class="footer-text">
          メールアドレス・パスワード変更などは
          <a class="external-link" href="https://accounts.omu-aikido.com/user" target="_blank" rel="noopener noreferrer"
            >こちら <ArrowUpRightFromSquareIcon class="link-icon" /> </a
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
    return await res.json()
  },
})

const user = computed(() => userData.value ?? null)
const errorMessage = computed(() =>
  queryError.value ? "ユーザーデータの読み込みに失敗しました" : ""
)
const successMessage = computed(() => "")

const fetchUser = () => refetch()
</script>

<style scoped>
.user-page {
  max-width: var(--container-max);
  margin-inline: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-dim);
  padding: var(--space-6);
}

.divider {
  margin: var(--space-6) 0;
  border: none;
  border-top: 1px solid var(--border-dim);
}

.footer {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-dim);
}

.footer-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.external-link {
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  font-weight: var(--font-medium);
  text-decoration: none;
  word-break: break-all;
}

.external-link:hover {
  text-decoration: underline;
}

.link-icon {
  width: 0.75rem;
  height: 0.75rem;
  margin-left: 0.125rem;
  display: inline-block;
}
</style>
