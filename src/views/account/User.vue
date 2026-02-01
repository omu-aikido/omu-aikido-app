<template>
  <div class="max-w-7xl mx-auto p-4 stack gap-6">
    <div class="bg-surface0 rounded-xl shadow-sm border border-overlay0 p-6">
      <UserHeader :user="user" @updated="fetchUser" />

      <hr class="my-6 border-none border-t border-overlay0" />

      <ProfileCard />

      <div v-if="errorMessage" class="alert-error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert-success">{{ successMessage }}</div>
      <div class="mt-4 pt-4 border-t border-overlay0">
        <p class="text-sub">
          メールアドレス・パスワード変更などは
          <a
            class="text-blue-500 inline-flex items-center font-medium no-underline break-all hover:underline"
            href="https://accounts.omu-aikido.com/user"
            target="_blank"
            rel="noopener noreferrer"
            >こちら <ArrowUpRightFromSquareIcon class="w-3 h-3 ml-0.5 inline-block" /> </a
          >&MediumSpace;から。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { queryKeys } from '@/src/lib/queryKeys';
import hc from '@/src/lib/honoClient';
import UserHeader from '@/src/components/account/UserHeader.vue';
import ProfileCard from '@/src/components/account/ProfileCard.vue';

import { ArrowUpRightFromSquareIcon } from 'lucide-vue-next';

// Queries
const {
  data: userData,
  error: queryError,
  refetch,
} = useQuery({
  queryKey: queryKeys.user.clerk.account(),
  queryFn: async () => {
    const res = await hc.user.clerk.account.$get();
    if (!res.ok) throw new Error('Failed to fetch user');
    return await res.json();
  },
});

const user = computed(() => userData.value ?? null);
const errorMessage = computed(() => (queryError.value ? 'ユーザーデータの読み込みに失敗しました' : ''));
const successMessage = computed(() => '');

const fetchUser = () => refetch();
</script>
