import { and, desc, eq, gte, inArray, lte } from "drizzle-orm"
import { z } from "zod"

import { activity, type ActivityType } from "~/db/schema"
import { createDb } from "~/lib/drizzle"
import { getProfile } from "~/lib/query/profile"
import { Role } from "~/lib/zod"

export const selectActivity = activity.$inferSelect
export const inputActivity = activity.$inferInsert

// MARK: getAllActivities
export async function getAllActivities(input: { applicateBy: string; env: Env }) {
  const db = createDb(input.env)

  const applicateBy = await getProfile({ userId: input.applicateBy, env: input.env })

  if (!applicateBy) return applicateBy

  const role = Role.fromString(applicateBy.role)
  if (!role || !role.isManagement()) {
    throw new Error("Permission denied")
  }
  const activities = await db.select().from(activity)
  return activities
}

// MARK: createActivity
export async function createActivity(input: {
  userId: string
  activity: typeof inputActivity
  env: Env
}) {
  const db = createDb(input.env)

  if (input.userId !== input.activity.userId) {
    throw new Error("Invalid user ID")
  }
  const data: typeof inputActivity = {
    date: input.activity.date,
    id: crypto.randomUUID(),
    userId: input.activity.userId,
    period: input.activity.period,
    createAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const result = await db.insert(activity).values(data).execute()
  return result
}

// MARK: userActivity
export async function userActivity(input: {
  userId: string | null
  start: Date | undefined
  end: Date | undefined
  env: Env
}) {
  const db = createDb(input.env)

  if (!input.userId) return []

  // 1970-01-01T00:00:00.000Z ~ 2100-12-31T23:59:59.999Zまでのデータを取得
  const start = input.start ? input.start.toISOString() : new Date(0).toISOString()
  const end = input.end ? input.end.toISOString() : new Date(4102444799999).toISOString()
  const activityData = await db
    .select()
    .from(activity)
    .where(
      and(
        eq(activity.userId, input.userId),
        gte(activity.date, start),
        lte(activity.date, end),
      ),
    )

  return activityData
}

// MARK: getActivitiesByDateRange
export async function getActivitiesByDateRange(input: {
  userId?: string
  startDate?: string
  endDate?: string
  env: Env
}) {
  const db = createDb(input.env)
  const { userId, startDate, endDate } = input

  const conditions = []
  if (userId) {
    conditions.push(eq(activity.userId, userId))
  }
  if (startDate) {
    conditions.push(gte(activity.date, startDate))
  }
  if (endDate) {
    conditions.push(lte(activity.date, endDate))
  }

  const activityData = await db
    .select()
    .from(activity)
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  return activityData
}

// MARK: recentlyActivity
export async function recentlyActivity(input: {
  userId: string
  limit: number
  env: Env
}) {
  const db = createDb(input.env)

  const activityData = await db
    .select()
    .from(activity)
    .where(eq(activity.userId, input.userId))
    .orderBy(desc(activity.createAt))
    .limit(input.limit)

  return activityData as ActivityType[]
}

// MARK: deleteActivity
export async function deleteActivity(input: { userId: string; id: string; env: Env }) {
  const db = createDb(input.env)

  const validatedInput = z.object({ id: z.string() }).parse(input)
  const activity_target = (
    await db.select().from(activity).where(eq(activity.id, validatedInput.id)).limit(1)
  )[0].userId

  if (input.userId !== activity_target) {
    throw new Error("Invalid user ID")
  }

  const result = await db
    .delete(activity)
    .where(eq(activity.id, validatedInput.id))
    .execute()

  return result
}

// MARK: getActivity
export async function getActivity(input: { id: string; env: Env }) {
  const db = createDb(input.env)

  const validatedInput = z.object({ id: z.string() }).parse(input)

  const activity_any = await db
    .select()
    .from(activity)
    .where(eq(activity.id, validatedInput.id))
    .limit(1)

  if (activity_any.length === 0) return null

  const act = activity_any[0]

  const data: typeof selectActivity = {
    date: act.date,
    id: act.id,
    userId: act.userId,
    period: act.period,
    createAt: act.createAt,
    updatedAt: act.updatedAt,
  }

  return data
}

// MARK: updateActivity
export async function updateActivity(input: {
  userId: string
  activityId: string
  activityData: Partial<typeof inputActivity>
  env: Env
}) {
  const db = createDb(input.env)

  const validatedInput = z
    .object({ userId: z.string(), activityId: z.string() })
    .parse(input)

  const user = await getProfile({ userId: validatedInput.userId, env: input.env })
  if (!user) {
    return null
  }

  const setData: Partial<typeof inputActivity> = {
    date: input.activityData.date,
    id: input.activityData.id,
    userId: input.activityData.userId,
    period: input.activityData.period,
    createAt: input.activityData.createAt,
    updatedAt: new Date().toISOString(),
  }

  const result = await db
    .update(activity)
    .set(setData)
    .where(eq(activity.id, validatedInput.activityId))
    .execute()

  return result
}

// MARK: createActivities
export async function createActivities(input: {
  userId: string
  activities: Array<typeof inputActivity>
  env: Env
}) {
  const db = createDb(input.env)

  const invalid = input.activities.some(act => act.userId !== input.userId)
  if (invalid) throw new Error("Invalid user ID in some activities")

  const activitiesData = input.activities.map(act => ({
    ...act,
    id: crypto.randomUUID(),
    createAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))

  const result = await db.insert(activity).values(activitiesData).execute()
  return result
}

// MARK: updateActivities
export async function updateActivities(input: {
  userId: string
  activities: Array<typeof inputActivity>
  env: Env
}) {
  const db = createDb(input.env)

  const ids = input.activities.map(act => act.id)
  const existingActivities = await db
    .select()
    .from(activity)
    .where(inArray(activity.id, ids))
  const invalid = existingActivities.some(a => a.userId !== input.userId)
  if (invalid) throw new Error("Invalid user ID in some activities")

  const results = await db.transaction(async tx => {
    const updatePromises = input.activities.map(act =>
      tx
        .update(activity)
        .set({ ...act, updatedAt: new Date().toISOString() })
        .where(eq(activity.id, act.id))
        .execute(),
    )
    return Promise.all(updatePromises)
  })

  return results
}

// MARK: deleteActivities
export async function deleteActivities(input: {
  userId: string
  ids: string[]
  env: Env
}) {
  const db = createDb(input.env)

  if (!Array.isArray(input.ids) || input.ids.length === 0) {
    throw new Error("No activity IDs provided")
  }
  const activities = await db
    .select()
    .from(activity)
    .where(inArray(activity.id, input.ids))
  const invalid = activities.some(a => a.userId !== input.userId)
  if (invalid) throw new Error("Invalid user ID in some activities")
  const results = await db.transaction(async tx => {
    const updatePromises = input.ids.map(id =>
      tx.delete(activity).where(eq(activity.id, id)).execute(),
    )
    return Promise.all(updatePromises)
  })
  return results
}

// MARK: activitySummary
export async function activitySummary({
  userId,
  getGradeAt,
  env,
}: {
  userId: string
  getGradeAt: Date
  env: Env
}) {
  const db = createDb(env)
  const conditions = [eq(activity.userId, userId)]

  const allActivities = await db
    .select()
    .from(activity)
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  const totalTrains = Math.floor(
    allActivities.map(a => a.period).reduce((a, b) => a + b, 0) / 1.5,
  )

  const trainFromGradeUp = Math.floor(
    allActivities
      .filter(a => new Date(a.date) > getGradeAt)
      .map(a => a.period)
      .reduce((a, b) => a + b, 0) / 1.5,
  )

  return {
    all: allActivities as ActivityType[],
    total: totalTrains as number,
    done: trainFromGradeUp as number,
  }
}
