<template>
  <div class="container">
    <div v-if="!user" class="skeleton header-row">
      <div class="left">
        <div class="avatar-skeleton" />
        <div class="text-skeleton">
          <div class="name-skeleton">User Name</div>
          <div class="username-skeleton">@username</div>
        </div>
      </div>
      <div class="btn-skeleton" />
    </div>

    <div v-else-if="!isEditing" class="header-row">
      <div class="left">
        <div class="avatar">
          <img :src="safeImageUrl" :alt="user?.firstName || 'Profile'" class="avatar-img" />
        </div>
        <div class="text-content">
          <h2 class="name">{{ user?.lastName }} {{ user?.firstName }}</h2>
          <p class="username">@{{ user?.username }}</p>
        </div>
      </div>
      <Button variant="secondary" size="sm" @click="isEditing = true">編集</Button>
    </div>

    <form v-else enctype="multipart/form-data" class="edit-form" @submit.prevent="handleSubmit">
      <div class="fields">
        <div class="edit-row">
          <div class="avatar-edit">
            <img :src="safePreviewImageUrl" :alt="user?.firstName || 'Profile'" class="avatar-img" />
            <label class="avatar-overlay">
              <span class="change-text">変更</span>
              <input type="file" accept="image/*" class="file-input" @change="handleImageChange" />
            </label>
          </div>
          <Input v-model="formData.username" label="ユーザー名" />
        </div>

        <div class="grid-2">
          <Input v-model="formData.lastName" label="姓" />
          <Input v-model="formData.firstName" label="名" />
        </div>
      </div>

      <p v-if="message" :class="['message', isError ? 'message-error' : 'message-success']">
        {{ message }}
      </p>

      <div class="actions">
        <Button type="submit" variant="primary" :disabled="isSubmitting" full-width>
          {{ isSubmitting ? "保存中..." : "保存" }}
        </Button>
        <Button type="button" variant="secondary" full-width @click="cancelEdit"> キャンセル </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import Button from "@/src/components/ui/UiButton.vue"
import Input from "@/src/components/ui/UiInput.vue"
import hc from "@/src/lib/honoClient"
import { computed, reactive, ref, watch } from "vue"

const $accountPatch = hc.user.clerk.account.$patch

const emit = defineEmits<{ updated: [] }>()

interface ClerkUser {
  username?: string | null
  lastName?: string | null
  firstName?: string | null
  imageUrl?: string
}

const props = defineProps<{ user: ClerkUser | null }>()

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

function isSafeImageUrl(url: string): boolean {
  if (!url) return false
  if (typeof url !== "string") return false
  return (
    ((url.startsWith("http://") || url.startsWith("https://")) && !url.includes(" ")) ||
    url.startsWith("data:image/")
  )
}

const safeImageUrl = computed(() => {
  const imageUrl = props.user?.imageUrl
  return isSafeImageUrl(imageUrl || "") ? imageUrl : ""
})

const safePreviewImageUrl = computed(() => {
  return previewImage.value || safeImageUrl.value
})

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

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-width: 0;
}

.avatar,
.avatar-edit {
  position: relative;
  width: 3.5rem;
  height: 3.5rem;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--radius-full);
  box-shadow: 0 0 0 2px var(--bg-muted);
}

.avatar-skeleton {
  width: 3.5rem;
  height: 3.5rem;
  flex-shrink: 0;
  border-radius: var(--radius-full);
  background: var(--bg-muted-active);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 60%);
  opacity: 0.6;
  cursor: pointer;
  transition: opacity var(--transition-normal);
}

.avatar-edit:hover .avatar-overlay {
  opacity: 1;
}

.change-text {
  font-size: 0.625rem;
  color: var(--white);
  font-weight: var(--font-medium);
}

.file-input {
  position: absolute;
  inset: 0;
  width: -webkit-fill-available;
  height: fit-content;
  cursor: pointer;
  opacity: 0;
}

.text-content {
  min-width: 0;
}

.text-skeleton {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.name {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: var(--space-0);
  margin-bottom: var(--space-0);
}

.name-skeleton {
  height: 1.75rem;
  width: 8rem;
  background: var(--bg-muted-active);
  border-radius: var(--radius-md);
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: transparent;
}

.username {
  font-size: var(--text-base);
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: var(--space-0);
  margin-bottom: var(--space-0);
}

.username-skeleton {
  height: 1.25rem;
  width: 6rem;
  background: var(--bg-muted-active);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: transparent;
}

.btn-skeleton {
  height: 2rem;
  width: 3.5rem;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  background: var(--bg-muted-active);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.edit-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}

.fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.message {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.message-error {
  color: var(--red-500);
}

.message-success {
  color: var(--green-500);
}

.actions {
  display: flex;
  gap: var(--space-3);
  padding-top: var(--space-2);
}
</style>
