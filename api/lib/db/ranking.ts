import { and, desc, gte, lte, sql } from "drizzle-orm"

import { createDb } from "./drizzle"

import { activity } from "~/db/schema"

export async function getUserMonthlyRank(input: {
  userId: string
  env: Env
}): Promise<{ rank: number; total: number; userTotal: number } | null> {
  const db = createDb(input.env)

  const year = new Date().getUTCFullYear()
  const month = new Date().getUTCMonth()

  const startDateStr = `${year}-${month}-01`
  const endDateStr = new Date(year, month + 1, 0).toISOString().split("T")[0]

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
