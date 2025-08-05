import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm"

import { activity, type ActivityType } from "~/db/schema"
import { createDb } from "~/lib/drizzle"

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

// MARK: getMonthlyRanking
export async function getMonthlyRanking(input: {
  year: number
  month: number
  env: Env
}) {
  const db = createDb(input.env)

  const startDate = new Date(input.year, input.month, 1)
  const endDate = new Date(input.year, input.month + 1, 0, 23, 59, 59)

  const startDateStr = startDate.toISOString()
  const endDateStr = endDate.toISOString()

  const result = await db
    .select({ userId: activity.userId, total: sql<number>`SUM(${activity.period})` })
    .from(activity)
    .where(and(gte(activity.date, startDateStr), lte(activity.date, endDateStr)))
    .groupBy(activity.userId)
    .orderBy(desc(sql<number>`SUM(${activity.period})`))
    .limit(5)

  return result
}

// MARK: getUserMonthlyRank
export async function getUserMonthlyRank(input: {
  userId: string
  year: number
  month: number
  env: Env
}): Promise<{ rank: number; total: number; userTotal: number } | null> {
  const db = createDb(input.env)

  const startDate = new Date(input.year, input.month, 1)
  const endDate = new Date(input.year, input.month + 1, 0, 23, 59, 59)

  const startDateStr = startDate.toISOString()
  const endDateStr = endDate.toISOString()

  // 全ユーザーの月次合計を取得（順位付けのため）
  const allUserTotals = await db
    .select({ userId: activity.userId, total: sql<number>`SUM(${activity.period})` })
    .from(activity)
    .where(and(gte(activity.date, startDateStr), lte(activity.date, endDateStr)))
    .groupBy(activity.userId)
    .orderBy(desc(sql<number>`SUM(${activity.period})`))

  // 指定されたユーザーの順位を計算
  const userIndex = allUserTotals.findIndex(user => user.userId === input.userId)

  if (userIndex === -1) {
    // ユーザーが今月活動していない場合
    return null
  }

  return {
    rank: userIndex + 1,
    total: allUserTotals.length,
    userTotal: allUserTotals[userIndex].total,
  }
}
