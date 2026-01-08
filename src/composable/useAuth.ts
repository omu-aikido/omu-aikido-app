import type { UserResource } from '@clerk/types'
import type { Ref } from 'vue'

import { useClerk, useUser, useAuth as useClerkAuth } from '@clerk/vue'
import { computed, ref } from 'vue'

import hc from '@/src/lib/honoClient'

// サーバーからの認証状態をキャッシュ
const serverAuthState = ref<{
  isAuthenticated: boolean
  userId: string | null
} | null>(null)

// サーバーから認証状態を取得
async function fetchAuthStatus() {
  try {
    const response = await hc['auth-status'].$get()
    if (!response.ok) throw new Error('Failed to fetch auth status')
    const data = await response.json()
    serverAuthState.value = {
      isAuthenticated: data.isAuthenticated,
      userId: data.userId,
    }
    return data
  } catch (error) {
    console.error('Error fetching auth status:', error)
    // サーバーリクエスト失敗時はデフォルト値を設定
    serverAuthState.value = { isAuthenticated: false, userId: null }
    return { isAuthenticated: false, userId: null }
  }
}

export function useAuth() {
  const clerk = useClerk()
  const { user, isLoaded: userLoaded } = useUser()
  const { isSignedIn, isLoaded: authLoaded } = useClerkAuth()

  // サーバー状態を基に、初期値を設定
  const isAuthenticated = computed(() => {
    // Clerkが完全に読み込まれるまではサーバー状態を使用
    if (!authLoaded.value || !userLoaded.value) {
      return serverAuthState.value?.isAuthenticated ?? false
    }
    // Clerkが読み込まれたら、Clerkの状態を使用
    return isSignedIn.value && !!user.value
  })

  const isLoading = computed(() => !authLoaded.value || !userLoaded.value)
  const isLoaded = computed(() => authLoaded.value && userLoaded.value)

  const signOut = async () => {
    if (!clerk.value) return
    await clerk.value.signOut()
  }

  return {
    user: user as Ref<UserResource | null | undefined>,
    isAuthenticated,
    isLoading,
    isLoaded,
    signOut,
  }
}

// アプリ起動時に一度だけサーバーから認証状態を取得
export async function initAuthState() {
  await fetchAuthStatus()
}
