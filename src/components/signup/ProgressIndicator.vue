<template>
  <div class="indicator" data-testid="progress-indicator">
    <div :class="['step', step === 'basic' ? 'step-active' : 'step-complete']" data-testid="step-basic">基本情報</div>
    <div class="divider" />
    <div
      :class="[
        'step',
        step === 'personal' ? 'step-active' : step === 'profile' ? 'step-complete' : 'step-inactive'
      ]"
      data-testid="step-personal">
      個人情報
    </div>
    <div class="divider" />
    <div :class="['step', step === 'profile' ? 'step-active' : 'step-inactive']" data-testid="step-profile">
      プロフィール
    </div>
  </div>
</template>

<script setup lang="ts">
type SignUpStep = "basic" | "personal" | "profile"

defineProps<{ step: SignUpStep }>()
</script>

<style scoped>
.indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: var(--space-4) 0;
}

.step {
  font-size: var(--text-sm);
  padding: var(--space-2);
}

.step-active {
  color: var(--accent);
  font-weight: var(--font-semibold);
}

.step-complete {
  color: var(--green-500);
}

.step-inactive {
  color: var(--text-secondary);
}

.divider {
  flex: 1;
  border-top: 2px solid var(--border);
  transition: border-color 500ms ease-in-out;
}
</style>
