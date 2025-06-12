import { z } from "zod"
import { db } from "@/src/lib/drizzle"
import { activity } from "@/./db/schema"
import { eq, gte, lte, and, desc } from "drizzle-orm"

import * as uuid from "uuid"

import { getProfile } from "@/src/lib/query/profile"
import { Role } from "@/src/class"

export const selectActivity = activity.$inferSelect
export const inputActivity = activity.$inferInsert

export async function getAllActivities(input: { applicateBy: string }) {
  const applicateBy = await getProfile({
    userId: input.applicateBy,
  })

  if (applicateBy instanceof Response) {
    return applicateBy
  }
  if (
    !(applicateBy instanceof Object) ||
    !(
      "grade" in applicateBy &&
      "getGradeAt" in applicateBy &&
      "joinedAt" in applicateBy &&
      "year" in applicateBy
    )
  ) {
    throw new Error("Invalid profile format.")
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

export async function resentlyActivity(input: { userId: string; limit: number }) {
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
  activityData: typeof inputActivity
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

  const setData: typeof inputActivity = {
    date: input.activityData.date,
    id: input.activityData.id,
    userId: input.activityData.userId,
    period: input.activityData.period,
    createAt: input.activityData.createAt,
    updatedAt: new Date().toISOString(),
  }

  await db.update(activity).set(setData).where(eq(activity.id, validatedInput.activityId)).execute()
}
