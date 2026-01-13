import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

import { type ActivityType } from '../../../server/db/schema';
import { useActivities, useAddActivity, useDeleteActivity } from '../../../src/composable/useActivity';

// Mock Hono Client
vi.mock('../../../src/lib/honoClient', () => ({
  default: {
    user: { record: { $get: vi.fn(), $post: vi.fn(), $delete: vi.fn() } },
  },
}));

// Mock Vue Query
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/vue-query', () => ({
  useQuery: (options: any) => mockUseQuery(options),
  useMutation: (options: any) => mockUseMutation(options),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

const mockHonoClient = (await import('../../../src/lib/honoClient')).default;

describe('useActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation for useQuery to avoid errors if destructured
    mockUseQuery.mockReturnValue({
      data: ref([]),
      isLoading: ref(false),
      error: ref(null),
    });
    // Default mock for useMutation
    mockUseMutation.mockReturnValue({
      mutateAsync: vi.fn(),
    });
  });

  describe('useActivities', () => {
    it('should call useQuery with correct query function', async () => {
      const filters = ref({ startDate: '2024-01-01', endDate: '2024-01-31' });
      useActivities(filters);

      expect(mockUseQuery).toHaveBeenCalled();
      const callArgs = mockUseQuery.mock.calls[0];
      if (!callArgs) throw new Error('useQuery not called');
      const { queryFn } = callArgs[0];

      // Mock Hono response
      const mockActivities: ActivityType[] = [
        { id: '1', userId: 'u1', date: '2024-01-01', period: 1, createAt: '', updatedAt: null },
      ];
      vi.mocked(mockHonoClient.user.record.$get).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ activities: mockActivities }),
      } as any);

      // Execute queryFn
      const result = await queryFn();
      expect(result).toEqual(mockActivities);
      expect(mockHonoClient.user.record.$get).toHaveBeenCalledWith({
        query: filters.value,
      });
    });

    it('should handle fetch error in queryFn', async () => {
      const filters = ref({});
      useActivities(filters);
      const callArgs = mockUseQuery.mock.calls[0];
      if (!callArgs) throw new Error('useQuery not called');
      const { queryFn } = callArgs[0];

      vi.mocked(mockHonoClient.user.record.$get).mockResolvedValue({ ok: false } as any);

      await expect(queryFn()).rejects.toThrow('Failed to fetch activities');
    });
  });

  describe('useAddActivity', () => {
    it('should call useMutation with correct mutation function', async () => {
      useAddActivity();

      expect(mockUseMutation).toHaveBeenCalled();
      const callArgs = mockUseMutation.mock.calls[0];
      if (!callArgs) throw new Error('useMutation not called');
      const { mutationFn, onSuccess } = callArgs[0];

      // Mock Hono response
      vi.mocked(mockHonoClient.user.record.$post).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as any);

      // Execute mutationFn
      await mutationFn({ date: '2024-01-02', period: 2.0 });

      expect(mockHonoClient.user.record.$post).toHaveBeenCalledWith({
        json: { date: '2024-01-02', period: 2.0 },
      });

      // Execute onSuccess
      onSuccess();
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['user', 'record'] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['user', 'record', 'count'] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['user', 'record', 'ranking'] });
    });

    it('should handle error in mutationFn', async () => {
      useAddActivity();
      const callArgs = mockUseMutation.mock.calls[0];
      if (!callArgs) throw new Error('useMutation not called');
      const { mutationFn } = callArgs[0];

      vi.mocked(mockHonoClient.user.record.$post).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed' }),
      } as any);

      await expect(mutationFn({ date: '', period: 0 })).rejects.toThrow('Failed to add activity: Failed');
    });
  });

  describe('useDeleteActivity', () => {
    it('should call useMutation with correct mutation function', async () => {
      useDeleteActivity();

      expect(mockUseMutation).toHaveBeenCalled();
      const callArgs = mockUseMutation.mock.calls[0];
      if (!callArgs) throw new Error('useMutation not called');
      const { mutationFn, onSuccess } = callArgs[0];

      vi.mocked(mockHonoClient.user.record.$delete).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as any);

      await mutationFn(['1', '2']);

      expect(mockHonoClient.user.record.$delete).toHaveBeenCalledWith({
        json: { ids: ['1', '2'] },
      });

      onSuccess();
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['user', 'record'] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['user', 'record', 'count'] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['user', 'record', 'ranking'] });
    });
  });
});
