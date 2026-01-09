<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <label for="year" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">学年</label>
        <select
          id="year"
          :value="formValues.year"
          @change="onUpdate('year', ($event.target as HTMLSelectElement).value)"
          :disabled="isSignUpCreated"
          class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
          <option v-for="y in yearOptions" :key="y.year" :value="y.year">
            {{ y.name }}
          </option>
        </select>
        <p v-if="formErrors.year" class="text-sm text-red-600 dark:text-red-400">
          {{ formErrors.year }}
        </p>
      </div>
      <div class="space-y-2">
        <label for="grade" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">級段位</label>
        <select
          id="grade"
          :value="formValues.grade"
          @change="
            onUpdate(
              'grade',
              Number(($event.target as HTMLSelectElement).value)
            )
          "
          :disabled="isSignUpCreated"
          class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
          <option v-for="g in gradeOptions" :key="g.grade" :value="g.grade">
            {{ g.name }}
          </option>
        </select>
        <p v-if="formErrors.grade" class="text-sm text-red-600 dark:text-red-400">
          {{ formErrors.grade }}
        </p>
      </div>
    </div>

    <div class="space-y-2">
      <label for="joinedAt" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">入部年度</label>
      <input
        id="joinedAt"
        type="number"
        :value="formValues.joinedAt"
        @input="
          onUpdate(
            'joinedAt',
            Number(($event.target as HTMLInputElement).value)
          )
        "
        :disabled="isSignUpCreated"
        class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" />
      <p v-if="formErrors.joinedAt" class="text-sm text-red-600 dark:text-red-400">
        {{ formErrors.joinedAt }}
      </p>
    </div>

    <div class="space-y-2">
      <label for="getGradeAt" class="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >取得年月日 (任意)</label
      >
      <input
        id="getGradeAt"
        type="date"
        :value="formValues.getGradeAt"
        @input="
          onUpdate('getGradeAt', ($event.target as HTMLInputElement).value)
        "
        :disabled="isSignUpCreated"
        class="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" />
      <p v-if="formErrors.getGradeAt" class="text-sm text-red-600 dark:text-red-400">
        {{ formErrors.getGradeAt }}
      </p>
    </div>

    <div class="flex items-center space-x-2">
      <input
        id="legalAccepted"
        type="checkbox"
        :checked="formValues.legalAccepted"
        @change="
          onUpdate('legalAccepted', ($event.target as HTMLInputElement).checked)
        "
        :disabled="isSignUpCreated"
        class="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-600 dark:border-neutral-700 dark:bg-neutral-900" />
      <label for="legalAccepted" class="text-sm text-neutral-700 dark:text-neutral-300">
        利用規約とプライバシーポリシーに同意します。
      </label>
    </div>
    <p v-if="formErrors.legalAccepted" class="text-sm text-red-600 dark:text-red-400">
      {{ formErrors.legalAccepted }}
    </p>

    <div class="flex justify-between pt-2">
      <button
        type="button"
        @click="prevStep"
        :disabled="isSignUpCreated"
        class="rounded-md border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
        戻る
      </button>
      <button
        type="submit"
        :disabled="!canSubmit"
        class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
        {{ isSignUpCreated ? "登録中..." : "登録" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { year as yearOptions } from "@/share/lib/year"
import { grade as gradeOptions } from "@/share/lib/grade"
import type { SignUpFormData, FormErrors } from "@/src/composable/useSignUpForm"

const props = defineProps<{
  formValues: Partial<SignUpFormData>
  formErrors: Partial<FormErrors>
  isSignUpCreated: boolean
  canSubmit: boolean
  prevStep: () => void
}>()

const emit = defineEmits<{
  (e: "update:formValue", key: keyof SignUpFormData, value: any): void
}>()

const onUpdate = (key: keyof SignUpFormData, value: any) => {
  emit("update:formValue", key, value)
}
</script>
