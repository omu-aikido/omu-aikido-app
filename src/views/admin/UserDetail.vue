<template>
  <div class="space-y-4 md:space-y-6 px-3 md:px-6">
    <AdminMenu />
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-neutral-500">
      <router-link to="/admin/accounts" class="hover:underline hover:text-indigo-600">アカウント一覧</router-link>
      <span>/</span>
      <span class="text-neutral-800 dark:text-neutral-200 font-medium">ユーザー詳細</span>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <Loading />
    </div>

    <div v-else-if="error" class="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else-if="user" class="space-y-6">
      <!-- Profile -->
      <div>
        <div class="flex flex-col md:flex-row gap-6">
          <div class="flex-1 w-full space-y-3">
            <div class="flex flex-row items-start justify-between gap-4">
              <div class="flex flex-row items-center gap-4">
                <img :src="user.imageUrl" alt="" class="w-14 h-14 rounded-full bg-neutral-200" />
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      {{ user.lastName }}
                      {{ user.firstName }}
                    </h1>
                    <div v-if="!isEditing" class="flex items-center gap-1.5">
                      <span
                        class="px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {{ roleLabels[user.profile?.role as string] || "部員" }}
                      </span>
                      <span
                        class="px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {{
                          gradeLabels[user.profile?.grade as number] || "無級"
                        }}
                      </span>
                    </div>
                  </div>
                  <div
                    class="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-x-3 gap-y-1 flex-wrap mt-0.5">
                    <span>{{ user.emailAddress }}</span>
                    <span v-if="!isEditing" class="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
                    <span v-if="!isEditing">{{
                      yearLabels[user.profile?.year as string] ||
                      user.profile?.year
                    }}</span>
                    <span v-if="!isEditing" class="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
                    <span v-if="!isEditing">{{ user.profile?.joinedAt }}年度入部</span>
                  </div>
                </div>
              </div>

              <button
                v-if="!isEditing"
                @click="startEditing"
                class="p-2 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="編集">
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

            <!-- Edit Mode Form -->
            <form v-if="isEditing" @submit.prevent="handleUpdateProfile" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">役職</label>
                <select
                  v-model="formData.role"
                  class="w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option v-for="(label, key) in roleLabels" :key="key" :value="key">
                    {{ label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">級段位</label>
                <select
                  v-model.number="formData.grade"
                  class="w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option v-for="(label, key) in gradeLabels" :key="key" :value="key">
                    {{ label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">学年</label>
                <select
                  v-model="formData.year"
                  class="w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option v-for="(label, key) in yearLabels" :key="key" :value="key">
                    {{ label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">入部年度</label>
                <input
                  type="number"
                  v-model.number="formData.joinedAt"
                  class="w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1950"
                  :max="new Date().getFullYear() + 1" />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >級段位取得日</label
                >
                <input
                  type="date"
                  v-model="formData.getGradeAt"
                  class="w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div class="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  @click="cancelEditing"
                  class="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300 focus:outline-none">
                  キャンセル
                </button>
                <button
                  type="submit"
                  :disabled="updating"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  <span v-if="updating" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  更新
                </button>
              </div>
            </form>
            <MessageDisplay :error-message="updateError" :success-message="updateSuccess" />
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div v-if="stats">
        <div
          class="grid grid-cols-2 md:divide-y-0 divide-neutral-200 dark:divide-neutral-800 [&_div]:border-neutral-200 [&_div]:dark:border-neutral-800">
          <div class="border-y border-x rounded-l-lg">
            <div class="p-4 text-center border-b">
              <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {{ stats.trainCount }}
              </p>
              <span class="text-xs text-neutral-500">総稽古回数</span>
            </div>
            <div class="p-4 text-center">
              <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {{ stats.doneTrain }}
              </p>
              <span class="text-xs text-neutral-500">現在の級での稽古</span>
            </div>
          </div>
          <div class="border-y border-r rounded-r-lg">
            <div class="p-4 text-center border-b">
              <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {{ stats.totalDays }}
              </p>
              <span class="text-xs text-neutral-500">稽古日数</span>
            </div>
            <div class="p-4 text-center">
              <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {{ stats.totalHours }}
              </p>
              <span class="text-xs text-neutral-500">総時間</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Activities Table -->
      <div>
        <div class="px-3 md:px-0 py-4 font-medium text-neutral-900 dark:text-neutral-100">アクティビティ履歴</div>

        <div v-if="activities.length > 0">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th class="px-3 md:px-6 py-3 font-medium text-neutral-500">日時</th>
                  <th class="px-3 md:px-6 py-3 font-medium text-neutral-500">時間 (h)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
                <tr v-for="activity in activities" :key="activity.id">
                  <td class="px-3 md:px-6 py-4">
                    {{ new Date(activity.date).toLocaleDateString() }}
                  </td>
                  <td class="px-3 md:px-6 py-4">
                    {{ activity.period }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Simple Paging -->
          <div
            class="border-t border-neutral-200 dark:border-neutral-800 px-3 md:px-0 py-4 flex justify-between items-center">
            <button
              @click="page > 1 && changePage(page - 1)"
              :disabled="page <= 1"
              class="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              前へ
            </button>
            <span class="text-sm text-neutral-500">{{ page }} ページ目</span>
            <button
              @click="changePage(page + 1)"
              :disabled="activities.length < limit"
              class="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              次へ
            </button>
          </div>
        </div>

        <div v-else class="py-8 text-center text-neutral-500 text-sm">履歴はありません</div>
      </div>

      <!-- Danger Zone -->
      <div class="mt-8 border border-red-200 dark:border-red-900 rounded-lg">
        <div class="px-4 py-3 bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-900 rounded-t-lg">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">危険な操作</h3>
        </div>
        <div class="p-4 space-y-4">
          <div class="flex flex-row mb-2 justify-between items-center md:flex-row">
            <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">ユーザーを削除</p>
            <button
              v-if="!showDeleteConfirm"
              @click="showDeleteConfirm = true"
              class="px-4 py-1.5 text-sm font-medium text-red-600 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
              削除
            </button>
          </div>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            このユーザーとそのすべてのデータを完全に削除します。<strong>この操作は取り消せません。</strong>
          </p>

          <!-- First Confirmation -->
          <div v-if="showDeleteConfirm && !showFinalConfirm" class="p-4 bg-red-50 dark:bg-red-950 rounded-md space-y-3">
            <p class="text-sm text-red-800 dark:text-red-200">
              削除操作を続行するには、以下に
              <strong>{{ user?.lastName }}{{ user?.firstName }}</strong>
              と入力してください：
            </p>
            <input
              v-model="deleteConfirmName"
              type="text"
              placeholder="ユーザー名を入力"
              class="w-full rounded-md border border-red-300 dark:border-red-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <div class="flex gap-2">
              <button
                @click="
                  showDeleteConfirm = false;deleteConfirmName = ''
                "
                class="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-500">
                キャンセル
              </button>
              <button
                @click="showFinalConfirm = true"
                :disabled="
                  deleteConfirmName !==
                  (user?.lastName ?? '') + (user?.firstName ?? '')
                "
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                次へ
              </button>
            </div>
          </div>

          <!-- Final Confirmation Modal -->
          <div v-if="showFinalConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div class="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5 text-red-600 dark:text-red-400"
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
                <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">本当に削除しますか？</h3>
              </div>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                <strong>{{ user?.lastName }} {{ user?.firstName }}</strong>
                さんのアカウントとすべての活動記録が削除されます。この操作は元に戻せません。
              </p>
              <div class="flex justify-end gap-3">
                <button
                  @click="
                    showFinalConfirm = false;
                    showDeleteConfirm = false;
                    deleteConfirmName = '';
                  "
                  class="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-500">
                  キャンセル
                </button>
                <button
                  @click="handleDeleteUser"
                  :disabled="deleting"
                  class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  <span v-if="deleting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  削除する
                </button>
              </div>
              <p v-if="deleteError" class="text-sm text-red-600 dark:text-red-400">
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
import { ref, computed, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query"
import { queryKeys } from "@/src/lib/queryKeys"
import hc from "@/src/lib/honoClient"
import Loading from "@/src/components/ui/Loading.vue"
import MessageDisplay from "@/src/components/common/MessageDisplay.vue"
import AdminMenu from "@/src/components/admin/AdminMenu.vue"

const route = useRoute()
const router = useRouter()
const userId = (
  Array.isArray(route.params.userId)
    ? route.params.userId[0]
    : route.params.userId
) as string

// Labels configuration
const roleLabels: Record<string, string> = {
  admin: "管理者",
  captain: "主将",
  "vice-captain": "副主将",
  treasurer: "会計",
  member: "部員",
}
const gradeLabels: Record<number, string> = {
  0: "無級",
  5: "五級",
  4: "四級",
  3: "三級",
  2: "二級",
  1: "一級",
  [-1]: "初段",
  [-2]: "二段",
  [-3]: "三段",
  [-4]: "四段",
}
const yearLabels: Record<string, string> = {
  b1: "1回生",
  b2: "2回生",
  b3: "3回生",
  b4: "4回生",
  m1: "修士1年",
  m2: "修士2年",
  d1: "博士1年",
  d2: "博士2年",
}

// Reactivity via standard refs
const page = ref(1)
const limit = 10
const queryClient = useQueryClient()

// Query
const {
  data: apiData,
  isLoading: loading,
  error: queryError,
} = useQuery({
  queryKey: computed(() => queryKeys.admin.users(userId, { page: page.value, limit })),
  queryFn: async () => {
    if (!userId) throw new Error("Invalid User ID")
    const res = await hc.admin.users[":userId"].$get({
      param: { userId },
      query: { page: page.value, limit },
    })
    if (!res.ok) throw new Error("Failed to fetch user data")
    return res.json()
  },
  placeholderData: (previousData) => previousData, // Keep data while fetching new page
})

const user = computed(() => apiData.value?.user ?? null)
const activities = computed(() => (apiData.value?.activities as any[]) ?? [])
const stats = computed(() => {
  if (!apiData.value) return null
  return {
    trainCount: apiData.value.trainCount,
    doneTrain: apiData.value.doneTrain,
    totalDays: apiData.value.totalDays,
    totalHours: apiData.value.totalHours,
    totalActivitiesCount: apiData.value.totalActivitiesCount,
  }
})

const error = computed(() =>
  queryError.value ? "ユーザー情報の読み込みに失敗しました" : ""
)

// Edit form state
const formData = ref({
  role: "member",
  grade: 0,
  year: "b1",
  joinedAt: new Date().getFullYear(),
  getGradeAt: "",
})
const updateSuccess = ref("")
const updateError = ref("")
const isEditing = ref(false)

// Delete state
const showDeleteConfirm = ref(false)
const showFinalConfirm = ref(false)
const deleteConfirmName = ref("")
const deleteError = ref("")

// Initialize form data when data arrives or changes
watch(
  user,
  (newUser) => {
    if (newUser && newUser.profile) {
      formData.value = {
        role: (newUser.profile.role as string) || "member",
        grade: Number(newUser.profile.grade || 0),
        year: (newUser.profile.year as string) || "b1",
        joinedAt: Number(newUser.profile.joinedAt || new Date().getFullYear()),
        getGradeAt: newUser.profile.getGradeAt
          ? new Date(newUser.profile.getGradeAt).toISOString().split("T")[0]!
          : "",
      }
    } else {
      formData.value = {
        role: "member",
        grade: 0,
        year: "b1",
        joinedAt: new Date().getFullYear(),
        getGradeAt: "",
      }
    }
  },
  { immediate: true }
)

const startEditing = () => {
  isEditing.value = true
  updateSuccess.value = ""
  updateError.value = ""
  // Form data is already synced via watch or we can reset it here if needed
  // ... (keeping reset logic implies we trust user.value is fresh)
}

const cancelEditing = () => {
  isEditing.value = false
  updateSuccess.value = ""
  updateError.value = ""
}

const changePage = (newPage: number) => {
  page.value = newPage
  // Auto-refetch via reactive queryKey
}

// Mutations
const { mutateAsync: updateProfile, isPending: updating } = useMutation({
  mutationFn: async (payload: any) => {
    const res = await hc.admin.users[":userId"].profile.$patch({
      param: { userId },
      json: payload,
    })
    if (!res.ok) {
      const errData = (await res.json()) as { error?: string }
      throw new Error(errData.error || "更新に失敗しました")
    }
    return res.json()
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['admin', 'users'], // Invalidate all user details
    })
    queryClient.invalidateQueries({
      queryKey: ['admin', 'accounts'], // Invalidate list as well (e.g. valid order might change)
    })
    updateSuccess.value = "プロファイルを更新しました"
    isEditing.value = false
  },
  onError: (e) => {
    updateError.value = e instanceof Error ? e.message : "更新中にエラーが発生しました"
  },
})

const handleUpdateProfile = async () => {
  updateError.value = ""
  updateSuccess.value = ""

  if (!userId) {
    updateError.value = "ユーザーIDが無効です"
    return
  }

  const payload = {
    role: formData.value.role,
    grade: formData.value.grade,
    year: formData.value.year,
    joinedAt: formData.value.joinedAt,
    getGradeAt: formData.value.getGradeAt ? formData.value.getGradeAt : null,
  }

  try {
    await updateProfile(payload)
  } catch {
    // Error handled in onError
  }
}

const { mutateAsync: deleteUserMutation, isPending: deleting } = useMutation({
  mutationFn: async () => {
    const res = await hc.admin.users[":userId"].$delete({ param: { userId } })
    if (!res.ok) {
      const errData = (await res.json()) as { error?: string }
      throw new Error(errData.error || "削除に失敗しました")
    }
    return res.json()
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    router.push("/admin/accounts")
  },
  onError: (e) => {
    deleteError.value = e instanceof Error ? e.message : "削除中にエラーが発生しました"
  },
})

const handleDeleteUser = async () => {
  deleteError.value = ""
  try {
    await deleteUserMutation()
  } catch {
    // Error handled in onError
  }
}
</script>
