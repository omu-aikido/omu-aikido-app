import type { ClerkAPIError } from '@clerk/types';

import { useClerk } from '@clerk/vue';
import { ref } from 'vue';

export function useSignIn() {
  const clerk = useClerk();
  const email = ref('');
  const password = ref('');
  const code = ref('');
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const needsVerification = ref(false);

  const signIn = async () => {
    const loaded = clerk.value?.loaded;

    if (!loaded) {
      error.value = 'Authentication service is not available.';
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const signInAttempt = await clerk.value?.client?.signIn.create({
        identifier: email.value,
        password: password.value,
      });

      if (!signInAttempt) throw new Error('Sign in failed. Please check your credentials.');

      if (signInAttempt.status === 'complete') {
        await clerk.value?.setActive({
          session: signInAttempt.createdSessionId,
        });
        return true;
      }

      if (signInAttempt.status === 'needs_second_factor') {
        needsVerification.value = true;
        return false;
      }
    } catch (err: unknown) {
      const clerkError = (err as { errors?: ClerkAPIError[] }).errors?.[0];
      error.value = clerkError?.longMessage || clerkError?.message || 'Sign in failed. Please check your credentials.';
    } finally {
      isLoading.value = false;
    }
    return false;
  };

  const verifyCode = async () => {
    const isLoaded = clerk.value?.loaded;
    if (!isLoaded) {
      error.value = 'Authentication service is not available.';
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const signInAttempt = await clerk.value?.client?.signIn.attemptSecondFactor({
        strategy: 'email_code',
        code: code.value,
      });

      if (!signInAttempt) throw new Error('Sign in failed. Please check your credentials.');

      if (signInAttempt.status === 'complete') {
        await clerk.value?.setActive({
          session: signInAttempt.createdSessionId,
        });
        return true;
      }
    } catch (err: unknown) {
      const clerkError = (err as { errors?: ClerkAPIError[] }).errors?.[0];
      error.value = clerkError?.longMessage || clerkError?.message || 'Verification failed.';
    } finally {
      isLoading.value = false;
    }
    return false;
  };

  const signInWithDiscord = async () => {
    const isLoaded = clerk.value?.loaded;
    if (!isLoaded) {
      error.value = 'Authentication service is not available.';
      return;
    }
    isLoading.value = true;
    error.value = null;
    try {
      await clerk.value?.client?.signIn.authenticateWithRedirect({
        strategy: 'oauth_discord',
        redirectUrl: '/',
        redirectUrlComplete: '/',
      });
    } catch (err: unknown) {
      const clerkError = (err as { errors?: ClerkAPIError[] }).errors?.[0];
      error.value = clerkError?.longMessage || clerkError?.message || 'Discord authentication failed.';
    } finally {
      isLoading.value = false;
    }
  };

  const reset = () => {
    email.value = '';
    password.value = '';
    code.value = '';
    error.value = null;
    needsVerification.value = false;
  };

  return {
    email,
    password,
    code,
    isLoading,
    error,
    needsVerification,
    signIn,
    verifyCode,
    signInWithDiscord,
    reset,
  };
}
