<script setup lang="ts">
import { tv } from "tailwind-variants"

const card = tv({
  base: "bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 md:p-5 w-full h-full",
})
</script>

<template>
  <div :class="card()" data-testid="card">
    <slot />
  </div>
</template>
