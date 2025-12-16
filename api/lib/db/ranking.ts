import { and, desc, gte, lte, sql } from "drizzle-orm"

import { createDb } from "./drizzle"

import { activity } from "~/db/schema"

export async function getUserMonthlyRank(input: {
  userId: string
  env: Env
}): Promise<{ rank: number; total: number; userTotal: number } | null> {
  const db = createDb(input.env)

  const now = new Date()
  const year = now.getUTCFullYear()
  const monthIndex = now.getUTCMonth()

  const startDateStr = new Date(Date.UTC(year, monthIndex, 1)).toISOString().slice(0, 10)
  const endDateStr = new Date(Date.UTC(year, monthIndex + 1, 0))
    .toISOString()
    .slice(0, 10)

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
