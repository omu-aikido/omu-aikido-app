<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/vue';
import { AlertTriangleIcon } from 'lucide-vue-next';

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
      <DialogPanel class="w-full max-w-96 rounded-2xl bg-bg-card p-6 shadow-xl border border-border">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-500">
            <AlertTriangleIcon class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <DialogTitle class="text-lg font-bold text-fg" data-testid="confirm-title">
              {{ title }}
            </DialogTitle>
            <DialogDescription class="mt-2 text-sm text-fg-dim">
              {{ description }}
            </DialogDescription>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            class="btn bg-bg-card text-fg-dim border border-border hover:bg-bg-muted"
            data-testid="cancel-btn"
            @click="$emit('cancel')">
            {{ cancelText }}
          </button>
          <button
            class="btn bg-red-500 text-white hover:bg-rose-600 border-none"
            data-testid="confirm-btn"
            @click="$emit('confirm')">
            {{ confirmText }}
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
