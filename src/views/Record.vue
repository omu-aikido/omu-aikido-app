<script setup lang="ts">
import { ref, computed } from 'vue';
import { format, startOfMonth, endOfMonth, parseISO, isSameDay } from 'date-fns';
import { SignedIn } from '@clerk/vue';
import { XIcon, Trash2Icon } from 'lucide-vue-next';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { useActivities, useAddActivity, useDeleteActivity } from '@/src/composable/useActivity';
import ActivityList from '@/src/components/record/ActivityList.vue';
import ActivityForm from '@/src/components/record/ActivityForm.vue';
import ConfirmDialog from '@/src/components/ui/ConfirmDialog.vue';

// Mutations
const { mutateAsync: addActivity } = useAddActivity();
const { mutateAsync: deleteActivity } = useDeleteActivity();

// State
const currentMonth = ref(new Date());
const isModalOpen = ref(false);
const selectedDate = ref(format(new Date(), 'yyyy-MM-dd'));
const confirmDialogOpen = ref(false);
const activityToDelete = ref<string | null>(null);

// Query
const filters = computed(() => ({
  startDate: format(startOfMonth(currentMonth.value), 'yyyy-MM-dd'),
  endDate: format(endOfMonth(currentMonth.value), 'yyyy-MM-dd'),
}));

const { data: activitiesRaw, isLoading: loading, error: queryError } = useActivities(filters);

const activities = computed(() => activitiesRaw.value ?? []);
const error = computed(() => (queryError.value ? '活動記録の取得に失敗しました' : null));

const handleDelete = (id: string) => {
  activityToDelete.value = id;
  confirmDialogOpen.value = true;
};

const handleConfirmDelete = async () => {
  if (activityToDelete.value) {
    try {
      await deleteActivity([activityToDelete.value]);
      confirmDialogOpen.value = false;
      activityToDelete.value = null;
    } catch (e) {
      console.error('Failed to delete activity:', e);
      alert('記録の削除に失敗しました。');
    }
  }
};

const handleChangeMonth = (date: Date) => {
  currentMonth.value = date;
};

const handleSelectDate = (date: string) => {
  selectedDate.value = date;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSubmit = async (date: string, period: number) => {
  try {
    await addActivity({ date, period });
    closeModal();
  } catch (e) {
    console.error('Failed to add activity:', e);
    alert('記録の追加に失敗しました。');
  }
};

const selectedDateActivities = computed(() => {
  return activities.value.filter((a) => isSameDay(parseISO(a.date), parseISO(selectedDate.value)));
});
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] flex flex-col max-w-7xl mx-auto px-4">
    <SignedIn>
      <div class="flex-1 flex flex-col max-w-2xl mx-auto w-full gap-4">
        <h1 class="text-2xl font-bold text-fg shrink-0">活動記録</h1>

        <div v-if="error" class="bg-red-50 text-red-500 p-4 rounded-lg shrink-0 dark:bg-red-900/10">
          {{ error }}
        </div>

        <div class="flex-1 min-h-0">
          <ActivityList
            :activities="activities"
            :loading="loading"
            :current-month="currentMonth"
            @change-month="handleChangeMonth"
            @select-date="handleSelectDate" />
        </div>
      </div>

      <Dialog :open="isModalOpen" class="relative z-50" @close="closeModal">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-[4px]" aria-hidden="true" />
        <div class="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel
            class="w-full max-w-md bg-bg rounded-xl shadow-md p-6 border border-border-dim max-h-[90vh] overflow-y-auto">
            <div class="flex-between mb-4">
              <DialogTitle class="text-lg font-bold text-fg"> 記録を追加・編集 </DialogTitle>
              <button
                class="p-1 rounded-full bg-transparent border-none text-fg-dim cursor-pointer transition-colors hover:bg-bg-dim"
                @click="closeModal">
                <XIcon class="w-5 h-5" />
              </button>
            </div>

            <ActivityForm :loading="loading" :initial-date="selectedDate" @submit="handleSubmit" />

            <div v-if="selectedDateActivities.length > 0" class="mt-8 pt-6 border-t border-border-dim">
              <h4 class="text-sm font-bold text-fg-dim mb-3">この日の記録</h4>
              <div class="flex flex-col gap-2">
                <div
                  v-for="activity in selectedDateActivities"
                  :key="activity.id"
                  class="flex-between p-3 bg-bg rounded-lg">
                  <div class="flex items-baseline gap-2">
                    <span class="text-lg font-bold text-fg">{{ activity.period }}</span>
                    <span class="text-sub">時間</span>
                  </div>
                  <button
                    class="p-2 text-gray-400 bg-transparent border-none rounded-full cursor-pointer transition-colors hover:text-red-500 hover:bg-bg-dim"
                    title="記録を削除"
                    @click="handleDelete(activity.id)">
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
