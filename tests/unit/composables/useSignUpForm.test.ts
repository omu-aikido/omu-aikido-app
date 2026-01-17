import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

import { useSignUpForm } from '@/src/composable/useSignUpForm';

// Mock Clerk
const mockSignUpCreate = vi.fn();
const mockPrepareVerification = vi.fn();

vi.mock('@clerk/vue', () => ({
  useClerk: () =>
    ref({
      loaded: true,
      client: {
        signUp: {
          create: mockSignUpCreate,
          prepareEmailAddressVerification: mockPrepareVerification,
        },
      },
    }),
}));

describe('useSignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { step, formValues, formErrors } = useSignUpForm(2024);

      expect(step.value).toBe('basic');
      expect(formValues.joinedAt).toBe(2024);
      expect(formValues.grade).toBe(0);
      expect(Object.keys(formErrors)).toHaveLength(0);
    });
  });

  describe('Validation', () => {
    it('should validate basic step correctly', () => {
      const { validateStep, setFormValue, formErrors } = useSignUpForm(2024);

      // Invalid case
      setFormValue('email', 'invalid-email');
      setFormValue('newPassword', 'short');

      const isValid = validateStep('basic');
      expect(isValid).toBe(false);
      expect(formErrors.email).toBeDefined();
      expect(formErrors.newPassword).toBeDefined();

      // Valid case
      setFormValue('email', 'test@example.com');
      setFormValue('newPassword', 'Check123456'); // > 10 chars

      const isValidSuccess = validateStep('basic');
      expect(isValidSuccess).toBe(true);
    });

    it('should validate personal step correctly', () => {
      const { validateStep, setFormValue } = useSignUpForm(2024);

      setFormValue('firstName', 'A'); // Too short
      expect(validateStep('personal')).toBe(false);

      setFormValue('firstName', 'Alice');
      setFormValue('lastName', 'Smith');
      expect(validateStep('personal')).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('should navigate steps correctly', () => {
      const { step, nextStep, prevStep } = useSignUpForm(2024);

      expect(step.value).toBe('basic');

      nextStep();
      expect(step.value).toBe('personal');

      nextStep();
      expect(step.value).toBe('profile');

      prevStep();
      expect(step.value).toBe('personal');
    });
  });

  describe('handleClerkSignUp', () => {
    it('should call clerk signUp with correct data', async () => {
      const { handleClerkSignUp, setFormValue } = useSignUpForm(2024);

      // Setup valid form
      setFormValue('email', 'test@example.com');
      setFormValue('newPassword', 'password1234');
      setFormValue('firstName', 'Test');
      setFormValue('lastName', 'User');
      setFormValue('year', 'b1');
      setFormValue('grade', 1);
      setFormValue('joinedAt', 2024);
      setFormValue('legalAccepted', true);
      setFormValue('getGradeAt', null); // Explicitly match schema if needed, but schema says string|null and defined default is null

      mockSignUpCreate.mockResolvedValue({});
      mockPrepareVerification.mockResolvedValue({});

      const result = await handleClerkSignUp();

      expect(result).toBe(true);
      expect(mockSignUpCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          emailAddress: 'test@example.com',
          unsafeMetadata: {
            year: 'b1',
            grade: 1,
            joinedAt: 2024,
            getGradeAt: null,
          },
        })
      );
      expect(mockPrepareVerification).toHaveBeenCalled();
    });

    it('should handle sign up errors', async () => {
      const { handleClerkSignUp, setFormValue, clerkErrors } = useSignUpForm(2024);

      // Setup valid form to pass local validation
      setFormValue('email', 'test@example.com');
      setFormValue('newPassword', 'password1234');
      setFormValue('firstName', 'Test');
      setFormValue('lastName', 'User');
      setFormValue('year', 'b1');
      setFormValue('grade', 1);
      setFormValue('joinedAt', 2024);
      setFormValue('legalAccepted', true);

      mockSignUpCreate.mockRejectedValue({
        errors: [{ message: 'Email already taken' }],
      });

      const result = await handleClerkSignUp();

      expect(result).toBe(false);
      expect(clerkErrors.value[0]?.message).toBe('Email already taken');
    });
  });
});
