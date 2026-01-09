import type { Context } from 'hono'

import * as drizzleOrm from 'drizzle-orm'

import type { RankingEntry } from '@/share/types/records'

import { dbClient } from '@/server/db/drizzle'
import { activity } from '@/server/db/schema'

const CACHE_TTL = 300 // 5 minutes

type RawRankingEntry = {
  userId: string
  totalPeriod: number
}

type PeriodParams = {
  year: number
  month: number
  period: 'monthly' | 'annual' | 'fiscal'
}

type PeriodRange = {
  startDate: string
  endDate: string
  periodLabel: string
}

export const calculatePeriodRange = (params: PeriodParams): PeriodRange => {
  const { year, month, period } = params

  if (period === 'annual') {
    return {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      periodLabel: `${year}年`,
    }
  }

  if (period === 'fiscal') {
    return {
      startDate: `${year}-04-01`,
      endDate: `${year + 1}-03-31`,
      periodLabel: `${year}年度`,
    }
  }

  // monthly
  const monthStart = new Date(Date.UTC(year, month - 1, 1))
  const monthEnd = new Date(Date.UTC(year, month, 0))
  return {
    startDate: monthStart.toISOString().split('T')[0] || '',
    endDate: monthEnd.toISOString().split('T')[0] || '',
    periodLabel: new Date(year, month - 1, 1).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
    }),
  }
}

const buildCacheKey = (startDate: string, endDate: string): string => {
  // Cache API requires a valid URL format
  return `https://cache.internal/ranking/${startDate}/${endDate}`
}

export const getRankingData = async (
  c: Context<{ Bindings: Env }>,
  startDate: string,
  endDate: string
): Promise<RawRankingEntry[]> => {
  const cache = (caches as unknown as { default: Cache }).default
  const cacheKey = buildCacheKey(startDate, endDate)

  const cached = await cache.match(cacheKey)
  if (cached) {
    return (await cached.json()) as RawRankingEntry[]
  }

  const db = dbClient(c.env)
  const rawData = await db
    .select({
      userId: activity.userId,
      totalPeriod: drizzleOrm.sql<number>`COALESCE(SUM(${activity.period}), 0)`,
    })
    .from(activity)
    .where(drizzleOrm.and(drizzleOrm.gte(activity.date, startDate), drizzleOrm.lte(activity.date, endDate)))
    .groupBy(activity.userId)
    .orderBy(drizzleOrm.desc(drizzleOrm.sql<number>`COALESCE(SUM(${activity.period}), 0)`))
    .limit(50)

  const response = new Response(JSON.stringify(rawData), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CACHE_TTL}`,
    },
  })

  c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()))

  return rawData
}

export const maskRankingData = (rawData: RawRankingEntry[], currentUserId: string): RankingEntry[] => {
  let currentRank = 1
  let previousTotalPeriod: number | null = null

  return rawData.map((entry, index) => {
    if (previousTotalPeriod !== null && entry.totalPeriod !== previousTotalPeriod) {
      currentRank = index + 1
    }

    const isCurrentUser = entry.userId === currentUserId

    previousTotalPeriod = entry.totalPeriod

    return {
      rank: currentRank,
      userName: isCurrentUser ? 'あなた' : '匿名',
      isCurrentUser,
      totalPeriod: entry.totalPeriod,
      practiceCount: Math.floor(entry.totalPeriod / 1.5),
    }
  })
}

export const invalidateRankingCache = async (dateStr: string) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const keys: string[] = []

  // Monthly
  const monthly = calculatePeriodRange({ year, month, period: 'monthly' })
  keys.push(buildCacheKey(monthly.startDate, monthly.endDate))

  // Annual
  const annual = calculatePeriodRange({ year, month, period: 'annual' })
  keys.push(buildCacheKey(annual.startDate, annual.endDate))

  // Fiscal
  // Fiscal year starts in April. If month is Jan-Mar, fiscal year is previous year.
  const fiscalYear = month < 4 ? year - 1 : year
  const fiscal = calculatePeriodRange({ year: fiscalYear, month, period: 'fiscal' })
  keys.push(buildCacheKey(fiscal.startDate, fiscal.endDate))

  const cache = (caches as unknown as { default: Cache }).default
  await Promise.all(keys.map((key) => cache.delete(key)))
}
