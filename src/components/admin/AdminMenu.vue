<template>
  <h1 class="title">管理メニュー</h1>
  <TabGroup
    :selected-index="selectedIndex"
    as="div"
    class="tab-container"
    data-testid="admin-menu"
    @change="handleTabChange">
    <TabList class="tab-list">
      <Tab v-slot="{ selected }" as="template">
        <button :class="['tab', { 'tab-selected': selected }]" data-testid="tab-dashboard">トップ</button>
      </Tab>
      <Tab v-slot="{ selected }" as="template">
        <button :class="['tab', { 'tab-selected': selected }]" data-testid="tab-accounts">アカウント</button>
      </Tab>
      <Tab v-slot="{ selected }" as="template">
        <button :class="['tab', { 'tab-selected': selected }]" data-testid="tab-norms">審査</button>
      </Tab>
    </TabList>
  </TabGroup>
</template>

<script setup lang="ts">
import { Tab, TabGroup, TabList } from "@headlessui/vue"
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: "ダッシュボード", path: "/admin" },
  { name: "アカウント管理", path: "/admin/accounts" },
  { name: "ノルマ管理", path: "/admin/norms" },
]

const selectedIndex = computed(() => {
  const currentPath = route.path
  if (currentPath.startsWith("/admin/users/")) return 1
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

<style scoped>
.title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}

.tab-container {
  border-bottom: 1px solid var(--border-dim);
}

.tab-list {
  display: flex;
  gap: var(--space-1);
}

.tab {
  padding: var(--space-2-5) var(--space-4);

  /* padding-block overrides padding shorthand, so we can just update the top/bottom padding above or merge it */
  padding-block: 0.625rem;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--transition-normal), border-color var(--transition-normal);
}

.tab:focus {
  outline: none;
}

.tab:hover:not(.tab-selected) {
  color: var(--primary);
}
</style>
