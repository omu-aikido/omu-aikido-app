<script setup lang="ts">
import { tv } from "tailwind-variants"

const link = tv({
  base: "text-blue-600 transition-colors duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300",
})
</script>

<template>
  <footer
    class="flex flex-col items-center justify-center bg-neutral-200 p-4 dark:bg-neutral-800"
    data-testid="footer-container">
    <div class="items-center p-4 text-center" data-testid="footer-info">
      <p class="text-sm text-neutral-800 dark:text-neutral-200">
        © OMU Aikido Club All Rights Reserved.
        <br />
        〒599-8531 大阪府堺市中区学園町1番1号 大阪公立大学合氣道部
      </p>
    </div>

    <div class="space-x-4" data-testid="footer-links">
      <a href="https://omu-aikido.com/privacy-policy" :class="link()" data-testid="footer-link-privacy">
        プライバシーポリシー
      </a>
      <a href="https://omu-aikido.com/terms-of-service" :class="link()" data-testid="footer-link-terms"> 利用規約 </a>
    </div>
  </footer>
</template>
