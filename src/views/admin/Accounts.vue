<template>
  <div class="flex flex-col gap-6 px-3 py-4 md:px-6">
    <AdminMenu />
    <div class="stack items-start sm:flex-row sm:items-center sm:justify-between">
      <div class="flex gap-2 w-full sm:w-auto sm:ml-auto">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="名前・メアドで検索..."
          class="flex-1 min-w-0 px-3 py-2 bg-base border border-overlay0 rounded-md text-text text-base transition-shadow sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="handleSearch" />
        <button
          class="px-4 py-2 bg-blue-500 text-white border-none rounded-md text-base cursor-pointer transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @click="handleSearch">
          検索
        </button>
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
      <div class="overflow-x-auto">
        <table class="table-base">
          <thead class="border-b border-overlay0">
            <tr>
              <th
                class="th-base cursor-pointer select-none transition-colors hover:bg-overlay0 md:px-6"
                @click="toggleSort('name')">
                名前
                <span v-if="sortBy === 'name'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th
                class="th-base cursor-pointer select-none transition-colors hover:bg-overlay0 md:px-6"
                @click="toggleSort('role')">
                役職
                <span v-if="sortBy === 'role'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th
                class="th-base cursor-pointer select-none transition-colors hover:bg-overlay0 md:px-6"
                @click="toggleSort('grade')">
                級段位
                <span v-if="sortBy === 'grade'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th
                class="th-base cursor-pointer select-none transition-colors hover:bg-overlay0 md:px-6"
                @click="toggleSort('year')">
                学年
                <span v-if="sortBy === 'year'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in sortedUsers"
              :key="user.id"
              class="cursor-pointer transition-colors border-b border-overlay0 hover:bg-overlay0 last:border-b-0"
              @click="$router.push(`/admin/users/${user.id}`)">
              <td class="td-base md:px-6">
                <div class="flex items-center gap-2">
                  <img :src="user.imageUrl" alt="" class="avatar-sm ml-1" />
                  <div class="flex flex-col">
                    <span class="font-medium text-text"> {{ user.lastName }} {{ user.firstName }} </span>
                    <small class="text-sub">{{ user.emailAddress }}</small>
                  </div>
                </div>
              </td>
              <td class="td-base md:px-6 text-center">
                <span class="text-text">{{ user.profile.roleLabel }}</span>
              </td>
              <td class="td-base md:px-6 text-center">
                <span class="text-text">{{ user.profile.gradeLabel }}</span>
              </td>
              <td class="td-base md:px-6 text-center">
                <span class="text-text">{{ user.profile.yearLabel }}</span>
              </td>
            </tr>
            <tr v-if="sortedUsers.length === 0">
              <td colspan="4" class="p-12 text-center text-subtext">ユーザーが見つかりませんでした</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { queryKeys } from '@/src/lib/queryKeys';
import hc from '@/src/lib/honoClient';
import AdminMenu from '@/src/components/admin/AdminMenu.vue';

const searchQuery = ref('');
const sortBy = ref<string>('role');
const sortOrder = ref<'asc' | 'desc'>('asc');

const {
  data,
  isLoading: loading,
  error: queryError,
} = useQuery({
  queryKey: computed(() => queryKeys.admin.accounts({ query: { query: searchQuery.value, limit: 50 } })),
  queryFn: async () => {
    const res = await hc.admin.accounts.$get({
      query: { query: searchQuery.value, limit: 50 },
    });
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return res.json();
  },
});

const users = computed(() => data.value?.users ?? []);
const error = computed(() => (queryError.value ? 'データの取得に失敗しました' : ''));

const handleSearch = () => {
  // Triggered by v-model update or enter key, causing query key change
};

const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
};

const sortedUsers = computed(() => {
  if (!users.value) return [];

  return [...users.value].toSorted((a, b) => {
    let valA: string | number = '';
    let valB: string | number = '';

    switch (sortBy.value) {
      case 'role':
        valA = a.profile.role || 'z';
        valB = b.profile.role || 'z';
        break;
      case 'grade':
        valA = a.profile.grade ?? 99;
        valB = b.profile.grade ?? 99;
        break;
      case 'year':
        valA = a.profile.year || '';
        valB = b.profile.year || '';
        break;
      case 'name':
        valA = `${a.lastName} ${a.firstName}`;
        valB = `${b.lastName} ${b.firstName}`;
        break;
    }

    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});
</script>
