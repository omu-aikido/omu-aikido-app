<template>
  <div class="flex justify-center items-center my-4" data-testid="progress-indicator">
    <div
      :class="['text-sm p-2', step === 'basic' ? 'text-blue-500 font-semibold' : 'text-green-500']"
      data-testid="step-basic">
      基本情報
    </div>
    <div class="flex-1 border-t-2 border-border-dim transition-colors duration-500 ease-in-out" />
    <div
      :class="[
        'text-sm p-2',
        step === 'personal' ? 'text-blue-500 font-semibold' : step === 'profile' ? 'text-green-500' : 'text-subtext',
      ]"
      data-testid="step-personal">
      個人情報
    </div>
    <div class="flex-1 border-t-2 border-border-dim transition-colors duration-500 ease-in-out" />
    <div
      :class="['text-sm p-2', step === 'profile' ? 'text-blue-500 font-semibold' : 'text-subtext']"
      data-testid="step-profile">
      プロフィール
    </div>
  </div>
</template>

<script setup lang="ts">
type SignUpStep = 'basic' | 'personal' | 'profile';

defineProps<{ step: SignUpStep }>();
</script>
