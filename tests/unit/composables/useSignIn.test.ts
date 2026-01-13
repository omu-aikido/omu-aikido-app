import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

import { useSignIn } from '@/src/composable/useSignIn';

// Mock Clerk
const mockSignInCreate = vi.fn();
const mockAttemptSecondFactor = vi.fn();
const mockSetActive = vi.fn();
const mockAuthenticateWithRedirect = vi.fn();

vi.mock('@clerk/vue', () => ({
  useClerk: () =>
    ref({
      loaded: true,
      client: {
        signIn: {
          create: mockSignInCreate,
          attemptSecondFactor: mockAttemptSecondFactor,
          authenticateWithRedirect: mockAuthenticateWithRedirect,
        },
      },
      setActive: mockSetActive,
    }),
}));

describe('useSignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('should handle successful sign in', async () => {
      const { signIn, email, password } = useSignIn();
      email.value = 'test@example.com';
      password.value = 'password';

      mockSignInCreate.mockResolvedValue({
        status: 'complete',
        createdSessionId: 'sess_123',
      });

      const result = await signIn();

      expect(mockSignInCreate).toHaveBeenCalledWith({
        identifier: 'test@example.com',
        password: 'password',
      });
      expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_123' });
      expect(result).toBe(true);
    });

    it('should handle needs_second_factor', async () => {
      const { signIn, needsVerification } = useSignIn();

      mockSignInCreate.mockResolvedValue({
        status: 'needs_second_factor',
      });

      const result = await signIn();

      expect(result).toBe(false);
      expect(needsVerification.value).toBe(true);
    });

    it('should handle errors', async () => {
      const { signIn, error } = useSignIn();

      mockSignInCreate.mockRejectedValue({
        errors: [{ longMessage: 'Invalid credentials' }],
      });

      const result = await signIn();

      expect(result).toBe(false);
      expect(error.value).toBe('Invalid credentials');
    });
  });

  describe('verifyCode', () => {
    it('should handle successful verification', async () => {
      const { verifyCode, code } = useSignIn();
      code.value = '123456';

      mockAttemptSecondFactor.mockResolvedValue({
        status: 'complete',
        createdSessionId: 'sess_123',
      });

      const result = await verifyCode();

      expect(mockAttemptSecondFactor).toHaveBeenCalledWith({
        strategy: 'email_code',
        code: '123456',
      });
      expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_123' });
      expect(result).toBe(true);
    });

    it('should handle verification failure', async () => {
      const { verifyCode, error } = useSignIn();

      mockAttemptSecondFactor.mockRejectedValue({
        errors: [{ message: 'Invalid code' }],
      });

      const result = await verifyCode();

      expect(result).toBe(false);
      expect(error.value).toBe('Invalid code');
    });
  });

  describe('reset', () => {
    it('should reset state', () => {
      const { reset, email, password, code, error, needsVerification } = useSignIn();

      email.value = 'test';
      password.value = 'pass';
      code.value = '123';
      error.value = 'err';
      needsVerification.value = true;

      reset();

      expect(email.value).toBe('');
      expect(password.value).toBe('');
      expect(code.value).toBe('');
      expect(error.value).toBe(null);
      expect(needsVerification.value).toBe(false);
    });
  });
});
