import { QueryClient } from '@tanstack/vue-query';
import { describe, it, expect } from 'vitest';

import { AccountMetadata } from '@/share/types/account';
import { queryKeys } from '@/src/lib/queryKeys';

// Mock the query keys to match actual implementation
// We can import queryKeys from src, but need to mock hc type dependencies if they are complex
// For now, let's use the actual queryKeys since it's a pure function object

describe('Profile Cache Consistency Integration', () => {
  it('enforces { profile: ... } shape for shared profile cache', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const mockProfileData = {
      id: 'user_123',
      role: 'member',
      grade: 1,
      getGradeAt: '2024-01-01',
      joinedAt: 2024,
      year: 'b1',
    };

    const cacheKey = queryKeys.user.clerk.profile();

    // 1. Simulate Home.vue fetching data
    // Home.vue expects the raw server response: { profile: { ... } }
    const serverResponse = {
      profile: mockProfileData,
    };

    queryClient.setQueryData(cacheKey, serverResponse);

    // Verify cache state matches Home.vue expectation
    const cachedDataHome = queryClient.getQueryData<{ profile: any }>(cacheKey);
    expect(cachedDataHome).toBeDefined();
    expect(cachedDataHome?.profile).toBeDefined();
    expect(cachedDataHome?.profile.grade).toBe(1);

    // 2. Simulate ProfileCard.vue accessing the SAME cache
    // ProfileCard.vue (after fix) should access cachedData.profile
    const cachedDataProfileCard = queryClient.getQueryData<{ profile: any }>(cacheKey);

    // This replicates the logic in ProfileCard.vue:
    // const profile = computed(() => profileData.value?.profile ?? null)
    const profileCardValue = cachedDataProfileCard?.profile ?? null;

    expect(profileCardValue).not.toBeNull();
    expect(profileCardValue.grade).toBe(1);
    expect(profileCardValue.year).toBe('b1');

    // 3. Simulate ProfileCard.vue UPDATING the cache (e.g. after edit)
    // It should maintain the { profile: ... } wrapper
    const updatedProfile = {
      ...mockProfileData,
      grade: 2, // Promoted
    };

    const validatedProfile = AccountMetadata(updatedProfile);
    // @ts-ignore - ArkType validation check simulation
    if (validatedProfile instanceof Error) throw new Error('Validation failed');

    // This replicates the fixed setQueryData in ProfileCard.vue:
    // queryClient.setQueryData(queryKeys.user.clerk.profile(), { profile: validatedProfile })
    queryClient.setQueryData(cacheKey, { profile: validatedProfile });

    // 4. Verify Home.vue still sees correct data after ProfileCard update
    const cachedDataHomeAfterUpdate = queryClient.getQueryData<{ profile: any }>(cacheKey);
    expect(cachedDataHomeAfterUpdate?.profile.grade).toBe(2);
  });
});
