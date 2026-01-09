<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
} from "@headlessui/vue"
import { AlertTriangleIcon } from "lucide-vue-next"

interface Props {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
}

interface Emits {
  (e: "confirm"): void
  (e: "cancel"): void
}

withDefaults(defineProps<Props>(), {
  confirmText: "削除する",
  cancelText: "キャンセル",
})

const emit = defineEmits<Emits>()
</script>

<template>
  <Dialog :open="open" @close="$emit('cancel')" class="relative z-60" data-testid="confirm-dialog">
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel
        class="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-xl border border-neutral-200 dark:border-neutral-700">
        <div class="flex items-start gap-4">
          <div
            class="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            <AlertTriangleIcon class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <DialogTitle class="text-lg font-bold text-neutral-900 dark:text-neutral-100" data-testid="confirm-title">
              {{ title }}
            </DialogTitle>
            <DialogDescription class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              {{ description }}
            </DialogDescription>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500"
            data-testid="cancel-btn">
            {{ cancelText }}
          </button>
          <button
            @click="$emit('confirm')"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:ring-offset-neutral-900"
            data-testid="confirm-btn">
            {{ confirmText }}
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
