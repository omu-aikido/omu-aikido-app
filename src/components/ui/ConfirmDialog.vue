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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<Emits>()
</script>

<template>
  <Dialog :open="open" class="dialog" data-testid="confirm-dialog" @close="$emit('cancel')">
    <div class="backdrop" aria-hidden="true" />

    <div class="dialog-container">
      <DialogPanel class="panel">
        <div class="content">
          <div class="icon-wrapper">
            <AlertTriangleIcon class="icon" />
          </div>
          <div class="text-content">
            <DialogTitle class="title" data-testid="confirm-title">
              {{ title }}
            </DialogTitle>
            <DialogDescription class="description">
              {{ description }}
            </DialogDescription>
          </div>
        </div>

        <div class="actions">
          <button class="btn-cancel" data-testid="cancel-btn" @click="$emit('cancel')">
            {{ cancelText }}
          </button>
          <button class="btn-confirm" data-testid="confirm-btn" @click="$emit('confirm')">
            {{ confirmText }}
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

<style scoped>
.dialog {
  position: relative;
  z-index: 60;
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(4px);
}

.dialog-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.panel {
  width: 100%;
  max-width: 24rem;
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
}

.content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}

.icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-full);
  background: var(--error-bg);
  color: var(--red-500);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.text-content {
  flex: 1;
}

.title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.description {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.actions {
  margin-top: var(--space-6);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.btn-cancel {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.btn-cancel:hover {
  background: var(--bg-muted);
}

.btn-cancel:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--text-placeholder);
}

.btn-confirm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: white;
  background: var(--red-500);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.btn-confirm:hover {
  background: var(--rose-600);
}

.btn-confirm:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--red-500), 0 0 0 4px var(--bg-card);
}
</style>
