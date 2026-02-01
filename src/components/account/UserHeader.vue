<template>
  <div class="stack">
    <div v-if="!user" class="animate-pulse flex-between gap-4">
      <div class="flex items-center gap-4 min-w-0">
        <div class="avatar-lg bg-overlay1" />
        <div class="min-w-0 flex flex-col gap-1">
          <div class="h-7 w-32 bg-overlay1 rounded-md text-lg font-bold text-transparent">User Name</div>
          <div class="h-5 w-24 bg-overlay1 rounded-md text-base text-transparent">@username</div>
        </div>
      </div>
      <div class="h-8 w-14 shrink-0 rounded-md bg-overlay1" />
    </div>

    <div v-else-if="!isEditing" class="flex-between gap-4">
      <div class="flex items-center gap-4 min-w-0">
        <div class="relative w-14 h-14 shrink-0 overflow-hidden rounded-full shadow-[0_0_0_2px_var(--color-overlay0)]">
          <img :src="safeImageUrl" :alt="user?.firstName || 'Profile'" uno-rounded-img />
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-bold text-text truncate my-0">{{ user?.lastName }} {{ user?.firstName }}</h2>
          <p class="text-base text-text-dim truncate my-0">@{{ user?.username }}</p>
        </div>
      </div>
      <button type="button" class="btn-secondary px-3 py-1.5 text-sm" @click="isEditing = true">編集</button>
    </div>

    <form v-else enctype="multipart/form-data" class="stack" @submit.prevent="handleSubmit">
      <div class="flex-1 stack">
        <div class="flex items-start gap-4">
          <div
            class="relative w-14 h-14 shrink-0 overflow-hidden rounded-full shadow-[0_0_0_2px_var(--color-overlay0)] group">
            <img :src="safePreviewImageUrl" :alt="user?.firstName || 'Profile'" uno-rounded-img />
            <label
              class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-60 cursor-pointer transition-opacity duration-200 group-hover:opacity-100">
              <span class="text-[0.625rem] text-white font-medium">変更</span>
              <input
                type="file"
                accept="image/*"
                class="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                @change="handleImageChange" />
            </label>
          </div>
          <Input v-model="formData.username" label="ユーザー名" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <Input v-model="formData.lastName" label="姓" />
          <Input v-model="formData.firstName" label="名" />
        </div>
      </div>

      <p v-if="message" :class="['text-sm font-medium', isError ? 'text-red-500' : 'text-green-500']">
        {{ message }}
      </p>

      <div class="flex gap-3 pt-2">
        <button type="submit" class="btn-primary w-full" :disabled="isSubmitting">
          {{ isSubmitting ? '保存中...' : '保存' }}
        </button>
        <button type="button" class="btn-secondary w-full" @click="cancelEdit">キャンセル</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import Input from '@/src/components/ui/UiInput.vue';
import hc from '@/src/lib/honoClient';
import { computed, reactive, ref, watch } from 'vue';

const $accountPatch = hc.user.clerk.account.$patch;

const emit = defineEmits<{ updated: [] }>();

interface ClerkUser {
  username?: string | null;
  lastName?: string | null;
  firstName?: string | null;
  imageUrl?: string;
}

const props = defineProps<{ user: ClerkUser | null }>();

const isEditing = ref(false);
const isSubmitting = ref(false);
const message = ref('');
const isError = ref(false);
const previewImage = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

interface FormData {
  username: string;
  lastName: string;
  firstName: string;
}

const formData = reactive<FormData>({
  username: props.user?.username || '',
  lastName: props.user?.lastName || '',
  firstName: props.user?.firstName || '',
});

function isSafeImageUrl(url: string): boolean {
  if (!url) return false;
  if (typeof url !== 'string') return false;
  return (
    ((url.startsWith('http://') || url.startsWith('https://')) && !url.includes(' ')) || url.startsWith('data:image/')
  );
}

const safeImageUrl = computed(() => {
  const imageUrl = props.user?.imageUrl;
  return isSafeImageUrl(imageUrl || '') ? imageUrl : '';
});

const safePreviewImageUrl = computed(() => {
  return previewImage.value || safeImageUrl.value;
});

watch(
  () => props.user,
  (newUser) => {
    if (newUser && !isEditing.value) {
      formData.username = newUser.username || '';
      formData.lastName = newUser.lastName || '';
      formData.firstName = newUser.firstName || '';
      previewImage.value = null;
      selectedFile.value = null;
    }
  },
  { deep: true }
);

function updateFormData() {
  if (props.user) {
    formData.username = props.user.username || '';
    formData.lastName = props.user.lastName || '';
    formData.firstName = props.user.firstName || '';
    previewImage.value = null;
    selectedFile.value = null;
  }
}

function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    selectedFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

async function handleSubmit() {
  message.value = '';
  isError.value = false;
  isSubmitting.value = true;

  try {
    const res = await $accountPatch({
      form: {
        username: formData.username,
        lastName: formData.lastName,
        firstName: formData.firstName,
        profileImage: selectedFile.value,
      },
    });

    if (!res.ok) throw new Error('アカウント情報の更新に失敗しました');

    message.value = 'アカウント情報を更新しました';
    emit('updated');

    setTimeout(() => {
      isEditing.value = false;
      message.value = '';
    }, 1000);
  } catch (err) {
    isError.value = true;
    message.value = err instanceof Error ? err.message : String(err);
  } finally {
    isSubmitting.value = false;
  }
}

function cancelEdit() {
  updateFormData();
  isEditing.value = false;
}
</script>
