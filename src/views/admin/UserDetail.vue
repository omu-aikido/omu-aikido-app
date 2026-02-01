<template>
  <div class="flex flex-col gap-6 px-3 py-4 md:px-6">
    <AdminMenu />
    <div class="flex items-center gap-2 text-sub">
      <router-link to="/admin/accounts" class="hover:underline hover:text-blue-500"> アカウント一覧 </router-link>
      <span class="text-fg-dim">/</span>
      <span class="font-medium text-fg">ユーザー詳細</span>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner" />
      <p class="text-sub">Loading...</p>
    </div>

    <div v-else-if="error" class="p-4 bg-red-500/10 text-red-500 rounded-md border border-red-500/20">
      {{ error }}
    </div>

    <div v-else-if="user" class="flex flex-col gap-6">
      <div class="flex flex-col">
        <div class="stack">
          <div class="flex justify-between items-start gap-4">
            <div class="flex items-center gap-4">
              <img :src="user.imageUrl" alt="" class="avatar-lg" />
              <div class="flex flex-col">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-xl font-bold text-fg">{{ user.lastName }} {{ user.firstName }}</h1>
                  <div v-if="!isEditing" class="flex items-center gap-1.5">
                    <span class="badge-gray">
                      {{ roleLabels[user.profile?.role as string] || '部員' }}
                    </span>
                    <span class="badge-gray">
                      {{ gradeLabels[user.profile?.grade as number] || '無級' }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center flex-wrap gap-2 text-sub mt-1">
                  <span>{{ user.emailAddress }}</span>
                  <template v-if="!isEditing">
                    <span class="w-1 h-1 rounded-full bg-gray-400" />
                    <span>{{ yearLabels[user.profile?.year as string] || user.profile?.year }}</span>
                    <span class="w-1 h-1 rounded-full bg-gray-400" />
                    <span>{{ user.profile?.joinedAt }}年度入部</span>
                  </template>
                </div>
              </div>
            </div>

            <button
              v-if="!isEditing"
              class="p-2 rounded-full bg-transparent text-fg-dim border-none cursor-pointer transition-all hover:bg-gray-200 hover:text-blue-500"
              title="編集"
              @click="startEditing">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </button>
          </div>

          <form
            v-if="isEditing"
            class="flex flex-col gap-4 bg-bg-dim p-4 rounded-lg"
            @submit.prevent="handleUpdateProfile">
            <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div class="flex flex-col gap-1">
                <label class="form-label">役職</label>
                <select v-model="formData.role" class="input-base h-fit">
                  <option v-for="(label, key) in roleLabels" :key="key" :value="key">
                    {{ label }}
                  </option>
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label class="form-label">級段位</label>
                <select v-model.number="formData.grade" class="input-base h-fit">
                  <option v-for="(label, key) in gradeLabels" :key="key" :value="key">
                    {{ label }}
                  </option>
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label class="form-label">学年</label>
                <select v-model="formData.year" class="input-base h-fit">
                  <option v-for="(label, key) in yearLabels" :key="key" :value="key">
                    {{ label }}
                  </option>
                </select>
              </div>
              <Input
                v-model.number="formData.joinedAt"
                type="number"
                label="入部年度"
                :min="1950"
                :max="new Date().getFullYear() + 1" />
              <Input v-model="formData.getGradeAt" type="date" label="級段位取得日" />
            </div>

            <div class="flex justify-end gap-2">
              <button type="button" class="btn-secondary" @click="cancelEditing">キャンセル</button>
              <button type="submit" class="btn-primary" :disabled="updating">
                {{ updating ? '更新中...' : '更新' }}
              </button>
            </div>
          </form>
          <div v-if="updateError" class="alert-error">{{ updateError }}</div>
          <div v-if="updateSuccess" class="alert-success">{{ updateSuccess }}</div>
        </div>
      </div>

      <div v-if="stats" class="grid grid-cols-2 border border-border-dim rounded-lg overflow-hidden">
        <div class="flex flex-col border-r border-border-dim">
          <div class="p-4 text-center border-b border-border-dim">
            <p class="text-2xl font-bold text-fg">
              {{ stats.trainCount }}
            </p>
            <span class="text-sub">総稽古回数</span>
          </div>
          <div class="p-4 text-center">
            <p class="text-2xl font-bold text-fg">
              {{ stats.doneTrain }}
            </p>
            <span class="text-sub">現在の級での稽古</span>
          </div>
        </div>
        <div class="flex flex-col">
          <div class="p-4 text-center border-b border-border-dim">
            <p class="text-2xl font-bold text-fg">
              {{ stats.totalDays }}
            </p>
            <span class="text-sub">稽古日数</span>
          </div>
          <div class="p-4 text-center">
            <p class="text-2xl font-bold text-fg">
              {{ stats.totalHours }}
            </p>
            <span class="text-sub">総時間</span>
          </div>
        </div>
      </div>

      <div class="stack">
        <h3 class="text-base font-medium text-fg">アクティビティ履歴</h3>

        <div v-if="activities.length > 0">
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-sm text-left">
              <thead class="border-b border-border-dim">
                <tr>
                  <th class="px-6 py-3 whitespace-nowrap font-medium text-fg-dim">日時</th>
                  <th class="px-6 py-3 whitespace-nowrap font-medium text-fg-dim">時間 (h)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="activity in activities" :key="activity.id" class="border-b border-border-dim">
                  <td class="px-6 py-3 whitespace-nowrap">{{ new Date(activity.date).toLocaleDateString() }}</td>
                  <td class="px-6 py-3 whitespace-nowrap">{{ activity.period }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-between items-center py-4 border-t border-border-dim">
            <button
              :disabled="page <= 1"
              class="px-3 py-1 text-sm border border-border-dim bg-transparent rounded-md text-fg cursor-pointer transition-colors hover:bg-bg-dim disabled:opacity-50 disabled:cursor-not-allowed"
              @click="page > 1 && changePage(page - 1)">
              前へ
            </button>
            <span class="text-sub">{{ page }} ページ目</span>
            <button
              :disabled="activities.length < limit"
              class="px-3 py-1 text-sm border border-border-dim bg-transparent rounded-md text-fg cursor-pointer transition-colors hover:bg-bg-dim disabled:opacity-50 disabled:cursor-not-allowed"
              @click="changePage(page + 1)">
              次へ
            </button>
          </div>
        </div>

        <div v-else class="text-center p-8 text-sub">履歴はありません</div>
      </div>

      <div class="mt-8 border border-red-500/30 rounded-lg overflow-hidden">
        <div class="px-4 py-3 bg-red-500/10 border-b border-red-500/20">
          <h3 class="text-sm font-medium text-red-500">危険な操作</h3>
        </div>
        <div class="p-4 flex flex-col gap-4">
          <div class="flex justify-between items-center">
            <p class="text-sm font-medium text-fg">ユーザーを削除</p>
            <button
              v-if="!showDeleteConfirm"
              class="px-4 py-1.5 text-sm font-medium text-red-500 border border-red-500 bg-transparent rounded-md cursor-pointer transition-all hover:bg-red-500/10"
              @click="showDeleteConfirm = true">
              削除
            </button>
          </div>
          <p class="text-sub">
            このユーザーとそのすべてのデータを完全に削除します。<strong>この操作は取り消せません。</strong>
          </p>

          <div v-if="showDeleteConfirm && !showFinalConfirm" class="p-4 bg-red-500/5 rounded-md flex flex-col gap-3">
            <p class="text-sm text-red-500">
              削除操作を続行するには、以下に
              <strong>{{ user?.lastName }}{{ user?.firstName }}</strong>
              と入力してください：
            </p>
            <input
              v-model="deleteConfirmName"
              type="text"
              placeholder="ユーザー名を入力"
              class="w-full px-3 py-2 border border-red-500/30 rounded-md text-base bg-bg text-fg focus:outline-none focus:ring-2 focus:ring-red-500" />
            <div class="flex gap-2">
              <button
                class="btn bg-transparent text-fg-dim hover:bg-bg-muted hover:text-fg"
                @click="
                  showDeleteConfirm = false;
                  deleteConfirmName = '';
                ">
                キャンセル
              </button>
              <button
                class="btn-danger"
                :disabled="deleteConfirmName !== (user?.lastName ?? '') + (user?.firstName ?? '')"
                @click="showFinalConfirm = true">
                次へ
              </button>
            </div>
          </div>

          <div
            v-if="showFinalConfirm"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[4px]">
            <div class="w-full max-w-md bg-bg rounded-lg shadow-xl p-6 flex flex-col gap-4 m-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-fg">本当に削除しますか？</h3>
              </div>
              <p class="text-sub">
                <strong>{{ user?.lastName }} {{ user?.firstName }}</strong>
                さんのアカウントとすべての活動記録が削除されます。この操作は元に戻せません。
              </p>
              <div class="flex justify-end gap-3">
                <button
                  class="btn-secondary"
                  @click="
                    showFinalConfirm = false;
                    showDeleteConfirm = false;
                    deleteConfirmName = '';
                  ">
                  キャンセル
                </button>
                <button class="btn-danger" :disabled="deleting" @click="handleDeleteUser">
                  {{ deleting ? '削除中...' : '削除する' }}
                </button>
              </div>
              <p v-if="deleteError" class="text-sm text-red-500">
                {{ deleteError }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminMenu from '@/src/components/admin/AdminMenu.vue';
import Input from '@/src/components/ui/UiInput.vue';
import hc from '@/src/lib/honoClient';
import { queryKeys } from '@/src/lib/queryKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const userId = (Array.isArray(route.params.userId) ? route.params.userId[0] : route.params.userId) as string;

// Labels configuration
const roleLabels: Record<string, string> = {
  admin: '管理者',
  captain: '主将',
  'vice-captain': '副主将',
  treasurer: '会計',
  member: '部員',
};
const gradeLabels: Record<number, string> = {
  0: '無級',
  5: '五級',
  4: '四級',
  3: '三級',
  2: '二級',
  1: '一級',
  [-1]: '初段',
  [-2]: '二段',
  [-3]: '三段',
  [-4]: '四段',
};
const yearLabels: Record<string, string> = {
  b1: '1回生',
  b2: '2回生',
  b3: '3回生',
  b4: '4回生',
  m1: '修士1年',
  m2: '修士2年',
  d1: '博士1年',
  d2: '博士2年',
};

// Reactivity via standard refs
const page = ref(1);
const limit = 10;
const queryClient = useQueryClient();

// Query
const {
  data: apiData,
  isLoading: loading,
  error: queryError,
} = useQuery({
  queryKey: computed(() => queryKeys.admin.users(userId, { page: page.value, limit })),
  queryFn: async () => {
    if (!userId) throw new Error('Invalid User ID');
    const res = await hc.admin.users[':userId'].$get({
      param: { userId },
      query: { page: page.value, limit },
    });
    if (!res.ok) throw new Error('Failed to fetch user data');
    return res.json();
  },
  placeholderData: (previousData) => previousData,
});

const user = computed(() => apiData.value?.user ?? null);

interface Activity {
  id: string;
  date: string;
  period: number;
}

const activities = computed(() => (apiData.value?.activities as Activity[]) ?? []);
const stats = computed(() => {
  if (!apiData.value) return null;
  return {
    trainCount: apiData.value.trainCount,
    doneTrain: apiData.value.doneTrain,
    totalDays: apiData.value.totalDays,
    totalHours: apiData.value.totalHours,
    totalActivitiesCount: apiData.value.totalActivitiesCount,
  };
});

const error = computed(() => (queryError.value ? 'ユーザー情報の読み込みに失敗しました' : ''));

// Edit form state
const formData = ref({
  role: 'member',
  grade: 0,
  year: 'b1',
  joinedAt: new Date().getFullYear(),
  getGradeAt: '',
});
const updateSuccess = ref('');
const updateError = ref('');
const isEditing = ref(false);

// Delete state
const showDeleteConfirm = ref(false);
const showFinalConfirm = ref(false);
const deleteConfirmName = ref('');
const deleteError = ref('');

// Initialize form data when data arrives or changes
watch(
  user,
  (newUser) => {
    if (newUser && newUser.profile) {
      formData.value = {
        role: (newUser.profile.role as string) || 'member',
        grade: Number(newUser.profile.grade || 0),
        year: (newUser.profile.year as string) || 'b1',
        joinedAt: Number(newUser.profile.joinedAt || new Date().getFullYear()),
        getGradeAt: newUser.profile.getGradeAt ? new Date(newUser.profile.getGradeAt).toISOString().split('T')[0]! : '',
      };
    } else {
      formData.value = {
        role: 'member',
        grade: 0,
        year: 'b1',
        joinedAt: new Date().getFullYear(),
        getGradeAt: '',
      };
    }
  },
  { immediate: true }
);

const startEditing = () => {
  isEditing.value = true;
  updateSuccess.value = '';
  updateError.value = '';
};

const cancelEditing = () => {
  isEditing.value = false;
  updateSuccess.value = '';
  updateError.value = '';
};

const changePage = (newPage: number) => {
  page.value = newPage;
};

// Mutations
const { mutateAsync: updateProfile, isPending: updating } = useMutation({
  mutationFn: async (payload: {
    role: string;
    grade: number;
    year: string;
    joinedAt: number;
    getGradeAt: string | null;
  }) => {
    const res = await hc.admin.users[':userId'].profile.$patch({
      param: { userId },
      json: payload,
    });
    if (!res.ok) {
      const errData = (await res.json()) as { error?: string };
      throw new Error(errData.error || '更新に失敗しました');
    }
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['admin', 'users'],
    });
    queryClient.invalidateQueries({
      queryKey: ['admin', 'accounts'],
    });
    updateSuccess.value = 'プロファイルを更新しました';
    isEditing.value = false;
  },
  onError: (e) => {
    updateError.value = e instanceof Error ? e.message : '更新中にエラーが発生しました';
  },
});

const handleUpdateProfile = async () => {
  updateError.value = '';
  updateSuccess.value = '';

  if (!userId) {
    updateError.value = 'ユーザーIDが無効です';
    return;
  }

  const payload = {
    role: formData.value.role,
    grade: formData.value.grade,
    year: formData.value.year,
    joinedAt: formData.value.joinedAt,
    getGradeAt: formData.value.getGradeAt ? formData.value.getGradeAt : null,
  };

  try {
    await updateProfile(payload);
  } catch {
    // Error handled in onError
  }
};

const { mutateAsync: deleteUserMutation, isPending: deleting } = useMutation({
  mutationFn: async () => {
    const res = await hc.admin.users[':userId'].$delete({ param: { userId } });
    if (!res.ok) {
      const errData = (await res.json()) as { error?: string };
      throw new Error(errData.error || '削除に失敗しました');
    }
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    router.push('/admin/accounts');
  },
  onError: (e) => {
    deleteError.value = e instanceof Error ? e.message : '削除中にエラーが発生しました';
  },
});

const handleDeleteUser = async () => {
  deleteError.value = '';
  try {
    await deleteUserMutation();
  } catch {
    // Error handled in onError
  }
};
</script>
