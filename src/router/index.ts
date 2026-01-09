import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

import { createRouter, createWebHistory } from 'vue-router'

// HomeView remains eager for FCP
import { Role } from '@/share/types/role'
import HomeView from '@/src/views/Home.vue'
import NotFoundView from '@/src/views/NotFound.vue'
// Lazy load other views
const RecordView = () => import('@/src/views/Record.vue')
const SignInView = () => import('@/src/views/SignIn.vue')
const SignUpView = () => import('@/src/views/SignUp.vue')
const SignUpVerifyView = () => import('@/src/views/SignUpVerify.vue')
const UserView = () => import('@/src/views/account/User.vue')
const AdminAccountsView = () => import('@/src/views/admin/Accounts.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/record',
      name: 'record',
      component: RecordView,
      meta: { requiresAuth: true },
    },
    {
      path: '/sign-in',
      name: 'signIn',
      component: SignInView,
      meta: { requiresAuth: false },
    },
    {
      path: '/sign-up',
      name: 'signUp',
      component: SignUpView,
      meta: { requiresAuth: false },
    },
    {
      path: '/sign-up/verify',
      name: 'signUpVerify',
      component: SignUpVerifyView,
      meta: { requiresAuth: false },
    },
    {
      path: '/account',
      name: 'accountPortal',
      component: UserView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'adminDashboard',
      component: () => import('@/src/views/admin/Dashboard.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/accounts',
      name: 'adminAccounts',
      component: AdminAccountsView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/norms',
      name: 'adminNorms',
      component: () => import('@/src/views/admin/Norms.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/users/:userId',
      name: 'adminUserDetail',
      component: () => import('@/src/views/admin/UserDetail.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: NotFoundView,
      meta: { requiresAuth: false },
    },
  ],
})

interface ClerkUser {
  publicMetadata: Record<string, unknown>
}

interface ClerkClient {
  user: ClerkUser | null | undefined
  loaded: boolean
}

// Clerkが利用可能になるまで待つ
function waitForClerk(): Promise<ClerkClient> {
  return new Promise((resolve) => {
    const checkClerk = () => {
      if (window.Clerk?.loaded) {
        resolve(window.Clerk as unknown as ClerkClient)
      } else {
        setTimeout(checkClerk, 100)
      }
    }
    checkClerk()
  })
}

// ナビゲーションガード：Clerkの認証を確認
router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  try {
    const clerk = await waitForClerk()
    const requiresAuth = to.meta.requiresAuth === true
    const requiresAdmin = to.meta.requiresAdmin === true
    const isAuthenticated = clerk.user !== null && clerk.user !== undefined

    if (requiresAuth && !isAuthenticated) {
      // 認証が必要だが、ログインしていない場合はサインインページへ
      next({ name: 'signIn' })
    } else if (requiresAdmin && isAuthenticated) {
      // 管理者権限チェック
      const roleValue = (clerk.user?.publicMetadata as { role?: string })?.role
      const role = Role.fromString(`${roleValue}`)
      const isAdmin = role ? role.isManagement : false

      if (!isAdmin) {
        next({ name: 'home' }) // Not authorized, redirect to home
      } else {
        next()
      }
    } else if (
      !requiresAuth &&
      isAuthenticated &&
      (to.name === 'signIn' || to.name === 'signUp' || to.name === 'signUpVerify')
    ) {
      // すでにログインしている場合はホームへリダイレクト
      next({ name: 'home' })
    } else {
      // そのほかの場合は通常通り進む
      next()
    }
  } catch (error) {
    console.error('Router guard error:', error)
    next()
  }
})

export default router
