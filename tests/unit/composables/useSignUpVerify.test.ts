import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

import { useSignUpVerify } from '@/src/composable/useSignUpVerify'

// Mock Clerk
const mockAttemptEmailVerification = vi.fn()
const mockSetActive = vi.fn()

vi.mock('@clerk/vue', () => ({
  useClerk: () =>
    ref({
      loaded: true,
      client: {
        signUp: {
          attemptEmailAddressVerification: mockAttemptEmailVerification,
        },
      },
      setActive: mockSetActive,
    }),
}))

describe('useSignUpVerify', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should verify code successfully', async () => {
    const { verifyCode, code } = useSignUpVerify()
    code.value = '123456'

    mockAttemptEmailVerification.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'sess_123',
    })

    const result = await verifyCode()

    expect(mockAttemptEmailVerification).toHaveBeenCalledWith({
      code: '123456',
    })
    expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_123' })
    expect(result).toBe(true)
  })

  it('should handle verification failure not complete', async () => {
    const { verifyCode, error } = useSignUpVerify()

    // Status not complete
    mockAttemptEmailVerification.mockResolvedValue({
      status: 'pending',
    })

    const result = await verifyCode()

    expect(result).toBe(false)
    expect(error.value).toBe('Verification failed. Please try again.')
  })

  it('should handle API errors', async () => {
    const { verifyCode, error } = useSignUpVerify()

    mockAttemptEmailVerification.mockRejectedValue({
      errors: [{ message: 'Invalid code' }],
    })

    const result = await verifyCode()

    expect(result).toBe(false)
    expect(error.value).toBe('Invalid code')
  })
})
