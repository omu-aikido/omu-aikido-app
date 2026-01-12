import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

import { useAuth, initAuthState } from '@/src/composable/useAuth'

// Mock Hono Client
const mockGetAuthStatus = vi.fn()
vi.mock('@/src/lib/honoClient', () => ({
  default: {
    'auth-status': { $get: () => mockGetAuthStatus() },
  },
}))

// Mock Clerk
const mockUseClerk = vi.fn()
const mockUseUser = vi.fn()
const mockUseClerkAuth = vi.fn()

vi.mock('@clerk/vue', () => ({
  useClerk: () => mockUseClerk(),
  useUser: () => mockUseUser(),
  useAuth: () => mockUseClerkAuth(),
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mocks
    mockUseClerk.mockReturnValue({ value: { signOut: vi.fn() } })
    mockUseUser.mockReturnValue({ user: ref(null), isLoaded: ref(true) })
    mockUseClerkAuth.mockReturnValue({ isSignedIn: ref(false), isLoaded: ref(true) })
  })

  describe('initAuthState', () => {
    it('should fetch auth status from server and update state', async () => {
      mockGetAuthStatus.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ isAuthenticated: true, userId: 'user_1' }),
      })

      await initAuthState()

      // We can't access serverAuthState directly as it is not exported
      // But we can verify through useAuth if we mock Clerk loading state to false
      // so it falls back to server state
      mockUseClerkAuth.mockReturnValue({ isSignedIn: ref(false), isLoaded: ref(false) })
      mockUseUser.mockReturnValue({ user: ref(null), isLoaded: ref(false) })

      const { isAuthenticated } = useAuth()
      expect(isAuthenticated.value).toBe(true)
    })

    it('should handle fetch failure', async () => {
      mockGetAuthStatus.mockResolvedValue({ ok: false })
      await initAuthState()

      mockUseClerkAuth.mockReturnValue({ isSignedIn: ref(false), isLoaded: ref(false) })
      mockUseUser.mockReturnValue({ user: ref(null), isLoaded: ref(false) })

      const { isAuthenticated } = useAuth()
      expect(isAuthenticated.value).toBe(false)
    })
  })

  describe('useAuth', () => {
    it('should return server auth state when Clerk is loading', async () => {
      // Setup server state
      mockGetAuthStatus.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ isAuthenticated: true, userId: 'user_1' }),
      })
      await initAuthState()

      // Clerk loading
      mockUseClerkAuth.mockReturnValue({ isSignedIn: ref(false), isLoaded: ref(false) })
      mockUseUser.mockReturnValue({ user: ref(null), isLoaded: ref(false) })

      const { isAuthenticated, isLoading } = useAuth()

      expect(isAuthenticated.value).toBe(true) // Server says authenticated
      expect(isLoading.value).toBe(true) // Clerk is loading
    })

    it('should return Clerk auth state when Clerk is loaded', () => {
      // Clerk loaded and signed in
      mockUseClerkAuth.mockReturnValue({ isSignedIn: ref(true), isLoaded: ref(true) })
      mockUseUser.mockReturnValue({ user: ref({ id: 'u1' }), isLoaded: ref(true) })

      const { isAuthenticated, isLoading } = useAuth()

      expect(isAuthenticated.value).toBe(true)
      expect(isLoading.value).toBe(false)
    })

    it('should return false if Clerk is signed out', () => {
      mockUseClerkAuth.mockReturnValue({ isSignedIn: ref(false), isLoaded: ref(true) })
      mockUseUser.mockReturnValue({ user: ref(null), isLoaded: ref(true) })

      const { isAuthenticated } = useAuth()

      expect(isAuthenticated.value).toBe(false)
    })

    it('signOut should call clerk.signOut', async () => {
      const mockSignOut = vi.fn()
      mockUseClerk.mockReturnValue({ value: { signOut: mockSignOut } })

      const { signOut } = useAuth()
      await signOut()

      expect(mockSignOut).toHaveBeenCalled()
    })
  })
})
