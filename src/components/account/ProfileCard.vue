<template>
  <div class="container">
    <div v-if="!profile" class="skeleton" data-testid="loading-skeleton">
      <div class="header-row">
        <h3 class="title">プロフィール</h3>
        <div class="skeleton-btn" />
      </div>
      <div class="info-list">
        <div class="info-row">
          <span class="info-label">級段位</span>
          <span class="skeleton-text">五段</span>
        </div>
        <div class="info-row">
          <span class="info-label">取得日</span>
          <span class="skeleton-text">2024/01/01</span>
        </div>
        <div class="info-row">
          <span class="info-label">入部年</span>
          <span class="skeleton-text">2024</span>
        </div>
        <div class="info-row">
          <span class="info-label">学年</span>
          <span class="skeleton-text">学部4年</span>
        </div>
      </div>
    </div>

    <div v-else-if="!isEditing" class="display-mode">
      <div class="header-row">
        <h3 class="title">プロフィール</h3>
        <button class="btn-edit" @click="isEditing = true">編集</button>
      </div>
      <div class="info-list">
        <div class="info-row">
          <span class="info-label">級段位</span>
          <span class="info-value">{{ translateGrade(profile?.grade ?? "") || "-" }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">取得日</span>
          <span class="info-value">
            {{ profile?.getGradeAt ? new Date(profile.getGradeAt).toLocaleDateString() : "-" }}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">入部年</span>
          <span class="info-value">{{ profile?.joinedAt || "-" }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">学年</span>
          <span class="info-value">{{ translateYear(profile?.year ?? "") || "-" }}</span>
        </div>
      </div>
    </div>

    <form v-else class="edit-form" @submit.prevent="handleSubmit">
      <div class="field">
        <label class="label">級段位</label>
        <Listbox v-model="formData.grade">
          <div class="listbox-container">
            <ListboxButton class="listbox-btn">
              <span class="listbox-value">{{ translateGrade(formData.grade) }}</span>
              <span class="listbox-icon">
                <ChevronsUpDownIcon class="icon-sm" aria-hidden="true" />
              </span>
            </ListboxButton>
            <transition leave-active-class="leave-active" leave-from-class="leave-from" leave-to-class="leave-to">
              <ListboxOptions class="listbox-options">
                <ListboxOption
                  v-for="gradeOption in gradeOptions"
                  :key="gradeOption.grade"
                  v-slot="{ active, selected }"
                  :value="gradeOption.grade">
                  <li :class="['listbox-option', { 'option-active': active }]">
                    <span :class="['option-text', { 'option-selected': selected }]">
                      {{ gradeOption.name }}
                    </span>
                    <span v-if="selected" class="option-check">
                      <CheckIcon class="icon-sm" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>
      </div>

      <div class="field">
        <label class="label">取得日</label>
        <input v-model="formData.getGradeAt" type="date" class="input" />
      </div>

      <div class="field">
        <label class="label">入部年</label>
        <input v-model="formData.joinedAt" type="number" min="2020" max="9999" class="input" />
      </div>

      <div class="field">
        <label class="label">学年</label>
        <Listbox v-model="formData.year">
          <div class="listbox-container">
            <ListboxButton class="listbox-btn">
              <span class="listbox-value">{{ translateYear(formData.year) }}</span>
              <span class="listbox-icon">
                <ChevronsUpDownIcon class="icon-sm" aria-hidden="true" />
              </span>
            </ListboxButton>
            <transition leave-active-class="leave-active" leave-from-class="leave-from" leave-to-class="leave-to">
              <ListboxOptions class="listbox-options">
                <ListboxOption
                  v-for="yearOption in yearOptions"
                  :key="yearOption.year"
                  v-slot="{ active, selected }"
                  :value="yearOption.year">
                  <li :class="['listbox-option', { 'option-active': active }]">
                    <span :class="['option-text', { 'option-selected': selected }]">
                      {{ yearOption.name }}
                    </span>
                    <span v-if="selected" class="option-check">
                      <CheckIcon class="icon-sm" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>
      </div>

      <p v-if="message" :class="['message', isError ? 'message-error' : 'message-success']">
        {{ message }}
      </p>

      <div class="actions">
        <button type="submit" :disabled="isSubmitting" class="btn-primary">
          {{ isSubmitting ? "保存中..." : "保存" }}
        </button>
        <button type="button" class="btn-secondary" @click="cancelEdit">キャンセル</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue"
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query"
import { queryKeys } from "@/src/lib/queryKeys"
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue"
import { ChevronsUpDownIcon, CheckIcon } from "lucide-vue-next"
import hc from "@/src/lib/honoClient"
import { AccountMetadata } from "@/share/types/account"
import { ArkErrors } from "arktype"
import { translateGrade, grade } from "@/share/lib/grade"
import { translateYear, year } from "@/share/lib/year"

interface FormData {
  grade: number
  getGradeAt: string
  joinedAt: number
  year: `b${number}` | `m${number}` | `d${number}`
}

const queryClient = useQueryClient()

const isEditing = ref(false)
const message = ref("")
const isError = ref(false)
const gradeOptions = grade
const yearOptions = year

const formData = reactive<FormData>({
  grade: 0,
  getGradeAt: "",
  joinedAt: new Date().getFullYear(),
  year: "b1",
})

// Query
const { data: profileData } = useQuery({
  queryKey: queryKeys.user.clerk.profile(),
  queryFn: async () => {
    const res = await hc.user.clerk.profile.$get()
    if (!res.ok) throw new Error("Failed to fetch profile")
    const data = await res.json()
    if (data.profile) {
      const profileParsed = AccountMetadata(data.profile)
      if (profileParsed instanceof ArkErrors) {
        console.error(profileParsed)
        throw new Error("Invalid profile data")
      }
      return profileParsed
    }
    return null
  },
})

const profile = computed(() => profileData.value ?? null)

// Sync form data
watch(profile, (newProfile) => {
  if (newProfile) {
    formData.grade = Number(newProfile.grade) || 0
    formData.getGradeAt = newProfile.getGradeAt || ""
    formData.joinedAt = Number(newProfile.joinedAt) || new Date().getFullYear()
    formData.year = newProfile.year || "b1"
  }
}, { immediate: true })

function updateFormData() {
  if (profile.value) {
    formData.grade = Number(profile.value.grade) || 0
    formData.getGradeAt = profile.value.getGradeAt || ""
    formData.joinedAt = Number(profile.value.joinedAt) || new Date().getFullYear()
    formData.year = profile.value.year || "b1"
  }
}

// Mutation
const { mutateAsync: updateProfile, isPending: isSubmitting } = useMutation({
  mutationFn: async (json: any) => {
    const res = await hc.user.clerk.profile.$patch({ json })
    if (!res.ok) throw new Error("プロフィールの更新に失敗しました")
    return res.json()
  },
  onSuccess: (responseData) => {
    if (responseData.profile) {
      const validatedProfile = AccountMetadata({
         role: responseData.profile.role,
         grade: responseData.profile.grade,
         getGradeAt: responseData.profile.getGradeAt,
         joinedAt: responseData.profile.joinedAt,
         year: responseData.profile.year,
      })
      if (validatedProfile instanceof ArkErrors) {
         console.error(validatedProfile)
      }
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.user.clerk.profile() })
    message.value = "プロフィールを更新しました"
    isEditing.value = false
  },
  onError: (error) => {
    isError.value = true
    message.value = error instanceof Error ? error.message : "プロフィールの更新に失敗しました"
  }
})

async function handleSubmit() {
  message.value = ""
  isError.value = false
  try {
    const getGradeAtValue = (formData.getGradeAt || null) as
      | `${number}-${number}-${number}`
      | null

    const updateData = {
      grade: formData.grade,
      getGradeAt: getGradeAtValue,
      joinedAt: formData.joinedAt,
      year: formData.year as `b${number}` | `m${number}` | `d${number}`,
    }

    await updateProfile(updateData)
  } catch {
    // handled in onError
  }
}

function cancelEdit() {
  updateFormData()
  isEditing.value = false
  message.value = ""
}
</script>

<style scoped>
.container {
  padding: var(--space-2) 0;
}

.skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
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
}

.title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.skeleton-btn {
  height: 2rem;
  width: 3rem;
  border-radius: var(--radius-md);
  background: var(--bg-muted-active);
}

.skeleton-text {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: transparent;
  background: var(--bg-muted-active);
  border-radius: var(--radius-md);
}

.display-mode,
.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-1) 0;
}

.info-label {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.info-value {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.btn-edit {
  flex-shrink: 0;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  padding: var(--space-1-5) var(--space-3);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.btn-edit:hover {
  background: var(--bg-muted);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1-5);
}

.label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.input {
  width: -webkit-fill-available;
  height: -webkit-fit-content;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-card);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
  color: var(--text-primary);
  transition: box-shadow var(--transition-normal);
}

.input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.listbox-container {
  position: relative;
  margin-top: var(--space-1);
}

.listbox-btn {
  position: relative;
  width: 100%;
  cursor: default;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: var(--space-2) var(--space-3);
  padding-right: 2.5rem;
  text-align: left;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.listbox-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.listbox-value {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.listbox-icon {
  pointer-events: none;
  position: absolute;
  inset: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding-right: var(--space-2);
  justify-content: flex-end;
}

.icon-sm {
  width: 1rem;
  height: 1rem;
  color: var(--border-strong);
}

.listbox-options {
  position: absolute;
  z-index: 10;
  margin-top: var(--space-1);
  max-height: 15rem;
  width: 100%;
  overflow: auto;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  padding: var(--space-1) 0;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
}

.listbox-option {
  position: relative;
  cursor: default;
  user-select: none;
  padding: var(--space-2) var(--space-4);
  padding-left: 2.5rem;
  color: var(--text-primary);
}

.option-active {
  background: var(--bg-muted);
  color: var(--text-primary);
}

.option-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-selected {
  font-weight: var(--font-medium);
}

.option-check {
  position: absolute;
  inset: 0;
  left: 0;
  display: flex;
  align-items: center;
  padding-left: var(--space-3);
  color: var(--primary);
}

.leave-active {
  transition: opacity 100ms ease-in;
}

.leave-from {
  opacity: 1;
}

.leave-to {
  opacity: 0;
}

.message {
  font-size: var(--text-xs);
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

.btn-primary {
  flex: 1;
  border-radius: var(--radius-md);
  background: var(--primary);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: white;
  border: none;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary), 0 0 0 4px var(--bg-card);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  flex: 1;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.btn-secondary:hover {
  background: var(--bg-muted);
}
</style>
