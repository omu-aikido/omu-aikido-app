<template>
  <div class="min-h-screen flex items-center justify-center bg-base p-4" data-testid="not-found-page">
    <div class="text-center w-full max-w-lg">
      <img src="/404%20NotFound.png" alt="404 Not Found" class="w-full h-auto mb-8 mx-auto" />
      <h1 class="heading-1 mb-4">ページが見つかりません</h1>
      <p class="text-subtext mb-8">お探しのページは存在しないか、移動した可能性があります。</p>
      <RouterLink
        to="/"
        class="inline-block px-6 py-3 bg-blue-500 text-white font-medium rounded-lg no-underline transition-colors hover:bg-blue-600">
        トップに戻る
      </RouterLink>
    </div>
  </div>
</template>
