<template>
  <div class="page-container" data-testid="not-found-page">
    <div class="content">
      <img src="/404%20NotFound.png" alt="404 Not Found" class="error-image" />
      <h1 class="title">ページが見つかりません</h1>
      <p class="message">お探しのページは存在しないか、移動した可能性があります。</p>
      <RouterLink to="/" class="back-btn"> トップに戻る </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  padding: var(--space-4);
}

.content {
  text-align: center;
  width: 100%;
  max-width: 32rem;
}

.error-image {
  width: 100%;
  height: auto;
  margin-bottom: var(--space-8);
  margin-inline: auto;
}

.title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.message {
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
}

.back-btn {
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  background: var(--accent);
  color: white;
  font-weight: var(--font-medium);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: background var(--transition-normal);
}

.back-btn:hover {
  background: var(--accent-hover);
}
</style>
