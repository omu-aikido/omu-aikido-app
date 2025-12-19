import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm"

import { activity } from "@/app/db/schema"
import { createDb } from "@/app/lib/drizzle"

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

// MARK: home loader helper
export async function userActivitySummaryAndRecent(input: {
  userId: string
  start?: Date
  end?: Date
  env: Env
}) {
  const db = createDb(input.env)
  const start = input.start ? input.start.toISOString() : new Date(0).toISOString()
  const end = input.end ? input.end.toISOString() : new Date(4102444799999).toISOString()

  // サブクエリで合計periodを取得（Drizzle SubQuery API使用）
  const totalSubQuery = db
    .select({ total: sql<number>`SUM(${activity.period})`.as("total") })
    .from(activity)
    .where(
      and(
        eq(activity.userId, input.userId),
        gte(activity.date, start),
        lte(activity.date, end),
      ),
    )
    .as("total_summary")

  // 最新1件＋合計をJOINで取得（サブクエリをJOINで使用）
  const recentWithTotal = await db
    .select({
      userId: activity.userId,
      id: activity.id,
      date: activity.date,
      period: activity.period,
      createAt: activity.createAt,
      updatedAt: activity.updatedAt,
      total: totalSubQuery.total,
    })
    .from(activity)
    .leftJoin(totalSubQuery, sql`1=1`)
    .where(
      and(
        eq(activity.userId, input.userId),
        gte(activity.date, start),
        lte(activity.date, end),
      ),
    )
    .orderBy(desc(activity.createAt))
    .limit(1)

  return recentWithTotal
}

// MARK: createActivities
export async function createActivities(input: {
  userId: string
  activities: (typeof inputActivity)[]
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
  activities: (typeof inputActivity)[]
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

// MARK: getUserMonthlyRank
export async function getUserMonthlyRank(input: {
  userId: string
  year: number
  month: number
  env: Env
}): Promise<{ rank: number; total: number; userTotal: number } | null> {
  const db = createDb(input.env)

  const startDate = new Date(input.year, input.month, 1, 9)
  const endDate = new Date(input.year, input.month + 1, 0, 23, 59, 59)

  const startDateStr = startDate.toISOString().split("T")[0]
  const endDateStr = endDate.toISOString().split("T")[0]

  // 全ユーザーの月次合計を取得（順位付けのため）
  const allUserTotals = await db
    .select({ userId: activity.userId, total: sql<number>`SUM(${activity.period})` })
    .from(activity)
    .where(and(gte(activity.date, startDateStr), lte(activity.date, endDateStr)))
    .groupBy(activity.userId)
    .orderBy(desc(sql<number>`SUM(${activity.period})`))

  const userIndex = allUserTotals.findIndex(user => user.userId === input.userId)
  if (userIndex === -1) {
    return null
  }

  const userTotal = Number(allUserTotals[userIndex].total)
  const rank = allUserTotals.filter(u => Number(u.total) > userTotal).length + 1

  return { rank, total: allUserTotals.length, userTotal }
}
