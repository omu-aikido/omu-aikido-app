<template>
  <div class="page-container">
    <AdminMenu />
    <div class="breadcrumb">
      <router-link to="/admin/accounts" class="breadcrumb-link"> アカウント一覧 </router-link>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">ユーザー詳細</span>
    </div>

    <div v-if="loading" class="loading-container">
      <Loading />
    </div>

    <div v-else-if="error" class="error-banner">
      {{ error }}
    </div>

    <div v-else-if="user" class="content">
      <div class="profile-section">
        <div class="profile-header">
          <div class="profile-info">
            <div class="flex-row">
              <img :src="user.imageUrl" alt="" class="avatar" />
              <div class="info-text">
                <div class="name-row">
                  <h1 class="name">{{ user.lastName }} {{ user.firstName }}</h1>
                  <div v-if="!isEditing" class="badges">
                    <span class="badge">
                      {{ roleLabels[user.profile?.role as string] || '部員' }}
                    </span>
                    <span class="badge">
                      {{ gradeLabels[user.profile?.grade as number] || '無級' }}
                    </span>
                  </div>
                </div>
                <div class="meta-row">
                  <span>{{ user.emailAddress }}</span>
                  <template v-if="!isEditing">
                    <span class="dot" />
                    <span>{{ yearLabels[user.profile?.year as string] || user.profile?.year }}</span>
                    <span class="dot" />
                    <span>{{ user.profile?.joinedAt }}年度入部</span>
                  </template>
                </div>
              </div>
            </div>

            <button v-if="!isEditing" class="edit-btn" title="編集" @click="startEditing">
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

          <form v-if="isEditing" class="edit-form" @submit.prevent="handleUpdateProfile">
            <div class="form-grid">
              <div class="form-group">
                <label class="label">役職</label>
                <select v-model="formData.role" class="select">
                  <option v-for="(label, key) in roleLabels" :key="key" :value="key">
                    {{ label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="label">級段位</label>
                <select v-model.number="formData.grade" class="select">
                  <option v-for="(label, key) in gradeLabels" :key="key" :value="key">
                    {{ label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="label">学年</label>
                <select v-model="formData.year" class="select">
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

            <div class="form-actions">
              <Button type="button" variant="secondary" @click="cancelEditing">キャンセル</Button>
              <Button type="submit" :disabled="updating" variant="primary">
                {{ updating ? '更新中...' : '更新' }}
              </Button>
            </div>
          </form>
          <MessageDisplay :error-message="updateError" :success-message="updateSuccess" />
        </div>
      </div>

      <div v-if="stats" class="stats-grid">
        <div class="stat-card stat-left">
          <div class="stat-item border-bottom">
            <p class="stat-value">
              {{ stats.trainCount }}
            </p>
            <span class="stat-label">総稽古回数</span>
          </div>
          <div class="stat-item">
            <p class="stat-value">
              {{ stats.doneTrain }}
            </p>
            <span class="stat-label">現在の級での稽古</span>
          </div>
        </div>
        <div class="stat-card stat-right">
          <div class="stat-item border-bottom">
            <p class="stat-value">
              {{ stats.totalDays }}
            </p>
            <span class="stat-label">稽古日数</span>
          </div>
          <div class="stat-item">
            <p class="stat-value">
              {{ stats.totalHours }}
            </p>
            <span class="stat-label">総時間</span>
          </div>
        </div>
      </div>

      <div class="history-section">
        <h3 class="history-title">アクティビティ履歴</h3>

        <div v-if="activities.length > 0">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>日時</th>
                  <th>時間 (h)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="activity in activities" :key="activity.id">
                  <td>{{ new Date(activity.date).toLocaleDateString() }}</td>
                  <td>{{ activity.period }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination">
            <button :disabled="page <= 1" class="page-btn" @click="page > 1 && changePage(page - 1)">前へ</button>
            <span class="page-info">{{ page }} ページ目</span>
            <button :disabled="activities.length < limit" class="page-btn" @click="changePage(page + 1)">次へ</button>
          </div>
        </div>

        <div v-else class="empty-history">履歴はありません</div>
      </div>

      <div class="danger-zone">
        <div class="danger-header">
          <h3 class="danger-title">危険な操作</h3>
        </div>
        <div class="danger-content">
          <div class="danger-row">
            <p class="danger-text">ユーザーを削除</p>
            <button v-if="!showDeleteConfirm" class="btn-danger-outline" @click="showDeleteConfirm = true">削除</button>
          </div>
          <p class="danger-description">
            このユーザーとそのすべてのデータを完全に削除します。<strong>この操作は取り消せません。</strong>
          </p>

          <div v-if="showDeleteConfirm && !showFinalConfirm" class="confirm-box">
            <p class="confirm-msg">
              削除操作を続行するには、以下に
              <strong>{{ user?.lastName }}{{ user?.firstName }}</strong>
              と入力してください：
            </p>
            <input v-model="deleteConfirmName" type="text" placeholder="ユーザー名を入力" class="confirm-input" />
            <div class="confirm-actions">
              <Button
                variant="ghost"
                @click="
                  showDeleteConfirm = false;
                  deleteConfirmName = '';
                "
                >キャンセル</Button
              >
              <Button
                :disabled="deleteConfirmName !== (user?.lastName ?? '') + (user?.firstName ?? '')"
                variant="danger"
                @click="showFinalConfirm = true">
                次へ
              </Button>
            </div>
          </div>

          <div v-if="showFinalConfirm" class="modal-backdrop">
            <div class="modal">
              <div class="modal-header">
                <div class="modal-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon"
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
                <h3 class="modal-title">本当に削除しますか？</h3>
              </div>
              <p class="modal-text">
                <strong>{{ user?.lastName }} {{ user?.firstName }}</strong>
                さんのアカウントとすべての活動記録が削除されます。この操作は元に戻せません。
              </p>
              <div class="modal-actions">
                <Button
                  variant="secondary"
                  @click="
                    showFinalConfirm = false;
                    showDeleteConfirm = false;
                    deleteConfirmName = '';
                  ">
                  キャンセル
                </Button>
                <Button :disabled="deleting" variant="danger" @click="handleDeleteUser">
                  {{ deleting ? '削除中...' : '削除する' }}
                </Button>
              </div>
              <p v-if="deleteError" class="error-text">
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
import MessageDisplay from '@/src/components/common/MessageDisplay.vue';
import Button from '@/src/components/ui/UiButton.vue';
import Input from '@/src/components/ui/UiInput.vue';
import Loading from '@/src/components/ui/UiLoading.vue';
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

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-4) var(--space-3);
}

@media (width >= 768px) {
  .page-container {
    padding-inline: var(--space-6);
  }
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.breadcrumb-link:hover {
  text-decoration: underline;
  color: var(--primary);
}

.breadcrumb-current {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: var(--space-12) 0;
}

.error-banner {
  padding: var(--space-4);
  background: rgb(239 68 68 / 10%);
  color: var(--red-500);
  border-radius: var(--radius-md);
  border: 1px solid rgb(239 68 68 / 20%);
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.profile-section {
  display: flex;
  flex-direction: column;
}

.profile-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.profile-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.flex-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-full);
  background: var(--bg-muted-active);
  object-fit: cover;
}

.info-text {
  display: flex;
  flex-direction: column;
}

.name-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.name {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.badges {
  display: flex;
  align-items: center;
  gap: var(--space-1-5);
}

.badge {
  padding: 0.125rem 0.5rem;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-sm);
  background: var(--bg-muted-active);
  color: var(--text-secondary);
}

.meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.dot {
  width: 0.25rem;
  height: 0.25rem;
  border-radius: var(--radius-full);
  background: var(--border-strong);
}

.edit-btn {
  padding: var(--space-2);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.edit-btn:hover {
  background: var(--bg-muted-active);
  color: var(--primary);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  background: var(--bg-muted);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}

.form-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

@media (width >= 768px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.select {
  width: -webkit-fill-available;
  height: fit-content;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: box-shadow var(--transition-normal);
}

.select:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.stat-card {
  display: flex;
  flex-direction: column;
}

.stat-left {
  border-right: 1px solid var(--border-dim);
}

.stat-item {
  padding: var(--space-4);
  text-align: center;
}

.border-bottom {
  border-bottom: 1px solid var(--border-dim);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.history-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.history-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
  text-align: left;
}

.data-table thead {
  border-bottom: 1px solid var(--border-dim);
}

.data-table th,
.data-table td {
  padding: var(--space-3) var(--space-6);
  white-space: nowrap;
}

.data-table th {
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.data-table tr {
  border-bottom: 1px solid var(--border-dim);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) 0;
  border-top: 1px solid var(--border-dim);
}

.page-btn {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  border: 1px solid var(--border-dim);
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background: var(--bg-muted);
}

.page-info {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.empty-history {
  text-align: center;
  padding: var(--space-8);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.danger-zone {
  margin-top: var(--space-8);
  border: 1px solid rgb(239 68 68 / 30%);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.danger-header {
  padding: var(--space-3) var(--space-4);
  background: rgb(239 68 68 / 10%);
  border-bottom: 1px solid rgb(239 68 68 / 20%);
}

.danger-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--red-500);
}

.danger-content {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.danger-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.danger-text {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.danger-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.btn-danger-outline {
  padding: var(--space-1-5) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--red-500);
  border: 1px solid var(--red-500);
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-danger-outline:hover {
  background: rgb(239 68 68 / 10%);
}

.confirm-box {
  padding: var(--space-4);
  background: rgb(239 68 68 / 5%); /* very light red */
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.confirm-msg {
  font-size: var(--text-sm);
  color: var(--red-500);
}

.confirm-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid rgb(239 68 68 / 30%);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background: var(--bg-card);
  color: var(--text-primary);
}

.confirm-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--red-500);
}

.confirm-actions {
  display: flex;
  gap: var(--space-2);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(4px);
}

.modal {
  width: 100%;
  max-width: 28rem;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin: var(--space-4);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.modal-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-full);
  background: rgb(239 68 68 / 10%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--red-500);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.modal-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.error-text {
  font-size: var(--text-sm);
  color: var(--red-500);
}
</style>
