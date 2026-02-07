<template>
  <div class="stack">
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-2">
        <label for="year" class="text-base font-medium text-subtext">学年</label>
        <select
          id="year"
          :value="formValues.year"
          :disabled="isSignUpCreated"
          class="w-full h-fit rounded-md border border-overlay1 bg-base px-3 py-2 text-base text transition-shadow duration-200 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          @change="onUpdate('year', ($event.target as HTMLSelectElement).value)">
          <option v-for="y in yearOptions" :key="y.year" :value="y.year">
            {{ y.name }}
          </option>
        </select>
        <p v-if="formErrors.year" class="text-sm text-red-500">
          {{ formErrors.year }}
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <label for="grade" class="text-base font-medium text-subtext">級段位</label>
        <select
          id="grade"
          :value="formValues.grade"
          :disabled="isSignUpCreated"
          class="w-full h-fit rounded-md border border-overlay1 bg-base px-3 py-2 text-base text transition-shadow duration-200 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          @change="onUpdate('grade', Number(($event.target as HTMLSelectElement).value))">
          <option v-for="g in gradeOptions" :key="g.grade" :value="g.grade">
            {{ g.name }}
          </option>
        </select>
        <p v-if="formErrors.grade" class="text-sm text-red-500">
          {{ formErrors.grade }}
        </p>
      </div>
    </div>

    <Input
      id="joinedAt"
      :model-value="formValues.joinedAt"
      type="number"
      label="入部年度"
      :disabled="isSignUpCreated"
      :error="formErrors.joinedAt"
      @update:model-value="onUpdate('joinedAt', Number($event))" />

    <Input
      id="getGradeAt"
      :model-value="formValues.getGradeAt"
      type="date"
      label="取得年月日 (任意)"
      :disabled="isSignUpCreated"
      :error="formErrors.getGradeAt"
      @update:model-value="onUpdate('getGradeAt', $event)" />

    <div class="flex items-center gap-2">
      <input
        id="legalAccepted"
        type="checkbox"
        :checked="formValues.legalAccepted"
        :disabled="isSignUpCreated"
        class="w-4 h-4 rounded-sm border border-overlay1 accent-blue-500"
        @change="onUpdate('legalAccepted', ($event.target as HTMLInputElement).checked)" />
      <label for="legalAccepted" class="text-sub"> 利用規約とプライバシーポリシーに同意します。 </label>
    </div>
    <p v-if="formErrors.legalAccepted" class="text-sm text-red-500">
      {{ formErrors.legalAccepted }}
    </p>

    <div class="flex justify-between pt-2">
      <button type="button" class="btn-secondary" :disabled="isSignUpCreated" @click="prevStep">戻る</button>
      <button type="submit" class="btn-primary" :disabled="!canSubmit">
        {{ isSignUpCreated ? '登録中...' : '登録' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { grade as gradeOptions } from '@/share/lib/grade';
import { year as yearOptions } from '@/share/lib/year';
import Input from '@/src/components/ui/UiInput.vue';
import type { FormErrors, SignUpFormData } from '@/src/composable/useSignUpForm';

defineProps<{
  formValues: Partial<SignUpFormData>;
  formErrors: Partial<FormErrors>;
  isSignUpCreated: boolean;
  canSubmit: boolean;
  prevStep: () => void;
}>();

const emit = defineEmits<{
  (e: 'update:formValue', key: keyof SignUpFormData, value: string | number | boolean): void;
}>();

const onUpdate = (key: keyof SignUpFormData, value: string | number | boolean) => {
  emit('update:formValue', key, value);
};
</script>
