import type { Context, Next } from 'hono';

import { getAuth } from '@hono/clerk-auth';

export const ensureSignedIn = async (c: Context, next: Next): Promise<Response | void> => {
  const auth = getAuth(c);
  if (!auth || !auth.isAuthenticated) {
    c.status(401);
    return c.json({ error: 'Unauthorized' });
  }
  await next();
};
