import { getAuth } from '@hono/clerk-auth';
import type { Context, Next } from 'hono';

export const ensureSignedIn = async (c: Context, next: Next): Promise<Response | void> => {
  const auth = getAuth(c);
  if (!auth || !auth.isAuthenticated) {
    c.status(401);
    return c.json({ error: 'Unauthorized' });
  }
  await next();
};
