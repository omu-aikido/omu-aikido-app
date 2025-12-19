import { createClerkClient } from "@clerk/backend"
import { arktypeValidator } from "@hono/arktype-validator"
import { getAuth } from "@hono/clerk-auth"
import { ArkErrors, type } from "arktype"
import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm"
import { Hono } from "hono"
import type { Context } from "hono"

import { createDb } from "./lib/db/drizzle"
import { getProfile as getCurrentProfile } from "./lib/profile"

import { coerceProfileMetadata, publicMetadataProfileSchema } from "@/type/account"
import { Role } from "@/type/role"
import { activity } from "@/app/db/schema"
import { formatDateToJSTString, getJST, timeForNextGrade } from "@/app/lib/utils"

const clerkUserLimit = 500

const getAdminCacheControlForPath = (path: string): string | null => {
  if (path === "/accounts") return "public, max-age=60"
  if (path === "/norms") return "public, max-age=60"
  if (path.startsWith("/users/")) return "public, max-age=30"
  return null
}

const adminEdgeCacheMiddleware = async (c: Context, next: () => Promise<void>) => {
  if (c.req.method !== "GET") {
    await next()
    return
  }

  const cacheControl = getAdminCacheControlForPath(c.req.path)
  if (!cacheControl) {
    await next()
    return
  }

  const cache = (caches as unknown as { default: Cache }).default
  const cacheKey = new Request(new URL(c.req.url).toString(), { method: "GET" })

  const cached = await cache.match(cacheKey)
  if (cached) {
    return cached
  }

  await next()

  const response = c.res
  if (!response.ok) return
  if (response.headers.has("Set-Cookie")) return

  response.headers.set("Cache-Control", cacheControl)
  c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()))
}

const adminProfileUpdateSchema = type({
  year: "string",
  grade:
    "(string.numeric.parse |> -5 <= number.integer <= 5) | -5 <= number.integer <= 5",
  role: Role.type(),
  joinedAt:
    "(string.numeric.parse |> 0 <= number.integer <= 9999) | 0 <= number.integer <= 9999",
  getGradeAt: "(string & /^\\d{4}-\\d{2}-\\d{2}$/ | null | '')?",
})

const accountsQuerySchema = type({ query: "(string & /^.{0,100}$/)?" })

const userIdParamSchema = type({ userId: "string & /^\\S+$/" })

const userActivitiesQuerySchema = type({
  page: "((string.numeric.parse |> number.integer >= 1) | number.integer >= 1)?",
  limit:
    "((string.numeric.parse |> 1 <= number.integer <= 100) | 1 <= number.integer <= 100)?",
})

const ensureAdminMiddleware = async (c: Context, next: () => Promise<void>) => {
  const auth = getAuth(c)
  if (!auth || !auth.userId) {
    c.status(401)
    return c.json({ error: "Unauthorized" })
  }
  const profile = await getCurrentProfile(c)
  const role = profile?.role ? Role.fromString(profile.role) : null
  if (!role || !role.isManagement()) {
    c.status(403)
    return c.json({ error: "Forbidden" })
  }
  await next()
}

const getMonthlyRanking = async (env: Env) => {
  const db = createDb(env)
  const now = new Date()
  const startDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1)
  const endDate = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59)
  const startDateStr = startDate.toISOString().split("T")[0]
  const endDateStr = endDate.toISOString().split("T")[0]

  const result = await db
    .select({ userId: activity.userId, total: sql<number>`SUM(${activity.period})` })
    .from(activity)
    .where(and(gte(activity.date, startDateStr), lte(activity.date, endDateStr)))
    .groupBy(activity.userId)
    .orderBy(desc(sql<number>`SUM(${activity.period})`))
    .limit(5)

  return result
}

const getUsersNorm = async (
  env: Env,
  users: { id: string; publicMetadata: unknown }[],
) => {
  const db = createDb(env)
  const parsedProfiles = users
    .map(user => {
      const parsed = publicMetadataProfileSchema(
        coerceProfileMetadata(user.publicMetadata),
      )
      if (parsed instanceof ArkErrors) return null
      return { id: user.id, profile: parsed }
    })
    .filter(
      (
        entry,
      ): entry is { id: string; profile: typeof publicMetadataProfileSchema.infer } =>
        Boolean(entry),
    )

  if (parsedProfiles.length === 0) {
    return []
  }

  const conditions = parsedProfiles.map(({ id, profile }) => {
    if (profile.getGradeAt) {
      return and(eq(activity.userId, id), gte(activity.date, profile.getGradeAt))
    }
    return eq(activity.userId, id)
  })

  const activityData = await db
    .select()
    .from(activity)
    .where(or(...conditions))

  return parsedProfiles.map(({ id, profile }) => {
    const userActivities = activityData.filter(a => a.userId === id)
    const totalPeriod = userActivities.reduce((sum, a) => sum + a.period, 0)
    const current = totalPeriod / 1.5
    const required = timeForNextGrade(profile.grade)
    return {
      userId: id,
      current,
      required,
      grade: profile.grade,
      lastPromotionDate: profile.getGradeAt,
    }
  })
}

const getUserActivitySummary = async (env: Env, userId: string) => {
  const db = createDb(env)
  const activities = await db
    .select()
    .from(activity)
    .where(eq(activity.userId, userId))
    .orderBy(desc(activity.date))
  return activities
}

export const adminApp = new Hono<{ Bindings: Env }>()
  .use("*", ensureAdminMiddleware)
  .use("*", adminEdgeCacheMiddleware)
  .get(
    "/accounts",
    arktypeValidator("query", accountsQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "Invalid query" }, 400)
      }
    }),
    async c => {
      const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })
      const { query } = c.req.valid("query")
      const clerkUsers = await clerkClient.users.getUserList({
        limit: clerkUserLimit,
        query: query ?? "",
        orderBy: "created_at",
      })

      const ranking = await getMonthlyRanking(c.env)
      return c.json({ users: clerkUsers.data, query: query ?? "", ranking })
    },
  )
  .get(
    "/norms",
    arktypeValidator("query", accountsQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "Invalid query" }, 400)
      }
    }),
    async c => {
      const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })
      const { query } = c.req.valid("query")
      const clerkUsers = await clerkClient.users.getUserList({
        limit: clerkUserLimit,
        query: query ?? "",
        orderBy: "created_at",
      })
      const norms = await getUsersNorm(c.env, clerkUsers.data)
      return c.json({ users: clerkUsers.data, norms, search: query ?? "" })
    },
  )
  .get(
    "/users/:userId",
    arktypeValidator("param", userIdParamSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "User ID is required" }, 400)
      }
    }),
    arktypeValidator("query", userActivitiesQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "Invalid query" }, 400)
      }
    }),
    async c => {
      const { userId } = c.req.valid("param")
      const { page = 1, limit = 10 } = c.req.valid("query")

      const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })
      try {
        const user = await clerkClient.users.getUser(userId)
        const profileParse = publicMetadataProfileSchema(
          coerceProfileMetadata(user.publicMetadata),
        )
        const profile =
          profileParse instanceof ArkErrors ? null : { ...profileParse, id: user.id }

        const allActivities = await getUserActivitySummary(c.env, userId)
        const totalActivitiesCount = allActivities.length
        const activities = allActivities.slice((page - 1) * limit, page * limit)
        const totalHours = allActivities.reduce((sum, a) => sum + (a.period || 0), 0)
        const totalEntries = totalActivitiesCount
        const totalDays = new Set(allActivities.map(a => a.date)).size

        const getGradeAtDate = profile?.getGradeAt
          ? new Date(profile.getGradeAt)
          : getJST(new Date(profile?.joinedAt ?? new Date().getFullYear(), 2, 1))

        const trainsAfterGrade = allActivities
          .filter(a => {
            const date = new Date(a.date)
            return date > getGradeAtDate
          })
          .map(a => a.period)
          .reduce((sum, period) => sum + period, 0)

        const trainCount = Math.floor(
          allActivities.map(a => a.period).reduce((sum, val) => sum + val, 0) / 1.5,
        )
        const doneTrain = Math.floor(trainsAfterGrade / 1.5)

        return c.json({
          user,
          profile,
          activities,
          trainCount,
          doneTrain,
          page,
          totalActivitiesCount,
          limit,
          totalDays,
          totalEntries,
          totalHours,
        })
      } catch {
        return c.json({ error: "User not found" }, 404)
      }
    },
  )
  .patch(
    "/users/:userId/profile",
    arktypeValidator("param", userIdParamSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "ユーザーIDが必要です" }, 400)
      }
    }),
    arktypeValidator("json", adminProfileUpdateSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "無効な入力です" }, 400)
      }
    }),
    async c => {
      const auth = getAuth(c)
      if (!auth || !auth.userId) {
        return c.json({ error: "認証されていません" }, 401)
      }
      const { userId: targetUserId } = c.req.valid("param")
      const parsed = c.req.valid("json")
      const { year, grade, role, joinedAt } = parsed
      if (Number.isNaN(grade) || Number.isNaN(joinedAt)) {
        return c.json({ error: "数値項目の形式が正しくありません" }, 400)
      }
      const currentYear = new Date().getFullYear()
      const minJoinedAt = currentYear - 4
      const maxJoinedAt = currentYear + 1
      if (joinedAt < minJoinedAt || joinedAt > maxJoinedAt) {
        return c.json(
          {
            error: `入部年度は${minJoinedAt}年から${maxJoinedAt}年の間で入力してください`,
          },
          400,
        )
      }

      const adminProfile = await getCurrentProfile(c)
      const adminRole = adminProfile?.role ? Role.fromString(adminProfile.role) : null
      if (!adminRole || !adminRole.isManagement()) {
        return c.json({ error: "権限が不足しています" }, 403)
      }

      const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })
      const targetUser = await clerkClient.users.getUser(targetUserId)
      const targetProfileParsed = publicMetadataProfileSchema(
        coerceProfileMetadata(targetUser.publicMetadata),
      )
      const targetCurrentRole =
        targetProfileParsed instanceof ArkErrors
          ? Role.MEMBER
          : (Role.fromString(targetProfileParsed.role ?? "member") ?? Role.MEMBER)
      if (targetCurrentRole && Role.compare(adminRole.role, targetCurrentRole.role) > 0) {
        return c.json({ error: "現在の権限より上書きできません" }, 403)
      }

      const requestedRole = Role.fromString(role)
      if (!requestedRole || Role.compare(adminRole.role, requestedRole.role) > 0) {
        return c.json({ error: "権限が不足しています" }, 403)
      }

      const normalizedGetGradeAt =
        parsed.getGradeAt && typeof parsed.getGradeAt === "string"
          ? new Date(parsed.getGradeAt)
          : null
      if (normalizedGetGradeAt && isNaN(normalizedGetGradeAt.getTime())) {
        return c.json({ error: "級段位取得日の形式が正しくありません" }, 400)
      }

      const updatedMetadata = {
        grade,
        getGradeAt: normalizedGetGradeAt
          ? formatDateToJSTString(normalizedGetGradeAt)
          : null,
        joinedAt,
        year,
        role,
      }

      await clerkClient.users.updateUserMetadata(targetUserId, {
        publicMetadata: updatedMetadata,
      })

      return c.json({ success: true }, 200)
    },
  )

export type AdminApp = typeof adminApp
