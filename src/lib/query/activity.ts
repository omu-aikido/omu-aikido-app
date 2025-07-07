import { z } from "zod"
import { db } from "@/src/lib/drizzle"
import { activity } from "@/./db/schema"
import { eq, gte, lte, and, desc, inArray } from "drizzle-orm"

import * as uuid from "uuid"

import { getProfile } from "@/src/lib/query/profile"
import { Role } from "@/src/zod"

export const selectActivity = activity.$inferSelect
export const inputActivity = activity.$inferInsert

export async function getAllActivities(input: { applicateBy: string }) {
  const applicateBy = await getProfile({
    userId: input.applicateBy,
  })

  if (applicateBy instanceof Response) {
    return applicateBy
  }

  const role = Role.fromString(applicateBy.role)
  if (!role || !role.isManagement()) {
    throw new Error("Permission denied")
  }
  const activities = await db.select().from(activity)
  return activities
}

export async function createActivity(input: { userId: string; activity: typeof inputActivity }) {
  if (input.userId !== input.activity.userId) {
    throw new Error("Invalid user ID")
  }
  const data: typeof inputActivity = {
    date: input.activity.date,
    id: uuid.v4(),
    userId: input.activity.userId,
    period: input.activity.period,
    createAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const result = await db.insert(activity).values(data).execute()
  return result
}

export async function userActivity(input: {
  userId: string
  start: Date | undefined
  end: Date | undefined
}) {
  // 1970-01-01T00:00:00.000Z ~ 2100-12-31T23:59:59.999Zまでのデータを取得
  const start = input.start ? input.start.toISOString() : new Date(0).toISOString()
  const end = input.end ? input.end.toISOString() : new Date(4102444799999).toISOString()
  const activityData = await db
    .select()
    .from(activity)
    .where(
      and(eq(activity.userId, input.userId), gte(activity.date, start), lte(activity.date, end)),
    )

  return activityData
}

// 新規追加: 指定された期間内のアクティビティを取得する関数
export async function getActivitiesByDateRange(input: {
  userId?: string
  startDate?: string
  endDate?: string
}) {
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

export async function recentlyActivity(input: { userId: string; limit: number }) {
  const activityData = await db
    .select()
    .from(activity)
    .where(eq(activity.userId, input.userId))
    .orderBy(desc(activity.createAt))
    .limit(input.limit)

  return activityData
}

export async function deleteActivity(input: { userId: string; id: string }) {
  const validatedInput = z.object({ id: z.string() }).parse(input)
  const activity_target = (
    await db.select().from(activity).where(eq(activity.id, validatedInput.id)).limit(1)
  )[0].userId

  if (input.userId !== activity_target) {
    throw new Error("Invalid user ID")
  }

  const result = await db.delete(activity).where(eq(activity.id, validatedInput.id)).execute()

  return result
}

export async function getActivity(input: { id: string }) {
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

export async function updateActivity(input: {
  userId: string
  activityId: string
  activityData: Partial<typeof inputActivity>
}) {
  const validatedInput = z
    .object({
      userId: z.string(),
      activityId: z.string(),
    })
    .parse(input)

  const user = await getProfile({ userId: validatedInput.userId })
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

export async function createActivities(input: {
  userId: string
  activities: Array<typeof inputActivity>
}) {
  const invalid = input.activities.some((act) => act.userId !== input.userId)
  if (invalid) throw new Error("Invalid user ID in some activities")

  const activitiesData = input.activities.map((act) => ({
    ...act,
    id: uuid.v4(),
    createAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))

  const result = await db.insert(activity).values(activitiesData).execute()
  return result
}

export async function updateActivities(input: {
  userId: string
  activities: Array<typeof inputActivity>
}) {
  const ids = input.activities.map((act) => act.id)
  const existingActivities = await db.select().from(activity).where(inArray(activity.id, ids))
  const invalid = existingActivities.some((a) => a.userId !== input.userId)
  if (invalid) throw new Error("Invalid user ID in some activities")

  const results = await db.transaction(async (tx) => {
    const updatePromises = input.activities.map((act) =>
      tx
        .update(activity)
        .set({
          ...act,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(activity.id, act.id))
        .execute(),
    )
    return Promise.all(updatePromises)
  })

  return results
}

export async function deleteActivities(input: { userId: string; ids: string[] }) {
  if (!Array.isArray(input.ids) || input.ids.length === 0) {
    throw new Error("No activity IDs provided")
  }
  const activities = await db.select().from(activity).where(inArray(activity.id, input.ids))
  const invalid = activities.some((a) => a.userId !== input.userId)
  if (invalid) throw new Error("Invalid user ID in some activities")
  const results = await db.transaction(async (tx) => {
    const updatePromises = input.ids.map((id) =>
      tx.delete(activity).where(eq(activity.id, id)).execute(),
    )
    return Promise.all(updatePromises)
  })
  return results
}
