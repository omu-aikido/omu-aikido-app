<template>
  <h1 class="text-2xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">管理メニュー</h1>
  <TabGroup
    :selectedIndex="selectedIndex"
    @change="handleTabChange"
    as="div"
    class="border-b border-neutral-200 dark:border-neutral-700"
    data-testid="admin-menu">
    <TabList class="flex gap-1">
      <Tab v-slot="{ selected }" as="template">
        <button
          :class="[
            'px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none',
            selected
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-indigo-500 dark:hover:text-indigo-300 border-b-2 border-transparent',
          ]"
          data-testid="tab-dashboard">
          トップ
        </button>
      </Tab>
      <Tab v-slot="{ selected }" as="template">
        <button
          :class="[
            'px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none',
            selected
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-indigo-500 dark:hover:text-indigo-300 border-b-2 border-transparent',
          ]"
          data-testid="tab-accounts">
          アカウント
        </button>
      </Tab>
      <Tab v-slot="{ selected }" as="template">
        <button
          :class="[
            'px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none',
            selected
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-indigo-500 dark:hover:text-indigo-300 border-b-2 border-transparent',
          ]"
          data-testid="tab-norms">
          審査
        </button>
      </Tab>
    </TabList>
  </TabGroup>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { TabGroup, TabList, Tab } from "@headlessui/vue"

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: "ダッシュボード", path: "/admin" },
  { name: "アカウント管理", path: "/admin/accounts" },
  { name: "ノルマ管理", path: "/admin/norms" },
]

const selectedIndex = computed(() => {
  const currentPath = route.path
  if (currentPath.startsWith("/admin/users/")) return 1 // User detail belongs to accounts
  const index = tabs.findIndex(tab => tab.path === currentPath)
  return index !== -1 ? index : 0
})

const handleTabChange = (index: number) => {
  const tab = tabs[index]
  if (tab) {
    router.push(tab.path)
  }
}
</script>
