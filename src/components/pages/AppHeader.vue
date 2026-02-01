<script setup lang="ts">
import SidePanel from './SidePanel.vue';
import { SignedIn } from '@clerk/vue';
</script>

<template>
  <header data-testid="header-container">
    <RouterLink to="/" data-testid="header-logo-link">
      <img src="/favicon.svg" alt="Logo" data-testid="header-logo" />
    </RouterLink>
    <SignedIn>
      <SidePanel />
    </SignedIn>
  </header>
</template>

<style scoped>
header {
  top: 0;
  margin: 0;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}

img {
  --at-apply: 'w-8 h-8 m-4';
}
</style>
