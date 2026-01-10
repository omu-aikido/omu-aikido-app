<script setup lang="ts">
import { ref, computed } from "vue"
import { format, startOfMonth, endOfMonth, parseISO, isSameDay } from "date-fns"
import { SignedIn } from "@clerk/vue"
import { XIcon, Trash2Icon } from "lucide-vue-next"
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue"
import { useActivities, useAddActivity, useDeleteActivity } from "@/src/composable/useActivity"
import ActivityList from "@/src/components/record/ActivityList.vue"
import ActivityForm from "@/src/components/record/ActivityForm.vue"
import ConfirmDialog from "@/src/components/ui/ConfirmDialog.vue"

// Mutations
const { mutateAsync: addActivity } = useAddActivity()
const { mutateAsync: deleteActivity } = useDeleteActivity()

// State
const currentMonth = ref(new Date())
const isModalOpen = ref(false)
const selectedDate = ref(format(new Date(), "yyyy-MM-dd"))
const confirmDialogOpen = ref(false)
const activityToDelete = ref<string | null>(null)

// Query
const filters = computed(() => ({
  startDate: format(startOfMonth(currentMonth.value), "yyyy-MM-dd"),
  endDate: format(endOfMonth(currentMonth.value), "yyyy-MM-dd"),
}))

const {
  data: activitiesRaw,
  isLoading: loading,
  error: queryError,
} = useActivities(filters)

const activities = computed(() => activitiesRaw.value ?? [])
const error = computed(() =>
  queryError.value ? "活動記録の取得に失敗しました" : null
)

const handleDelete = (id: string) => {
  activityToDelete.value = id
  confirmDialogOpen.value = true
}

const handleConfirmDelete = async () => {
  if (activityToDelete.value) {
    await deleteActivity([activityToDelete.value])
    confirmDialogOpen.value = false
    activityToDelete.value = null
  }
}

const handleChangeMonth = (date: Date) => {
  currentMonth.value = date
}

const handleSelectDate = (date: string) => {
  selectedDate.value = date
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSubmit = async (date: string, period: number) => {
  await addActivity({ date, period })
  closeModal()
}

const selectedDateActivities = computed(() => {
  return activities.value.filter(a =>
    isSameDay(parseISO(a.date), parseISO(selectedDate.value))
  )
})
</script>

<template>
  <div class="container">
    <SignedIn>
      <div class="content">
        <h1 class="title">活動記録</h1>

        <div v-if="error" class="error-banner">
          {{ error }}
        </div>

        <div class="calendar-container">
          <ActivityList
            :activities="activities"
            :loading="loading"
            :current-month="currentMonth"
            @change-month="handleChangeMonth"
            @select-date="handleSelectDate" />
        </div>
      </div>

      <Dialog :open="isModalOpen" class="modal" @close="closeModal">
        <div class="backdrop" aria-hidden="true" />
        <div class="modal-container">
          <DialogPanel class="modal-panel">
            <div class="modal-header">
              <DialogTitle class="modal-title"> 記録を追加・編集 </DialogTitle>
              <button class="close-btn" @click="closeModal">
                <XIcon class="close-icon" />
              </button>
            </div>

            <ActivityForm :loading="loading" :initial-date="selectedDate" @submit="handleSubmit" />

            <div v-if="selectedDateActivities.length > 0" class="existing-records">
              <h4 class="records-title">この日の記録</h4>
              <div class="records-list">
                <div v-for="activity in selectedDateActivities" :key="activity.id" class="record-item">
                  <div class="record-info">
                    <span class="record-value">{{ activity.period }}</span>
                    <span class="record-unit">時間</span>
                  </div>
                  <button class="delete-btn" title="記録を削除" @click="handleDelete(activity.id)">
                    <Trash2Icon class="delete-icon" />
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <ConfirmDialog
        :open="confirmDialogOpen"
        title="記録の削除"
        description="この記録を削除してもよろしいですか？この操作は取り消せません。"
        confirm-text="削除する"
        cancel-text="キャンセル"
        @confirm="handleConfirmDelete"
        @cancel="confirmDialogOpen = false" />
    </SignedIn>
  </div>
</template>

<style scoped>
.container {
  min-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  max-width: var(--container-max);
  margin-inline: auto;
  padding-inline: var(--space-4);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 42rem;
  margin-inline: auto;
  width: 100%;
  gap: var(--space-4);
}

.title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  flex-shrink: 0;
}

.error-banner {
  background: var(--error-bg);
  color: var(--red-500);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.calendar-container {
  flex: 1;
  min-height: 0;
}

.modal {
  position: relative;
  z-index: var(--z-dropdown);
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(4px);
}

.modal-container {
  position: fixed;
  inset: 0;
  display: flex;
  width: 100vw;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.modal-panel {
  width: 100%;
  max-width: 28rem;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  border: 1px solid var(--border);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.close-btn {
  padding: var(--space-1);
  border-radius: var(--radius-full);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.close-btn:hover {
  background: var(--bg-muted);
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.existing-records {
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border);
}

.records-title {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
}

.record-info {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.record-value {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.record-unit {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.delete-btn {
  padding: var(--space-2);
  color: var(--border-strong);
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: color var(--transition-normal), background var(--transition-normal);
}

.delete-btn:hover {
  color: var(--red-500);
  background: var(--bg-muted);
}

.delete-icon {
  width: 1rem;
  height: 1rem;
}
</style>
