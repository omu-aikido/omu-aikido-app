import { beforeEach, describe, expect, mock, test } from 'bun:test';

const deleteWhereMock = mock(async () => {});
const dbDeleteMock = mock(() => ({ where: deleteWhereMock }));
const notifyMock = mock(() => {});

const clerkUsers = {
  getUser: mock(async (userId: string) => {
    if (userId === 'admin-user') {
      return { id: 'admin-user', publicMetadata: { role: 'admin' } };
    }
    if (userId === 'target-user') {
      return { id: 'target-user', publicMetadata: { role: 'member' } };
    }
    throw new Error('user not found');
  }),
  deleteUser: mock(async () => {}),
};

mock.module('@hono/clerk-auth', () => ({
  getAuth: (c: { req: { header: (key: string) => string | null } }) => {
    const userId = c.req.header('x-user-id');
    if (!userId) return null;
    return { userId, isAuthenticated: true };
  },
}));

mock.module('@clerk/backend', () => ({
  createClerkClient: () => ({
    users: clerkUsers,
  }),
}));

mock.module('@/src/db/drizzle', () => ({
  dbClient: () => ({
    delete: dbDeleteMock,
  }),
}));

mock.module('@/src/lib/observability', () => ({
  notify: notifyMock,
}));

const { default: usersApp } = await import('@/src/app/admin/users');
const testEnv = {
  CLERK_SECRET_KEY: 'test-secret',
} as Env;

describe('DELETE /:userId', () => {
  beforeEach(() => {
    deleteWhereMock.mockClear();
    dbDeleteMock.mockClear();
    notifyMock.mockClear();
    clerkUsers.getUser.mockClear();
    clerkUsers.deleteUser.mockClear();
  });

  test('deletes clerk user and then deletes activities by userId', async () => {
    const res = await usersApp.request(
      'http://localhost/target-user',
      {
        method: 'DELETE',
        headers: {
          'x-user-id': 'admin-user',
        },
      },
      testEnv
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ success: true });
    expect(clerkUsers.deleteUser).toHaveBeenCalledWith('target-user');
    expect(dbDeleteMock).toHaveBeenCalledTimes(1);
    expect(deleteWhereMock).toHaveBeenCalledTimes(1);
  });

  test('returns 500 and does not delete clerk user when activity deletion fails', async () => {
    deleteWhereMock.mockImplementationOnce(async () => {
      throw new Error('db failure');
    });

    const res = await usersApp.request(
      'http://localhost/target-user',
      {
        method: 'DELETE',
        headers: {
          'x-user-id': 'admin-user',
        },
      },
      testEnv
    );
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({ error: '活動記録の削除に失敗しました' });
    expect(clerkUsers.deleteUser).not.toHaveBeenCalled();
    expect(notifyMock).toHaveBeenCalledTimes(1);
  });
});
