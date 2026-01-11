<script setup lang="ts"></script>

<template>
  <footer class="footer" data-testid="footer-container">
    <div class="info" data-testid="footer-info">
      <p class="text">
        © OMU Aikido Club All Rights Reserved.
        <br />
        〒599-8531 大阪府堺市中区学園町1番1号 大阪公立大学合氣道部
      </p>
    </div>

    <div class="links" data-testid="footer-links">
      <a href="https://omu-aikido.com/privacy-policy" class="link" data-testid="footer-link-privacy">
        プライバシーポリシー
      </a>
      <a href="https://omu-aikido.com/terms-of-service" class="link" data-testid="footer-link-terms"> 利用規約 </a>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-body);
  padding: var(--space-4);
}

.info {
  padding: var(--space-4);
  text-align: center;
}

.text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.links {
  display: flex;
  gap: var(--space-4);
}

.link {
  color: var(--accent);
  transition: color var(--transition-normal);
}

.link:hover {
  color: var(--accent-hover);
}
</style>
