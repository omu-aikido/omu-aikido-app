import { createClerkClient } from "@clerk/backend"
import type { User } from "@clerk/backend"
import { arktypeValidator } from "@hono/arktype-validator"
import { getAuth } from "@hono/clerk-auth"
import { type } from "arktype"
import { Hono } from "hono"
import type { Context } from "hono"

import {
  createActivities,
  createActivity,
  deleteActivities,
  getActivitiesByDateRange,
  updateActivities,
} from "./lib/db/activity"
import { getUserMonthlyRank } from "./lib/db/ranking"
import { userActivitySummaryAndRecent } from "./lib/db/summary"
import { toApiUser } from "./lib/clerk"
import { getProfile } from "./lib/profile"

import { userProfileRequestSchema } from "@/type/account"
import { JoinedAtYearRange, getJST } from "@/app/lib/utils"

const ONBOARDING_MESSAGE = "プロファイル情報を設定してください。"

const getUserCacheControlForPath = (path: string): string | null => {
  if (path === "/profile") return "private, max-age=60"
  if (path === "/account") return "private, max-age=60"
  if (path === "/summary") return "private, max-age=30"
  if (path === "/ranking") return "private, max-age=60"
  if (path === "/activities") return "private, max-age=15"
  if (path === "/onboarding") return "private, max-age=10"
  return null
}

const createUserCacheKey = (requestUrl: string, userId: string): Request => {
  const url = new URL(requestUrl)
  url.searchParams.set("__uid", userId)
  return new Request(url.toString(), { method: "GET" })
}

const userEdgeCacheMiddleware = async (c: Context, next: () => Promise<void>) => {
  if (c.req.method !== "GET") {
    await next()
    return
  }

  const auth = getAuth(c)
  if (!auth || !auth.userId) {
    await next()
    return
  }

  const cacheControl = getUserCacheControlForPath(c.req.path)
  if (!cacheControl) {
    await next()
    return
  }

  const cache = (caches as unknown as { default: Cache }).default
  const cacheKey = createUserCacheKey(c.req.url, auth.userId)

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

const purgeUserCache = (c: Context, userId: string, paths: string[]) => {
  const cache = (caches as unknown as { default: Cache }).default
  const origin = new URL(c.req.url).origin
  for (const path of paths) {
    const key = createUserCacheKey(`${origin}/api/user${path}`, userId)
    c.executionCtx.waitUntil(cache.delete(key))
  }
}

const onboardingSetupSchema = type({
  year: "string & /^(b[1-4]|m[1-2]|d[1-2])$/",
  grade:
    "(string.numeric.parse |> -5 <= number.integer <= 5) | -5 <= number.integer <= 5",
  joinedAt: `(string.numeric.parse |> ${JoinedAtYearRange.min} <= number.integer <= ${JoinedAtYearRange.max}) | ${JoinedAtYearRange.min} <= number.integer <= ${JoinedAtYearRange.max}`,
  getGradeAt: "(string & /^\\d{4}-\\d{2}-\\d{2}$/ | null | '')?",
})

const activitiesQuerySchema = type({
  startDate: "(string & /^\\d{4}-\\d{2}-\\d{2}$/)?",
  endDate: "(string & /^\\d{4}-\\d{2}-\\d{2}$/)?",
})

const activityDateSchema = "string & /^\\d{4}-\\d{2}-\\d{2}$/"
const activityPeriodSchema = "(string.numeric.parse |> number > 0) | number > 0"

const activityUpsertSchema = type({
  id: "string",
  date: activityDateSchema,
  period: activityPeriodSchema,
})

const createActivitySchema = type({
  date: activityDateSchema,
  period: activityPeriodSchema,
})

const updateActivitiesSchema = type({
  added: activityUpsertSchema.array().optional(),
  updated: activityUpsertSchema.array().optional(),
  deleted: type("string").array().optional(),
})

const updateUserProfileSchema = userProfileRequestSchema

const updateAccountSchema = type({
  firstName: "string?",
  lastName: "string?",
  username: "string?",
  profileImage: "unknown?",
})

const normalizeGetGradeAt = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") {
    return null
  }
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return null
    const date = new Date(trimmed)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0]
    }
  }
  return null
}

const extractUnsafeProfile = (
  unsafeMetadata: unknown,
): {
  year: string
  grade: number
  joinedAt: number
  getGradeAt: string | null
} | null => {
  if (!unsafeMetadata || typeof unsafeMetadata !== "object") return null
  const metadata = unsafeMetadata as {
    year?: string
    grade?: number
    joinedAt?: number
    getGradeAt?: string | null
  }
  if (typeof metadata.year !== "string") return null
  if (typeof metadata.grade !== "number") return null
  if (
    typeof metadata.joinedAt !== "number" ||
    metadata.joinedAt < JoinedAtYearRange.min ||
    metadata.joinedAt > JoinedAtYearRange.max
  ) {
    return null
  }
  return {
    year: metadata.year,
    grade: metadata.grade,
    joinedAt: metadata.joinedAt,
    getGradeAt: normalizeGetGradeAt(metadata.getGradeAt),
  }
}

const migrateUnsafeMetadata = async ({
  clerkClient,
  userId,
  unsafeMetadata,
}: {
  clerkClient: ReturnType<typeof createClerkClient>
  userId: string
  unsafeMetadata: unknown
}) => {
  const parsed = extractUnsafeProfile(unsafeMetadata)
  if (!parsed) {
    return {
      status: "needs_profile_setup" as const,
      message: ONBOARDING_MESSAGE,
      requiresReSignup: true,
    }
  }
  const profileData = { ...parsed, role: "member" as const }
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: profileData,
    unsafeMetadata: {},
  })
  return { status: "migrated" as const }
}

export const userApp = new Hono<{ Bindings: Env }>()
  .use("*", userEdgeCacheMiddleware)
  .get("/profile", async c => {
    const profile = await getProfile(c)
    const auth = getAuth(c)
    if (!auth || !auth.userId) return c.json({ error: "Unauthorized" }, 401)
    if (!profile) return c.json({ error: "Profile not found" }, 404)
    return c.json({ profile: { id: auth.userId, ...profile } }, 200)
  })
  .patch(
    "/profile",
    arktypeValidator("json", updateUserProfileSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "Invalid profile payload" }, 400)
      }
    }),
    async c => {
      const auth = getAuth(c)
      if (!auth || !auth.userId) return c.json({ error: "Unauthorized" }, 401)
      const existingProfile = await getProfile(c)
      if (!existingProfile) return c.json({ error: ONBOARDING_MESSAGE }, 404)
      const parsed = c.req.valid("json")
      const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })
      const normalizedGetGradeAt = normalizeGetGradeAt(parsed.getGradeAt)
      const newMetadata: User = await clerkClient.users.updateUserMetadata(auth.userId, {
        publicMetadata: {
          grade: parsed.grade,
          getGradeAt: normalizedGetGradeAt,
          joinedAt: parsed.joinedAt,
          year: parsed.year,
          role: existingProfile.role,
        },
      })
      purgeUserCache(c, auth.userId, ["/profile", "/summary", "/ranking"])
      return c.json({ profile: { ...newMetadata.publicMetadata, id: auth.userId } }, 200)
    },
  )
  .get("/account", async c => {
    const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })
    const auth = getAuth(c)
    if (!auth || !auth.userId) return c.json({ error: "Unauthorized" }, 401)
    const user: User = await clerkClient.users.getUser(auth.userId)
    return c.json({ user: toApiUser(user) }, 200)
  })
  .patch(
    "/account",
    arktypeValidator("form", updateAccountSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "Invalid form payload" }, 400)
      }
    }),
    async c => {
      const auth = getAuth(c)
      if (!auth || !auth.userId) return c.json({ error: "Unauthorized" }, 401)
      const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })

      const body = c.req.valid("form")
      const normalizeFirstValue = (value: unknown) =>
        Array.isArray(value) ? value[0] : value

      const firstName = normalizeFirstValue(body.firstName)
      const lastName = normalizeFirstValue(body.lastName)
      const username = normalizeFirstValue(body.username)

      const updatePayload: { firstName?: string; lastName?: string; username?: string } =
        {}
      if (typeof firstName === "string" && firstName.trim()) {
        updatePayload.firstName = firstName.trim()
      }
      if (typeof lastName === "string" && lastName.trim()) {
        updatePayload.lastName = lastName.trim()
      }
      if (typeof username === "string" && username.trim()) {
        updatePayload.username = username.trim()
      }
      if (Object.keys(updatePayload).length > 0) {
        try {
          await clerkClient.users.updateUser(auth.userId, updatePayload)
        } catch (err) {
          return c.json(err, 500)
        }
      }

      const profileImage = normalizeFirstValue(body.profileImage)
      if (profileImage instanceof File && profileImage.size > 0) {
        try {
          await clerkClient.users.updateUserProfileImage(auth.userId, {
            file: profileImage,
          })
        } catch (err) {
          return c.json(err, 500)
        }
      }

      const user: User = await clerkClient.users.getUser(auth.userId)
      purgeUserCache(c, auth.userId, ["/account"])
      return c.json({ user: toApiUser(user) }, 200)
    },
  )
  .get("/summary", async c => {
    const auth = getAuth(c)
    if (!auth || !auth.userId) return c.json({ error: "Unauthorized" }, 401)
    const profile = await getProfile(c)
    if (!profile) return c.json({ error: "Profile not found" }, 404)
    const today = new Date()
    const summary = await userActivitySummaryAndRecent({
      userId: auth.userId,
      start: profile.getGradeAt
        ? getJST(new Date(`${profile.getGradeAt}T09:00:00.000Z`))
        : getJST(new Date(profile.joinedAt, 3, 1, 9)),
      end: getJST(
        new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 9),
      ),
      env: c.env,
    })
    return c.json({ summary }, 200)
  })
  .get("/ranking", async c => {
    const auth = getAuth(c)
    if (!auth || !auth.userId) return c.json({ error: "Unauthorized" }, 401)
    const profile = await getProfile(c)
    if (!profile) return c.json({ error: "Profile not found" }, 404)
    const ranking = await getUserMonthlyRank({ userId: auth.userId, env: c.env })
    return c.json({ ranking }, 200)
  })
  .get(
    "/activities",
    arktypeValidator("query", activitiesQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "Invalid query" }, 400)
      }
    }),
    async c => {
      const auth = getAuth(c)
      if (!auth || !auth.userId) return c.json({ error: "Unauthorized" }, 401)
      const { startDate, endDate } = c.req.valid("query")
      const activities = await getActivitiesByDateRange({
        userId: auth.userId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        env: c.env,
      })
      return c.json({ activities }, 200)
    },
  )
  .post(
    "/activities",
    arktypeValidator("json", createActivitySchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "Invalid activity payload" }, 400)
      }
    }),
    async c => {
      const auth = getAuth(c)
      if (!auth || !auth.userId) return c.json({ error: "Unauthorized" }, 401)
      const body = c.req.valid("json")
      await createActivity({
        userId: auth.userId,
        activity: { id: "", date: body.date, userId: auth.userId, period: body.period },
        env: c.env,
      })
      purgeUserCache(c, auth.userId, ["/summary", "/ranking"])
      return c.json({ success: true }, 200)
    },
  )
  .put(
    "/activities",
    arktypeValidator("json", updateActivitiesSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "Invalid activity payload" }, 400)
      }
    }),
    async c => {
      const auth = getAuth(c)
      if (!auth || !auth.userId) return c.json({ error: "Unauthorized" }, 401)
      const body = c.req.valid("json")
      const added = body.added ?? []
      const updated = body.updated ?? []
      const deleted = body.deleted ?? []

      if (added.length > 0) {
        await createActivities({
          userId: auth.userId,
          activities: added.map(act => ({
            id: act.id,
            date: act.date,
            period: act.period,
            userId: auth.userId,
          })),
          env: c.env,
        })
      }
      if (updated.length > 0) {
        await updateActivities({
          userId: auth.userId,
          activities: updated.map(act => ({
            id: act.id,
            date: act.date,
            period: act.period,
            userId: auth.userId,
          })),
          env: c.env,
        })
      }
      if (deleted.length > 0) {
        await deleteActivities({ userId: auth.userId, ids: deleted, env: c.env })
      }
      purgeUserCache(c, auth.userId, ["/summary", "/ranking"])
      return c.json({ success: true }, 200)
    },
  )
  .get("/onboarding", async c => {
    const auth = getAuth(c)
    if (!auth || !auth.userId) return c.json({ status: "unauthorized" }, 401)
    const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })
    try {
      const user: User = await clerkClient.users.getUser(auth.userId)
      if (
        user.publicMetadata &&
        typeof user.publicMetadata === "object" &&
        "role" in user.publicMetadata
      ) {
        return c.json({ status: "completed" }, 200)
      }
      const result = await migrateUnsafeMetadata({
        clerkClient,
        userId: auth.userId,
        unsafeMetadata: user.unsafeMetadata,
      })
      return c.json(result, 200)
    } catch {
      return c.json(
        {
          status: "error",
          error: "アカウントの設定に失敗しました。しばらくしてから再度お試しください。",
          requiresReSignup: false,
        },
        500,
      )
    }
  })
  .post("/onboarding/retry", async c => {
    const auth = getAuth(c)
    if (!auth || !auth.userId)
      return c.json({ success: false, error: "認証が必要です" }, 401)
    const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })
    try {
      const user: User = await clerkClient.users.getUser(auth.userId)
      if (
        user.publicMetadata &&
        typeof user.publicMetadata === "object" &&
        "role" in user.publicMetadata
      ) {
        return c.json({ success: true, redirect: "/" }, 200)
      }
      const result = await migrateUnsafeMetadata({
        clerkClient,
        userId: auth.userId,
        unsafeMetadata: user.unsafeMetadata,
      })
      if (result.status === "migrated") {
        return c.json({ success: true, redirect: "/" }, 200)
      }
      return c.json(
        {
          success: false,
          error: result.message ?? ONBOARDING_MESSAGE,
          requiresReSignup: result.requiresReSignup ?? false,
        },
        400,
      )
    } catch {
      return c.json(
        {
          success: false,
          error: "アカウントの設定に失敗しました。しばらくしてから再度お試しください。",
        },
        500,
      )
    }
  })
  .post(
    "/onboarding/setup",
    arktypeValidator("json", onboardingSetupSchema, (result, c) => {
      if (result.success) return
      const errors = Object.fromEntries(
        Object.entries(result.errors.byPath).map(([key, value]) => [
          key || "general",
          value?.message ?? "不正な値です",
        ]),
      )
      return c.json({ success: false, errors }, 400)
    }),
    async c => {
      const auth = getAuth(c)
      if (!auth || !auth.userId)
        return c.json({ success: false, error: "認証が必要です" }, 401)
      const data = c.req.valid("json")
      if (
        data.joinedAt < JoinedAtYearRange.min ||
        data.joinedAt > JoinedAtYearRange.max
      ) {
        return c.json(
          {
            success: false,
            errors: {
              joinedAt: `入部年度は${JoinedAtYearRange.min}年から${JoinedAtYearRange.max}年の間で入力してください`,
            },
          },
          400,
        )
      }
      const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })
      await clerkClient.users.updateUserMetadata(auth.userId, {
        publicMetadata: {
          year: data.year,
          grade: data.grade,
          joinedAt: data.joinedAt,
          getGradeAt: normalizeGetGradeAt(data.getGradeAt),
          role: "member",
        },
        unsafeMetadata: {},
      })
      purgeUserCache(c, auth.userId, [
        "/profile",
        "/account",
        "/summary",
        "/ranking",
        "/onboarding",
      ])
      return c.json({ success: true, redirect: "/" }, 200)
    },
  )

export type UserApp = typeof userApp
