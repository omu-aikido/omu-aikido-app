import type { Context } from 'hono'

import { createClerkClient } from '@clerk/backend'
import { getAuth } from '@hono/clerk-auth'
import { ArkErrors } from 'arktype'

import { AccountMetadata } from '@/share/types/account'

const CACHE_TTL = 60 * 60 // 1 hour

type CachedProfile = typeof AccountMetadata.infer

export const getProfile = async (c: Context) => {
  const auth = getAuth(c)
  if (!auth || !auth.isAuthenticated) return null

  const cacheKey = `profile:${auth.userId}`

  // Try to get from KV cache
  const cached = (await c.env.KV.get(cacheKey, 'json')) as CachedProfile | null
  if (cached) {
    return cached
  }

  // Cache miss - fetch from Clerk
  const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })
  const user = await clerkClient.users.getUser(auth.userId)

  if (Object.keys(user.publicMetadata).length === 0) return null
  const profile = AccountMetadata(user.publicMetadata)
  if (profile instanceof ArkErrors) return null

  // Store only profile data in KV cache
  await c.env.KV.put(cacheKey, JSON.stringify(profile), {
    expirationTtl: CACHE_TTL,
  })
  return profile
}

export const getUser = async (c: Context) => {
  const auth = getAuth(c)
  if (!auth || !auth.userId) return null

  // No caching for full user data - fetch directly from Clerk
  const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })
  const user = await clerkClient.users.getUser(auth.userId)

  return user
}

export const patchProfile = async (c: Context, data: typeof AccountMetadata.infer) => {
  const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })
  const auth = getAuth(c)
  if (!auth || !auth.userId) throw new Error('Unauthorized')

  const validated = AccountMetadata(data)
  if (validated instanceof ArkErrors) {
    throw new TypeError('Invalid account data')
  }
  try {
    const updatedUser = await clerkClient.users.updateUserMetadata(auth.userId, { publicMetadata: { ...validated } })

    // Invalidate profile cache after update
    const cacheKey = `profile:${auth.userId}`
    await c.env.KV.delete(cacheKey)

    return updatedUser
  } catch {
    throw new Error('Failed to update user')
  }
}
