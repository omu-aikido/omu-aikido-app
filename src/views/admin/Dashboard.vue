<template>
  <div class="space-y-6 px-3 md:px-6 pb-12">
    <AdminMenu />

    <div v-if="loading" class="flex justify-center py-12">
      <Loading />
    </div>

    <div v-else-if="error" class="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
      {{ error }}
    </div>

    <div v-else class="space-y-8">
      <section>
        <div class="px-3 md:px-6 pb-4 flex flex-col justify-between items-center">
          <h2 class="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
            直近3週間活動のない部員
          </h2>
          <span class="text-sm text-neutral-500 dark:text-neutral-400">{{ thresholdDate }} 以降の記録なし</span>
        </div>

        <div v-if="inactiveUsers.length === 0" class="p-8 text-center text-neutral-500">
          該当する部員はいません。全員活動中です！
        </div>

        <div v-else class="divide-y divide-neutral-200 dark:divide-neutral-700 max-h-125 overflow-y-auto">
          <div
            v-for="user in inactiveUsers"
            :key="user.id"
            class="flex items-center gap-3 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer"
            @click="$router.push(`/admin/users/${user.id}`)">
            <img :src="user.imageUrl" alt="" class="w-10 h-10 rounded-full bg-neutral-200 object-cover" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {{ user.lastName }} {{ user.firstName }}
              </div>
              <div class="text-xs text-neutral-500 truncate">
                {{ user.profile.roleLabel }}
              </div>
            </div>
            <div
              class="ml-auto text-xs text-red-600 dark:text-red-400 font-medium px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded">
              注意
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import hc from "@/src/lib/honoClient"
import Loading from "@/src/components/ui/Loading.vue"
import AdminMenu from "@/src/components/admin/AdminMenu.vue"
import type { AdminUserType } from "@/share/types/admin"

const inactiveUsers = ref<AdminUserType[]>([])
const thresholdDate = ref("")
const loading = ref(false)
const error = ref("")

const fetchDashboardData = async () => {
  loading.value = true
  error.value = ""
  try {
    const res = await hc.admin.dashboard.$get()
    if (!res.ok) throw new Error("Failed to fetch dashboard data")

    const data = await res.json()
    inactiveUsers.value = data.inactiveUsers
    thresholdDate.value = data.thresholdDate
  } catch (e) {
    console.error(e)
    error.value = "ダッシュボード情報の取得に失敗しました"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>
