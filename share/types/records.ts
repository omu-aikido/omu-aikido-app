import { type } from 'arktype'

import { insertActivitySchema } from '@/server/db/schema'

export const recordQuerySchema = type({
  'userId?': /^user_[\w]{27}$/,
  'startDate?': /^\d{4}-\d{2}-\d{2}$/,
  'endDate?': /^\d{4}-\d{2}-\d{2}$/,
})

export const createActivitySchema = insertActivitySchema.pick('date', 'period')

export const deleteActivitiesSchema = type({ ids: 'string[]' })

export const paginationSchema = type({
  page: 'number.integer >= 1',
  'perPage?': '1 <= number.integer <= 100',
})

export const rankingQuerySchema = type({
  'year?': '1900 <= number.integer < 2100',
  'month?': '1 <= number.integer <= 12',
  'period?': "'monthly' | 'annual' | 'fiscal'",
})

// Ranking Types
export type RankingEntry = {
  rank: number
  userName: string
  isCurrentUser: boolean
  totalPeriod: number
  practiceCount: number
}

export type RankingResponse = {
  period: string
  periodType: string
  startDate: string
  endDate: string
  ranking: RankingEntry[]
  currentUserRanking: RankingEntry | null
  totalUsers: number
}

