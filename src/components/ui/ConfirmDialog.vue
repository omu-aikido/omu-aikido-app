<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/vue';

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

interface Emits {
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

withDefaults(defineProps<Props>(), {
  confirmText: '削除する',
  cancelText: 'キャンセル',
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<Emits>();
</script>

<template>
  <Dialog :open="open" class="relative z-50" data-testid="confirm-dialog" @close="$emit('cancel')">
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-96 rounded-2xl bg-surface0 p-6 shadow-xl border border-border">
        <div class="flex-1">
          <DialogTitle class="text-lg font-bold text-text gap-2 flex-inline items-center" data-testid="confirm-title">
            <div class="i-lucide:triangle-alert sq-6" />
            {{ title }}
          </DialogTitle>
          <DialogDescription class="mt-2 text-sub">
            {{ description }}
          </DialogDescription>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button class="btn-secondary" data-testid="cancel-btn" @click="$emit('cancel')">
            {{ cancelText }}
          </button>
          <button class="btn-danger" data-testid="confirm-btn" @click="$emit('confirm')">
            {{ confirmText }}
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
