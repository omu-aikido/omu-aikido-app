import { createClerkClient } from '@clerk/backend';
import { getAuth } from '@hono/clerk-auth';
import { ArkErrors } from 'arktype';
import type { Context } from 'hono';

import { AccountMetadata } from '@/share/types/account';

export const getProfile = async (c: Context) => {
  const auth = getAuth(c);
  if (!auth || !auth.isAuthenticated) return null;

  const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY });
  const user = await clerkClient.users.getUser(auth.userId);

  if (Object.keys(user.publicMetadata).length === 0) return null;
  const profile = AccountMetadata(user.publicMetadata);
  if (profile instanceof ArkErrors) return null;

  return profile;
};

export const getUser = async (c: Context) => {
  const auth = getAuth(c);
  if (!auth || !auth.userId) return null;

  const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY });
  const user = await clerkClient.users.getUser(auth.userId);

  return user;
};

export const patchProfile = async (c: Context, data: typeof AccountMetadata.infer) => {
  const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY });
  const auth = getAuth(c);
  if (!auth || !auth.userId) throw new Error('Unauthorized');

  const validated = AccountMetadata(data);
  if (validated instanceof ArkErrors) {
    throw new TypeError('Invalid account data');
  }
  try {
    const updatedUser = await clerkClient.users.updateUserMetadata(auth.userId, { publicMetadata: { ...validated } });

    return updatedUser;
  } catch {
    throw new Error('Failed to update user');
  }
};
