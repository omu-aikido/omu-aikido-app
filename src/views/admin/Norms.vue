<template>
  <div class="flex flex-col gap-6 px-3 py-4 md:px-6">
    <AdminMenu />
    <div class="stack items-start sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap gap-4 w-full sm:w-auto">
        <div class="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md text-fg-dim border-none cursor-pointer transition-all hover:text-fg',
              { 'bg-bg-light text-fg shadow-sm': filterStatus === 'all' },
            ]"
            @click="filterStatus = 'all'">
            全て
          </button>
          <button
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md text-fg-dim border-none cursor-pointer transition-all hover:text-fg',
              { 'bg-bg-light text-red-500 shadow-sm': filterStatus === 'unmet' },
            ]"
            @click="filterStatus = 'unmet'">
            未達成
          </button>
          <button
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md text-fg-dim border-none cursor-pointer transition-all hover:text-fg',
              { 'bg-bg-light text-green-500 shadow-sm': filterStatus === 'met' },
            ]"
            @click="filterStatus = 'met'">
            達成済
          </button>
        </div>

        <div class="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button
            title="進捗率: 低→高"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md text-fg-dim border-none cursor-pointer transition-all hover:text-fg',
              { 'bg-bg-light text-fg shadow-sm': sortOrder === 'asc' },
            ]"
            @click="sortOrder = 'asc'">
            昇順
          </button>
          <button
            title="進捗率: 高→低"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md text-fg-dim border-none cursor-pointer transition-all hover:text-fg',
              { 'bg-bg-light text-fg shadow-sm': sortOrder === 'desc' },
            ]"
            @click="sortOrder = 'desc'">
            降順
          </button>
        </div>
      </div>

      <div class="w-full sm:w-72">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="名前で検索..."
          class="w-full h-fit px-3 py-2 pl-10 bg-bg border border-border-dim rounded-md text-fg text-base transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner" />
      <p class="text-sub">Loading...</p>
    </div>

    <div v-else-if="error" class="p-4 bg-red-500/10 text-red-500 rounded-md border border-red-500/20">
      {{ error }}
    </div>

    <div v-else class="w-full">
      <div class="grid-responsive">
        <NormCard
          v-for="item in filteredUsers"
          :key="item.user.id"
          :user="item.user"
          :norm="item.norm"
          :progress="item.norm.progress" />
      </div>

      <div v-if="!loading && !error && filteredUsers.length === 0" class="text-center py-12 text-fg-dim">
        該当するユーザーが見つかりません
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminMenu from '@/src/components/admin/AdminMenu.vue';
import NormCard from '@/src/components/admin/NormCard.vue';
import hc from '@/src/lib/honoClient';
import { queryKeys } from '@/src/lib/queryKeys';
import { useQuery } from '@tanstack/vue-query';
import { computed, ref } from 'vue';

const searchTerm = ref('');
const filterStatus = ref<'all' | 'met' | 'unmet'>('all');
const sortOrder = ref<'asc' | 'desc'>('desc');

const {
  data,
  isLoading: loading,
  error: queryError,
} = useQuery({
  queryKey: computed(() => queryKeys.admin.norms({ query: { query: searchTerm.value, limit: 100 } })),
  queryFn: async () => {
    const res = await hc.admin.norms.$get({
      query: { query: searchTerm.value, limit: 100 },
    });
    if (!res.ok) throw new Error('Failed to fetch norms');
    return res.json();
  },
});

const users = computed(() => {
  if (!data.value || !('users' in data.value)) return [];
  return data.value.users;
});

const norms = computed(() => {
  if (!data.value || !('norms' in data.value)) return [];
  return data.value.norms;
});

const error = computed(() => (queryError.value ? 'データの取得に失敗しました' : ''));

const processedData = computed(() => {
  return users.value
    .map((user) => {
      const norm = norms.value.find((n) => n.userId === user.id);
      if (!norm) return null;
      return { user, norm };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
});

const filteredUsers = computed(() => {
  let result = processedData.value;

  // Filter by Search Term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    result = result.filter((item) => {
      const fullName = `${item.user.lastName || ''} ${item.user.firstName || ''}`.toLowerCase();
      return fullName.includes(term);
    });
  }

  // Filter by Status
  if (filterStatus.value !== 'all') {
    result = result.filter((item) => {
      if (filterStatus.value === 'met') return item.norm.isMet;
      if (filterStatus.value === 'unmet') return !item.norm.isMet;
      return true;
    });
  }

  // Sort
  result.sort((a, b) => {
    const diff = a.norm.progress - b.norm.progress;
    return sortOrder.value === 'asc' ? diff : -diff;
  });

  return result;
});
</script>
