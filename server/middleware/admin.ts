import type { Context, Next } from 'hono'

import { getAuth } from '@hono/clerk-auth'

import { getProfile } from '@/server/clerk/profile'
import { Role } from '@/share/types/role'

export const ensureAdmin = async (c: Context, next: Next): Promise<Response | void> => {
  const auth = getAuth(c)
  if (!auth || !auth.isAuthenticated) {
    c.status(401)
    return c.json({ error: 'Unauthorized' })
  }
  const profile = await getProfile(c)
  const role = profile?.role ? Role.fromString(profile.role) : null
  if (!role || !role.isManagement()) {
    c.status(403)
    return c.json({ error: 'Forbidden' })
  }
  await next()
}
