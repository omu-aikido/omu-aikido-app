import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { Webhook } from 'svix'

import { dbClient } from '@/server/db/drizzle'
import { activity } from '@/server/db/schema'

type ClerkWebhookEvent = {
  type: string
  data: { id: string; unsafe_metadata: Record<string, unknown> }
}

export const webhooks = new Hono<{ Bindings: Env }>().post('/clerk', async (c) => {
  const webhookSecret = c.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return c.json({ error: 'Webhook secret not configured' }, 500)
  }

  const svix = new Webhook(webhookSecret)
  const payload = await c.req.text()
  const headers = {
    'svix-id': c.req.header('svix-id') ?? '',
    'svix-timestamp': c.req.header('svix-timestamp') ?? '',
    'svix-signature': c.req.header('svix-signature') ?? '',
  }

  let event: ClerkWebhookEvent
  try {
    event = svix.verify(payload, headers) as ClerkWebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return c.json({ error: 'Invalid signature' }, 400)
  }

  if (event.type === 'user.created') {
    const { createClerkClient } = await import('@clerk/backend')
    const clerkClient = createClerkClient({
      secretKey: c.env.CLERK_SECRET_KEY,
    })

    const meta = event.data.unsafe_metadata
    if (meta && Object.keys(meta).length > 0) {
      try {
        await clerkClient.users.updateUser(event.data.id, {
          publicMetadata: {
            year: meta.year,
            grade: meta.grade,
            joinedAt: meta.joinedAt,
            getGradeAt: meta.getGradeAt,
            role: 'member',
          },
        })
        // Invalidate cache after creating profile
        await c.env.KV.delete(`profile:${event.data.id}`)
        console.log(`Migrated metadata for user ${event.data.id}`)
      } catch (err) {
        console.error(`Failed to migrate metadata for user ${event.data.id}:`, err)
        return c.json({ error: 'Failed to update user' }, 500)
      }
    }
  }

  if (event.type === 'user.deleted') {
    const userId = event.data.id
    try {
      // Delete user's activity records from database
      const db = dbClient(c.env)
      await db.delete(activity).where(eq(activity.userId, userId))
      console.log(`Deleted activities for user ${userId}`)

      // Delete profile cache
      await c.env.KV.delete(`profile:${userId}`)
      console.log(`Deleted cache for user ${userId}`)
    } catch (err) {
      console.error(`Failed to cleanup data for user ${userId}:`, err)
      return c.json({ error: 'Failed to cleanup user data' }, 500)
    }
  }

  return c.json({ received: true })
})
