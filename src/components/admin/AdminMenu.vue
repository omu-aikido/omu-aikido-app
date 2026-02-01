<template>
  <h1 class="text-2xl font-bold mb-2 text-fg">管理メニュー</h1>
  <TabGroup
    :selected-index="selectedIndex"
    as="div"
    class="border-b border-border-dim"
    data-testid="admin-menu"
    @change="handleTabChange">
    <TabList class="flex gap-1">
      <Tab v-slot="{ selected }" as="template">
        <button
          :class="[
            'px-4 py-2.5 text-sm font-medium bg-transparent border-none border-b-2 cursor-pointer transition-colors outline-none',
            selected ? 'border-blue-500 text-blue-500' : 'border-transparent text-fg-dim hover:text-blue-500',
          ]"
          data-testid="tab-dashboard">
          トップ
        </button>
      </Tab>
      <Tab v-slot="{ selected }" as="template">
        <button
          :class="[
            'px-4 py-2.5 text-sm font-medium bg-transparent border-none border-b-2 cursor-pointer transition-colors outline-none',
            selected ? 'border-blue-500 text-blue-500' : 'border-transparent text-fg-dim hover:text-blue-500',
          ]"
          data-testid="tab-accounts">
          アカウント
        </button>
      </Tab>
      <Tab v-slot="{ selected }" as="template">
        <button
          :class="[
            'px-4 py-2.5 text-sm font-medium bg-transparent border-none border-b-2 cursor-pointer transition-colors outline-none',
            selected ? 'border-blue-500 text-blue-500' : 'border-transparent text-fg-dim hover:text-blue-500',
          ]"
          data-testid="tab-norms">
          審査
        </button>
      </Tab>
    </TabList>
  </TabGroup>
</template>

<script setup lang="ts">
import { Tab, TabGroup, TabList } from '@headlessui/vue';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const tabs = [
  { name: 'ダッシュボード', path: '/admin' },
  { name: 'アカウント管理', path: '/admin/accounts' },
  { name: 'ノルマ管理', path: '/admin/norms' },
];

const selectedIndex = computed(() => {
  const currentPath = route.path;
  if (currentPath.startsWith('/admin/users/')) return 1;
  const index = tabs.findIndex((tab) => tab.path === currentPath);
  return index !== -1 ? index : 0;
});

const handleTabChange = (index: number) => {
  const tab = tabs[index];
  if (tab) {
    router.push(tab.path);
  }
};
</script>
