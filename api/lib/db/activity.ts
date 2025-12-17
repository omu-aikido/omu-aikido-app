import { and, eq, gte, inArray, lte } from "drizzle-orm"

import { createDb } from "./drizzle"

import { activity } from "~/db/schema"

export const selectActivity = activity.$inferSelect
export const inputActivity = activity.$inferInsert

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
  const now = new Date().toISOString()
  const data: typeof inputActivity = {
    date: input.activity.date,
    id: crypto.randomUUID(),
    userId: input.activity.userId,
    period: input.activity.period,
    createAt: now,
    updatedAt: now,
  }
  const result = await db.insert(activity).values(data).execute()
  return result
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

// MARK: createActivities
export async function createActivities(input: {
  userId: string
  activities: Array<typeof inputActivity>
  env: Env
}) {
  const db = createDb(input.env)

  const invalid = input.activities.some(act => act.userId !== input.userId)
  if (invalid) throw new Error("Invalid user ID in some activities")

  const activitiesData = input.activities.map(act => {
    const timestamp = new Date().toISOString()
    return { ...act, id: crypto.randomUUID(), createAt: timestamp, updatedAt: timestamp }
  })

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
  if (ids.length === 0) return []
  const existingActivities = await db
    .select({ id: activity.id })
    .from(activity)
    .where(and(inArray(activity.id, ids), eq(activity.userId, input.userId)))
  if (existingActivities.length !== input.activities.length)
    throw new Error("Invalid user ID in some activities")

  const results = await db.transaction(async tx => {
    const updates = input.activities.map(act =>
      tx
        .update(activity)
        .set({ ...act, updatedAt: new Date().toISOString() })
        .where(and(eq(activity.id, act.id), eq(activity.userId, input.userId)))
        .execute(),
    )
    return Promise.all(updates)
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
  const ownActivities = await db
    .select({ id: activity.id })
    .from(activity)
    .where(and(inArray(activity.id, input.ids), eq(activity.userId, input.userId)))
  if (ownActivities.length !== input.ids.length)
    throw new Error("Invalid user ID in some activities")

  return db
    .delete(activity)
    .where(and(inArray(activity.id, input.ids), eq(activity.userId, input.userId)))
    .execute()
}
