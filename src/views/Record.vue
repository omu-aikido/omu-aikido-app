<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { format, startOfMonth, endOfMonth, parseISO, isSameDay } from "date-fns"
import { SignedIn } from "@clerk/vue"
import { XIcon, Trash2Icon } from "lucide-vue-next"
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue"
import { useActivity } from "@/src/composable/useActivity"
import ActivityList from "@/src/components/record/ActivityList.vue"
import ActivityForm from "@/src/components/record/ActivityForm.vue"
import ConfirmDialog from "@/src/components/ui/ConfirmDialog.vue"

const {
  activities,
  loading,
  error,
  fetchActivities,
  deleteActivity,
  addActivity,
} = useActivity()

const currentMonth = ref(new Date())
const isModalOpen = ref(false)
const selectedDate = ref(format(new Date(), "yyyy-MM-dd"))

// Confirm Dialog State
const confirmDialogOpen = ref(false)
const activityToDelete = ref<string | null>(null)

const fetchWithMonth = async () => {
  const startDate = format(startOfMonth(currentMonth.value), "yyyy-MM-dd")
  const endDate = format(endOfMonth(currentMonth.value), "yyyy-MM-dd")
  await fetchActivities({ startDate, endDate })
}

const handleDelete = (id: string) => {
  activityToDelete.value = id
  confirmDialogOpen.value = true
}

const handleConfirmDelete = async () => {
  if (activityToDelete.value) {
    await deleteActivity([activityToDelete.value])
    confirmDialogOpen.value = false
    activityToDelete.value = null
    await fetchWithMonth()
  }
}

const handleChangeMonth = async (date: Date) => {
  currentMonth.value = date
  await fetchWithMonth()
}

const handleSelectDate = (date: string) => {
  selectedDate.value = date
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSubmit = async (date: string, period: number) => {
  await addActivity(date, period)
  closeModal()
  await fetchWithMonth()
}

const selectedDateActivities = computed(() => {
  return activities.value.filter(a =>
    isSameDay(parseISO(a.date), parseISO(selectedDate.value))
  )
})

onMounted(() => {
  fetchWithMonth()
})
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] flex flex-col container mx-auto px-4">
    <SignedIn>
      <div class="flex-1 flex flex-col max-w-2xl mx-auto w-full space-y-4">
        <h1 class="text-2xl font-bold text-neutral-800 dark:text-neutral-200 shrink-0">活動記録</h1>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg shrink-0">
          {{ error }}
        </div>

        <!-- Calendar List -->
        <div class="flex-1 min-h-0">
          <ActivityList
            :activities="activities"
            :loading="loading"
            :current-month="currentMonth"
            @change-month="handleChangeMonth"
            @select-date="handleSelectDate" />
        </div>
      </div>

      <!-- Add Activity Modal (Headless UI) -->
      <Dialog :open="isModalOpen" @close="closeModal" class="relative z-50">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        <!-- Full-screen scrollable container -->
        <div class="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel
            class="w-full max-w-md bg-white dark:bg-neutral-800 rounded-xl shadow-xl p-6 border border-neutral-200 dark:border-neutral-700 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <DialogTitle class="text-lg font-bold text-neutral-900 dark:text-neutral-100"
                >記録を追加・編集</DialogTitle
              >
              <button
                @click="closeModal"
                class="p-1 rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                <XIcon class="w-5 h-5" />
              </button>
            </div>

            <ActivityForm :loading="loading" :initial-date="selectedDate" @submit="handleSubmit" />

            <!-- Existing Activities List -->
            <div
              v-if="selectedDateActivities.length > 0"
              class="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <h4 class="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3">この日の記録</h4>
              <div class="space-y-2">
                <div
                  v-for="activity in selectedDateActivities"
                  :key="activity.id"
                  class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                  <div class="flex items-baseline gap-2">
                    <span class="text-lg font-bold text-neutral-900 dark:text-neutral-100">{{ activity.period }}</span>
                    <span class="text-sm text-neutral-500 dark:text-neutral-400">時間</span>
                  </div>
                  <button
                    @click="handleDelete(activity.id)"
                    class="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    title="記録を削除">
                    <Trash2Icon class="w-4 h-4" />
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
