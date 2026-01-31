<script setup lang="ts"></script>

<template>
  <footer data-testid="footer-container" class="flex flex-col items-center justify-center m-8">
    <p class="text-center" data-testid="footer-info">
      © OMU Aikido Club All Rights Reserved.
      <br />
      〒599-8531 大阪府堺市中区学園町1番1号 大阪公立大学合氣道部
    </p>

    <div data-testid="footer-links" uno-pt-2>
      <a href="https://omu-aikido.com/privacy-policy" class="link" data-testid="footer-link-privacy">
        プライバシーポリシー
      </a>
      &nbsp;
      <a href="https://omu-aikido.com/terms-of-service" class="link" data-testid="footer-link-terms"> 利用規約 </a>
    </div>
  </footer>
</template>

<style scoped>
.link {
  --at-apply: 'text-blue hover:underline';
}
</style>
