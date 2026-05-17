import { createRouter, createWebHistory } from 'vue-router';

import { isAdminRole } from './adminGuard';

import HomeView from '@/pages/Home.vue';
import NotFoundView from '@/pages/NotFound.vue';
// Lazy load other views
const RecordView = () => import('@/pages/Record.vue');
const SignInView = () => import('@/pages/SignIn.vue');
const SignUpView = () => import('@/pages/SignUp.vue');
const SignUpVerifyView = () => import('@/pages/SignUpVerify.vue');
const UserView = () => import('@/pages/account/User.vue');
const AdminAccountsView = () => import('@/pages/admin/Accounts.vue');

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
      component: () => import('@/pages/admin/Dashboard.vue'),
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
      component: () => import('@/pages/admin/Norms.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/users/:userId',
      name: 'adminUserDetail',
      component: () => import('@/pages/admin/UserDetail.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: NotFoundView,
      meta: { requiresAuth: false },
    },
  ],
});

interface ClerkUser {
  publicMetadata: Record<string, unknown>;
}

interface ClerkClient {
  user: ClerkUser | null | undefined;
  loaded: boolean;
}

// Clerkが利用可能になるまで待つ
function waitForClerk(): Promise<ClerkClient> {
  return new Promise((resolve) => {
    const checkClerk = () => {
      if (window.Clerk?.loaded) {
        resolve(window.Clerk as unknown as ClerkClient);
      } else {
        setTimeout(checkClerk, 100);
      }
    };
    checkClerk();
  });
}

// ナビゲーションガード：Clerkの認証を確認
router.beforeEach(async (to, _from) => {
  try {
    const clerk = await waitForClerk();
    const requiresAuth = to.meta.requiresAuth === true;
    const requiresAdmin = to.meta.requiresAdmin === true;
    const isAuthenticated = clerk.user !== null && clerk.user !== undefined;

    // 1. 認証が必要だが未ログイン
    if (requiresAuth && !isAuthenticated) {
      return { name: 'signIn' };
    }

    // 2. 管理者権限チェック
    if (requiresAdmin) {
      if (!isAuthenticated) {
        return { name: 'signIn' };
      }

      const roleValue = (clerk.user?.publicMetadata as { role?: string })?.role;
      const isAdmin = isAdminRole(roleValue);

      if (!isAdmin) {
        return { name: 'home' };
      }
    }

    // 3. ログイン済みでサインイン/サインアップ画面に行こうとした場合
    if (isAuthenticated && (to.name === 'signIn' || to.name === 'signUp' || to.name === 'signUpVerify')) {
      return { name: 'home' };
    }

    return true;
  } catch (error) {
    console.error('Router guard error:', error);
    return true;
  }
});

export default router;
