<script setup lang="ts">
import SidePanel from "./SidePanel.vue"
</script>

<template>
  <header class="header" data-testid="header-container">
    <RouterLink to="/" data-testid="header-logo-link">
      <img src="/favicon.svg" alt="Logo" class="logo" data-testid="header-logo" />
    </RouterLink>
    <SidePanel />
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: var(--z-dropdown);
  margin: 0;
  display: flex;
  height: 4rem;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(12px);
  background: var(--bg-body);
  padding: 0 var(--space-6);
  color: var(--text-primary);
  user-select: none;
}

.logo {
  height: 2rem;
  width: auto;
}
</style>
