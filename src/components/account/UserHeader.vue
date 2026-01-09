<template>
  <div class="space-y-4">
    <div v-if="!user" class="flex items-center justify-between gap-4 animate-pulse">
      <div class="flex items-center gap-4 min-w-0">
        <!-- Profile Image Skeleton -->
        <div class="h-14 w-14 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
        <div class="min-w-0 space-y-1">
          <!-- Name Skeleton -->
          <div class="h-7 w-32 bg-neutral-200 dark:bg-neutral-700 rounded text-lg font-bold text-transparent">
            User Name
          </div>
          <!-- Username Skeleton -->
          <div class="h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded text-sm text-transparent">@username</div>
        </div>
      </div>
      <!-- Edit Button Skeleton -->
      <div class="h-8 w-14 shrink-0 rounded-md bg-neutral-200 dark:bg-neutral-700"></div>
    </div>

    <div v-else-if="!isEditing" class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-4 min-w-0">
        <!-- Profile Image -->
        <div class="h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-neutral-100 dark:ring-neutral-700">
          <img :src="safeImageUrl" :alt="user?.firstName || 'Profile'" class="h-full w-full object-cover" />
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">
            {{ user?.lastName }} {{ user?.firstName }}
          </h2>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">@{{ user?.username }}</p>
        </div>
      </div>
      <button
        @click="isEditing = true"
        class="shrink-0 rounded-md bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 shadow-sm ring-1 ring-inset ring-neutral-300 dark:ring-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
        編集
      </button>
    </div>

    <!-- Edit Mode -->
    <form v-else @submit.prevent="handleSubmit" enctype="multipart/form-data" class="space-y-4">
      <!-- Image Upload -->
      <div class="flex items-start gap-4">
        <div
          class="group relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-neutral-100 dark:ring-neutral-700">
          <img :src="safePreviewImageUrl" :alt="user?.firstName || 'Profile'" class="h-full w-full object-cover" />
          <label
            class="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/60 opacity-60 transition-opacity group-hover:opacity-100">
            <span class="text-[10px] text-white font-medium">変更</span>
            <input
              type="file"
              accept="image/*"
              class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              @change="handleImageChange" />
          </label>
        </div>

        <div class="flex-1 space-y-4">
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"> ユーザー名 </label>
            <input
              v-model="formData.username"
              type="text"
              class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"> 姓 </label>
              <input
                v-model="formData.lastName"
                type="text"
                class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"> 名 </label>
              <input
                v-model="formData.firstName"
                type="text"
                class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" />
            </div>
          </div>
        </div>
      </div>

      <p v-if="message" :class="messageClass" class="text-xs font-medium">
        {{ message }}
      </p>

      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {{ isSubmitting ? "保存中..." : "保存" }}
        </button>
        <button
          type="button"
          @click="cancelEdit"
          class="flex-1 rounded-md bg-white dark:bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 shadow-sm ring-1 ring-inset ring-neutral-300 dark:ring-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
          キャンセル
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue"
import hc from "@/src/lib/honoClient"

const $accountPatch = hc.user.clerk.account.$patch

const emit = defineEmits<{ updated: [] }>()
const props = defineProps<{ user: any | null }>()

const isEditing = ref(false)
const isSubmitting = ref(false)
const message = ref("")
const isError = ref(false)
const previewImage = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

interface FormData {
  username: string
  lastName: string
  firstName: string
}

const formData = reactive<FormData>({
  username: props.user?.username || "",
  lastName: props.user?.lastName || "",
  firstName: props.user?.firstName || "",
})

// 画像URL の安全性チェック（XSS対策）
function isSafeImageUrl(url: string): boolean {
  if (!url) return false
  if (typeof url !== "string") return false
  return (
    ((url.startsWith("http://") || url.startsWith("https://")) &&
      !url.includes(" ")) ||
    url.startsWith("data:image/")
  )
}

const safeImageUrl = computed(() => {
  const imageUrl = props.user?.imageUrl
  return isSafeImageUrl(imageUrl) ? imageUrl : ""
})

const safePreviewImageUrl = computed(() => {
  return previewImage.value || safeImageUrl.value
})

const messageClass = computed(() =>
  isError.value
    ? "text-red-600 dark:text-red-400"
    : "text-green-600 dark:text-green-400"
)

// propsの変更を監視してformDataを更新
watch(
  () => props.user,
  newUser => {
    if (newUser && !isEditing.value) {
      formData.username = newUser.username || ""
      formData.lastName = newUser.lastName || ""
      formData.firstName = newUser.firstName || ""
      previewImage.value = null
      selectedFile.value = null
    }
  },
  { deep: true }
)

function updateFormData() {
  if (props.user) {
    formData.username = props.user.username || ""
    formData.lastName = props.user.lastName || ""
    formData.firstName = props.user.firstName || ""
    previewImage.value = null
    selectedFile.value = null
  }
}

function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    selectedFile.value = file
    const reader = new FileReader()
    reader.onload = e => {
      previewImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

async function handleSubmit() {
  message.value = ""
  isError.value = false
  isSubmitting.value = true

  try {
    const res = await $accountPatch({
      form: {
        username: formData.username,
        lastName: formData.lastName,
        firstName: formData.firstName,
        profileImage: selectedFile.value,
      },
    })

    if (!res.ok) throw new Error("アカウント情報の更新に失敗しました")

    message.value = "アカウント情報を更新しました"
    emit("updated")

    setTimeout(() => {
      isEditing.value = false
      message.value = ""
    }, 1000)
  } catch (err) {
    isError.value = true
    message.value = err instanceof Error ? err.message : String(err)
  } finally {
    isSubmitting.value = false
  }
}

function cancelEdit() {
  updateFormData()
  isEditing.value = false
}
</script>
