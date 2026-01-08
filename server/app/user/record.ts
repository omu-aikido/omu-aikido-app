import { arktypeValidator } from '@hono/arktype-validator'
import { getAuth } from '@hono/clerk-auth'
import * as drizzleOrm from 'drizzle-orm'
import { Hono } from 'hono'

import { dbClient } from '@/server/db/drizzle'
import { activity } from '@/server/db/schema'
import * as records from '@/share/types/records'

export const record = new Hono<{ Bindings: Env }>()
  // GET /api/user/record - 活動記録一覧取得
  .get(
    '/',
    arktypeValidator('query', records.recordQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid Query' }, 400)
      }
      return
    }),
    async (c) => {
      const auth = getAuth(c)
      if (!auth || !auth.userId) return c.json({ error: 'Unauthorized' }, 401)

      const query = c.req.valid('query')
      const userId = query.userId ?? auth.userId

      if (userId !== auth.userId) {
        return c.json({ error: 'Forbidden' }, 403)
      }

      const db = dbClient(c.env)
      const conditions = [drizzleOrm.eq(activity.userId, userId)]
      if (query.startDate) conditions.push(drizzleOrm.gte(activity.date, query.startDate))
      if (query.endDate) conditions.push(drizzleOrm.lte(activity.date, query.endDate))

      const activities = await db
        .select()
        .from(activity)
        .where(drizzleOrm.and(...conditions))
        .orderBy(drizzleOrm.desc(activity.date))

      return c.json({ activities }, 200)
    }
  )

  // POST /api/user/record - 活動記録作成
  .post(
    '/',
    arktypeValidator('json', records.createActivitySchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid Activity Data' }, 400)
      }
      return
    }),
    async (c) => {
      const auth = getAuth(c)
      if (!auth || !auth.userId) return c.json({ error: 'Unauthorized' }, 401)

      const body = c.req.valid('json')
      const db = dbClient(c.env)
      const now = new Date().toISOString()

      await db.insert(activity).values({
        id: crypto.randomUUID(),
        userId: auth.userId,
        date: body.date,
        period: body.period ?? 1.5,
        createAt: now,
        updatedAt: now,
      })

      return c.json({ success: true }, 201)
    }
  )

  // DELETE /api/user/record - 活動記録削除
  .delete(
    '/',
    arktypeValidator('json', records.deleteActivitiesSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid Delete Request' }, 400)
      }
      return
    }),
    async (c) => {
      const auth = getAuth(c)
      if (!auth || !auth.userId) return c.json({ error: 'Unauthorized' }, 401)

      const body = c.req.valid('json')
      const db = dbClient(c.env)

      await db
        .delete(activity)
        .where(drizzleOrm.and(drizzleOrm.inArray(activity.id, body.ids), drizzleOrm.eq(activity.userId, auth.userId)))

      return c.json({ success: true }, 200)
    }
  )

  // GET /api/user/record/count - 稽古回数取得
  .get('/count', async (c) => {
    const auth = getAuth(c)
    if (!auth || !auth.userId) return c.json({ error: 'Unauthorized' }, 401)

    const db = dbClient(c.env)

    const { getProfile } = await import('@/server/clerk/profile')
    const profile = await getProfile(c)

    const startDate = profile?.getGradeAt || '1970-01-01'

    const result = await db
      .select({
        totalPeriod: drizzleOrm.sql<number>`COALESCE(SUM(${activity.period}), 0)`,
      })
      .from(activity)
      .where(drizzleOrm.and(drizzleOrm.eq(activity.userId, auth.userId), drizzleOrm.gte(activity.date, startDate)))

    const totalPeriod = result[0]?.totalPeriod || 0

    const practiceCount = Math.floor(totalPeriod / 1.5)

    return c.json({ practiceCount, totalPeriod, since: startDate }, 200)
  })

  // POST /api/user/record/page - ページネーション付き記録取得
  .post(
    '/page',
    arktypeValidator('json', records.paginationSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid Pagination Data' }, 400)
      }
      return
    }),
    async (c) => {
      const auth = getAuth(c)
      if (!auth || !auth.userId) return c.json({ error: 'Unauthorized' }, 401)

      const body = c.req.valid('json')
      const page = body.page
      const perPage = body.perPage ?? 20
      const offset = (page - 1) * perPage

      const db = dbClient(c.env)

      // 総件数を取得
      const countResult = await db
        .select({ total: drizzleOrm.sql<number>`COUNT(*)` })
        .from(activity)
        .where(drizzleOrm.eq(activity.userId, auth.userId))

      const total = countResult[0]?.total || 0
      const totalPages = Math.ceil(total / perPage)

      // ページネーション付きデータを取得
      const activities = await db
        .select()
        .from(activity)
        .where(drizzleOrm.eq(activity.userId, auth.userId))
        .orderBy(drizzleOrm.desc(activity.date))
        .limit(perPage)
        .offset(offset)

      return c.json({ activities, pagination: { page, perPage, total, totalPages } }, 200)
    }
  )

  // GET /api/user/record/ranking - 最適化されたランキング取得
  .get(
    '/ranking',
    arktypeValidator('query', records.rankingQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid Query Parameters' }, 400)
      }
      return
    }),
    async (c) => {
      const auth = getAuth(c)
      if (!auth || !auth.userId) return c.json({ error: 'Unauthorized' }, 401)

      const db = dbClient(c.env)
      const query = c.req.valid('query')

      // クエリパラメータから年月を取得（デフォルト: 今月）
      // JST (UTC+9) で現在時刻を取得
      const utcNow = new Date()
      const jstNow = new Date(utcNow.getTime() + 9 * 60 * 60 * 1000)
      const targetYear = query.year ?? jstNow.getUTCFullYear()
      const targetMonth = query.month ?? jstNow.getUTCMonth() + 1
      const period = (query.period ?? 'monthly') as 'monthly' | 'annual' | 'fiscal'

      // 日付範囲の算出（ISOフォーマット統一）
      let startDate: string
      let endDate: string
      let periodLabel: string

      if (period === 'annual') {
        startDate = `${targetYear}-01-01`
        endDate = `${targetYear}-12-31`
        periodLabel = `${targetYear}年`
      } else if (period === 'fiscal') {
        startDate = `${targetYear}-04-01`
        endDate = `${targetYear + 1}-03-31`
        periodLabel = `${targetYear}年度`
      } else {
        // 月の開始日と終了日をJST用に計算
        const monthStart = new Date(Date.UTC(targetYear, targetMonth - 1, 1))
        const monthEnd = new Date(Date.UTC(targetYear, targetMonth, 0))
        startDate = monthStart.toISOString().split('T')[0] || ''
        endDate = monthEnd.toISOString().split('T')[0] || ''
        periodLabel = new Date(targetYear, targetMonth - 1, 1).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
        })
      }

      // Fetch ranking stats from DB
      const monthlyStats = await db
        .select({
          userId: activity.userId,
          totalPeriod: drizzleOrm.sql<number>`COALESCE(SUM(${activity.period}), 0)`,
        })
        .from(activity)
        .where(drizzleOrm.and(drizzleOrm.gte(activity.date, startDate), drizzleOrm.lte(activity.date, endDate)))
        .groupBy(activity.userId)
        .orderBy(drizzleOrm.desc(drizzleOrm.sql<number>`COALESCE(SUM(${activity.period}), 0)`))
        .limit(50)

      // No need to fetch user details from Clerk - frontend already has this info
      const currentUserName = 'あなた'

      type RankingEntry = {
        rank: number
        userId: string
        userName: string
        isCurrentUser: boolean
        totalPeriod: number
        practiceCount: number
      }

      const ranking: RankingEntry[] = []
      let currentUserRanking: RankingEntry | null = null
      let currentRank = 1
      let previousTotalPeriod: number | null = null

      monthlyStats.forEach((stat, index) => {
        // 前の人と同じtotalPeriodでなければ、rankをindexに基づいて更新
        if (previousTotalPeriod !== null && stat.totalPeriod !== previousTotalPeriod) {
          currentRank = index + 1
        }

        const isCurrentUser = stat.userId === auth.userId
        const rankData = {
          rank: currentRank,
          userId: stat.userId,
          userName: isCurrentUser ? currentUserName : '匿名',
          isCurrentUser,
          totalPeriod: stat.totalPeriod,
          practiceCount: Math.floor(stat.totalPeriod / 1.5),
        }

        ranking.push(rankData)

        if (isCurrentUser) {
          currentUserRanking = rankData
        }

        previousTotalPeriod = stat.totalPeriod
      })

      // If user is not in top 50, fetch their stats separately?
      // Current implementation only returns currentUserRanking if they are in top 50.
      // This logic remains unchanged for now to minimize risk.

      return c.json(
        {
          period: periodLabel,
          periodType: period,
          startDate,
          endDate,
          ranking,
          currentUserRanking,
          totalUsers: monthlyStats.length,
        },
        200
      )
    }
  )
