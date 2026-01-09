<template>
  <div class="py-2">
    <div v-if="!profile" class="space-y-4 animate-pulse">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">プロフィール</h3>
        <div class="h-8 w-12 rounded-md bg-neutral-200 dark:bg-neutral-700"></div>
      </div>

      <div class="space-y-3">
        <div class="flex justify-between items-center py-1">
          <span class="text-sm text-neutral-500 dark:text-neutral-400">級段位</span>
          <span class="text-sm font-medium text-transparent bg-neutral-200 dark:bg-neutral-700 rounded"> 五段 </span>
        </div>
        <div class="flex justify-between items-center py-1">
          <span class="text-sm text-neutral-500 dark:text-neutral-400">取得日</span>
          <span class="text-sm font-medium text-transparent bg-neutral-200 dark:bg-neutral-700 rounded">
            2024/01/01
          </span>
        </div>
        <div class="flex justify-between items-center py-1">
          <span class="text-sm text-neutral-500 dark:text-neutral-400">入部年</span>
          <span class="text-sm font-medium text-transparent bg-neutral-200 dark:bg-neutral-700 rounded"> 2024 </span>
        </div>
        <div class="flex justify-between items-center py-1">
          <span class="text-sm text-neutral-500 dark:text-neutral-400">学年</span>
          <span class="text-sm font-medium text-transparent bg-neutral-200 dark:bg-neutral-700 rounded"> 学部4年 </span>
        </div>
      </div>
    </div>

    <!-- Display Mode -->
    <div v-else-if="!isEditing" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">プロフィール</h3>
        <button
          @click="isEditing = true"
          class="shrink-0 rounded-md bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 shadow-sm ring-1 ring-inset ring-neutral-300 dark:ring-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
          編集
        </button>
      </div>

      <div class="space-y-3">
        <div class="flex justify-between items-center py-1">
          <span class="text-sm text-neutral-500 dark:text-neutral-400">級段位</span>
          <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {{ translateGrade(profile?.grade ?? "") || "-" }}
          </span>
        </div>
        <div class="flex justify-between items-center py-1">
          <span class="text-sm text-neutral-500 dark:text-neutral-400">取得日</span>
          <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {{
              profile?.getGradeAt
                ? new Date(profile.getGradeAt).toLocaleDateString()
                : "-"
            }}
          </span>
        </div>
        <div class="flex justify-between items-center py-1">
          <span class="text-sm text-neutral-500 dark:text-neutral-400">入部年</span>
          <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {{ profile?.joinedAt || "-" }}
          </span>
        </div>
        <div class="flex justify-between items-center py-1">
          <span class="text-sm text-neutral-500 dark:text-neutral-400">学年</span>
          <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {{ translateYear(profile?.year ?? "") || "-" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Edit Mode -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"> 級段位 </label>
        <Listbox v-model="formData.grade">
          <div class="relative mt-1">
            <ListboxButton
              class="relative w-full cursor-default rounded-md bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 py-2 pl-3 pr-10 text-left text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm">
              <span class="block truncate">{{
                translateGrade(formData.grade)
              }}</span>
              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronsUpDownIcon class="h-4 w-4 text-neutral-400" aria-hidden="true" />
              </span>
            </ListboxButton>

            <transition
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0">
              <ListboxOptions
                class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-neutral-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                <ListboxOption
                  v-for="gradeOption in gradeOptions"
                  :key="gradeOption.grade"
                  :value="gradeOption.grade"
                  v-slot="{ active, selected }">
                  <li
                    :class="[
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100'
                        : 'text-neutral-900 dark:text-neutral-100',
                      'relative cursor-default select-none py-2 pl-10 pr-4',
                    ]">
                    <span
                      :class="[
                        selected ? 'font-medium' : 'font-normal',
                        'block truncate',
                      ]">
                      {{ gradeOption.name }}
                    </span>
                    <span
                      v-if="selected"
                      class="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                      <CheckIcon class="h-4 w-4" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>
      </div>

      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"> 取得日 </label>
        <input
          v-model="formData.getGradeAt"
          type="date"
          class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" />
      </div>

      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"> 入部年 </label>
        <input
          v-model="formData.joinedAt"
          type="number"
          min="2020"
          max="9999"
          class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" />
      </div>

      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"> 学年 </label>
        <Listbox v-model="formData.year">
          <div class="relative mt-1">
            <ListboxButton
              class="relative w-full cursor-default rounded-md bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 py-2 pl-3 pr-10 text-left text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm">
              <span class="block truncate">{{
                translateYear(formData.year)
              }}</span>
              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronsUpDownIcon class="h-4 w-4 text-neutral-400" aria-hidden="true" />
              </span>
            </ListboxButton>

            <transition
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0">
              <ListboxOptions
                class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-neutral-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                <ListboxOption
                  v-for="yearOption in yearOptions"
                  :key="yearOption.year"
                  :value="yearOption.year"
                  v-slot="{ active, selected }">
                  <li
                    :class="[
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100'
                        : 'text-neutral-900 dark:text-neutral-100',
                      'relative cursor-default select-none py-2 pl-10 pr-4',
                    ]">
                    <span
                      :class="[
                        selected ? 'font-medium' : 'font-normal',
                        'block truncate',
                      ]">
                      {{ yearOption.name }}
                    </span>
                    <span
                      v-if="selected"
                      class="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                      <CheckIcon class="h-4 w-4" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>
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

const messageClass = computed(() =>
  isError.value
    ? "text-red-600 dark:text-red-400"
    : "text-green-600 dark:text-green-400"
)

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
    formData.joinedAt =
      Number(profile.value.joinedAt) || new Date().getFullYear()
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
         // Not throwing here to avoid breaking UI, but logging
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
