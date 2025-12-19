import { and, desc, eq, gte, lte, sql } from "drizzle-orm"

import { createDb } from "./drizzle"

import { activity } from "@/app/db/schema"

export const selectActivity = activity.$inferSelect
export const inputActivity = activity.$inferInsert

export async function userActivitySummaryAndRecent(input: {
  userId: string
  start?: Date
  end?: Date
  env: Env
}) {
  const db = createDb(input.env)
  const start = (
    input.start ? input.start.toISOString() : new Date(0).toISOString()
  ).split("T")[0]
  const end = (
    input.end ? input.end.toISOString() : new Date(4102444799999).toISOString()
  ).split("T")[0]

  const recentWithTotal = await db
    .select({
      userId: activity.userId,
      id: activity.id,
      date: activity.date,
      period: activity.period,
      createAt: activity.createAt,
      updatedAt: activity.updatedAt,
      total: sql<number>`SUM(${activity.period}) OVER ()`.as("total"),
    })
    .from(activity)
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
