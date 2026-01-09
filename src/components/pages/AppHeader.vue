<script setup lang="ts">
import SidePanel from "./SidePanel.vue"
</script>

<template>
  <header
    class="sticky top-0 z-50 m-0 flex h-16 w-full items-center justify-between backdrop-blur-lg bg-neutral-200 dark:bg-neutral-800 px-6 py-0 text-neutral-900 select-none dark:text-neutral-200"
    data-testid="header-container">
    <RouterLink to="/" data-testid="header-logo-link">
      <img src="/favicon.svg" alt="Logo" class="h-8 w-auto" data-testid="header-logo" />
    </RouterLink>
    <SidePanel />
  </header>
</template>
