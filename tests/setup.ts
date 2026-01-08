import { vi } from 'vitest'

// Mock environment variables
vi.stubGlobal('process', { env: { VITE_CLERK_PUBLISHABLE_KEY: 'test-key' } })

// Mock Clerk
vi.mock('@clerk/vue', () => ({
  useClerk: () => ({
    value: {
      client: {
        signUp: { create: vi.fn(), prepareEmailAddressVerification: vi.fn() },
      },
    },
  }),
  useUser: () => ({
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
    },
    isLoaded: true,
  }),
  useClerkAuth: () => ({ isSignedIn: true, isLoaded: true }),
  SignedIn: { name: 'SignedIn', template: '<slot></slot>' },
  SignedOut: { name: 'SignedOut', template: '<slot></slot>' },
  SignOutButton: {
    name: 'SignOutButton',
    template: '<button>Sign Out</button>',
  },
}))

// Mock Vue Router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useRoute: () => ({ path: '/', params: {}, query: {} }),
  RouterLink: { name: 'RouterLink', template: "<a href='#'><slot></slot></a>" },
  RouterView: { name: 'RouterView', template: '<slot></slot>' },
}))

// Mock Hono client
vi.mock('@/src/lib/honoClient', () => ({
  default: {
    user: {
      clerk: {
        account: { $get: vi.fn(), $patch: vi.fn() },
        profile: { $get: vi.fn(), $patch: vi.fn() },
      },
      record: { $get: vi.fn(), $post: vi.fn(), $delete: vi.fn() },
    },
  },
}))
