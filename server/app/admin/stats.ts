import { createClerkClient, type User } from '@clerk/backend'
import { arktypeValidator } from '@hono/arktype-validator'
import { type } from 'arktype'
import * as drizzleOrm from 'drizzle-orm'
import { Hono } from 'hono'

import { dbClient } from '@/server/db/drizzle'
import { activity } from '@/server/db/schema'
import * as grade from '@/share/lib/grade'

import * as helpers from './helpers'

// ============================================================
// Dashboard - Inactive Users
// ============================================================

const getDashboardStats = async (env: Env, secretKey: string) => {
  const clerkClient = createClerkClient({ secretKey })
  const db = dbClient(env)

  const usersRes = await clerkClient.users.getUserList({ limit: 100 })
  const allUsers = usersRes.data

  // Define "Inactive" threshold (3 weeks ago)
  const now = helpers.getJST(new Date())
  const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000)
  const threeWeeksAgoStr = threeWeeksAgo.toISOString().split('T')[0]!

  // Find users who HAVE activity in the last 3 weeks
  const activeUsersQuery = await db
    .selectDistinct({ userId: activity.userId })
    .from(activity)
    .where(drizzleOrm.gte(activity.date, threeWeeksAgoStr))

  const activeUserIds = new Set(activeUsersQuery.map((a) => a.userId))

  // Filter users without recent activity
  const inactiveClerkUsers = allUsers.filter((user) => {
    if (activeUserIds.has(user.id)) return false
    const profile = helpers.publicMetadataProfileSchema(user.publicMetadata)
    if (profile instanceof type.errors) return true
    return true
  })

  return {
    inactiveUsers: inactiveClerkUsers.map((u) => helpers.toAdminUser(u)),
    thresholdDate: threeWeeksAgoStr,
  }
}

// ============================================================
// Norms - Training Progress
// ============================================================

async function getUsersNorm(env: Env, clerkUsers: User[]) {
  const db = dbClient(env)

  const validProfiles = clerkUsers
    .map((u) => {
      const result = helpers.publicMetadataProfileSchema(u.publicMetadata)
      if (result instanceof type.errors) return null
      return { ...result, id: u.id }
    })
    .filter(
      (
        p
      ): p is {
        id: string
      } & typeof helpers.publicMetadataProfileSchema.infer => p !== null
    )

  if (validProfiles.length === 0) return []

  const conditions = validProfiles.map((profile) => {
    if (profile.getGradeAt) {
      return drizzleOrm.and(
        drizzleOrm.eq(activity.userId, profile.id),
        drizzleOrm.gte(activity.date, profile.getGradeAt)
      )
    }
    return drizzleOrm.eq(activity.userId, profile.id)
  })

  const activityData = await db
    .select()
    .from(activity)
    .where(drizzleOrm.or(...conditions))

  return validProfiles.map((profile) => {
    const userActivities = activityData.filter((a) => a.userId === profile.id)
    const totalPeriod = userActivities.reduce((sum, a) => sum + a.period, 0)
    const current = Math.floor(totalPeriod / 1.5)
    const required = grade.timeForNextGrade(profile.grade ?? 0)
    const progress = required > 0 ? Math.min(100, Math.round((current / required) * 100)) : 100

    return {
      userId: profile.id,
      current,
      required,
      progress,
      isMet: current >= required,
      grade: Number(profile.grade ?? 0),
      gradeLabel: grade.translateGrade(profile.grade ?? 0),
      lastPromotionDate: profile.getGradeAt ?? null,
    }
  })
}

// ============================================================
// Routes
// ============================================================

const app = new Hono<{ Bindings: Env }>()
  .get('/dashboard', async (c) => {
    const stats = await getDashboardStats(c.env, c.env.CLERK_SECRET_KEY)
    return c.json(stats)
  })
  .get('/norms', arktypeValidator('query', helpers.accountsQuerySchema), async (c) => {
    const clerkClient = createClerkClient({
      secretKey: c.env.CLERK_SECRET_KEY,
    })
    const { query, limit } = c.req.valid('query')
    const userLimit = Number(limit ?? 20)

    const clerkUsers = await clerkClient.users.getUserList({
      limit: userLimit,
      query: query ?? '',
      orderBy: 'created_at',
    })

    const users = clerkUsers.data.map((u) => helpers.toAdminUser(u))
    const norms = await getUsersNorm(c.env, clerkUsers.data)

    return c.json({ users, norms, search: query ?? '' })
  })

export default app
