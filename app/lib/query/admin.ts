import { createClerkClient, type User } from "@clerk/react-router/server"
import { and, eq, gte, or } from "drizzle-orm"

import { activity } from "../../db/schema"
import { createDb } from "../drizzle"

import { getProfile, getRole } from "~/lib/query/profile"
import { timeForNextGrade } from "~/lib/utils"
import { Role } from "~/lib/zod"

export async function updateProfile(input: {
  applicateBy: string
  newProfile: {
    id: string
    grade: number
    getGradeAt: Date | undefined
    joinedAt: number
    year: string
    role: string
  }
  env: Env
}): Promise<User> {
  const clerkClient = createClerkClient({ secretKey: input.env.CLERK_SECRET_KEY })
  const applicaterProfile = await getProfile({
    userId: input.applicateBy,
    env: input.env,
  })

  if (!applicaterProfile) throw new Error("Applicater profile not found")

  const applicated = getRole({ profile: applicaterProfile })
  if (!applicated || !applicated.isManagement())
    throw new Error("Method Not Allow: Account Role")

  const current = await getProfile({ userId: input.newProfile.id, env: input.env })
  const curRole = Role.fromString(current ? current.role : "member")

  if (curRole && Role.compare(applicated.role, curRole.role) > 0) {
    throw new Error("Method Not Allow")
  }

  const targetRole = Role.fromString(input.newProfile.role)

  if (!targetRole || Role.compare(applicated.role, targetRole.role) > 0)
    throw new Error("Method Not Allowed: Not Enough")
  const getGradeAtValidate = input.newProfile.getGradeAt
    ? input.newProfile.getGradeAt.toISOString().split("T")[0]
    : ""

  const updatedMetadata = {
    grade: input.newProfile.grade,
    getGradeAt: getGradeAtValidate,
    joinedAt: input.newProfile.joinedAt,
    year: input.newProfile.year,
    role: input.newProfile.role,
  }

  try {
    await clerkClient.users.updateUserMetadata(input.newProfile.id, {
      publicMetadata: updatedMetadata,
    })
    return await clerkClient.users.getUser(input.newProfile.id)
  } catch {
    throw new Error("Failed to update profile")
  }
}

export async function getUsersNorm(input: { userIds: string[]; env: Env }) {
  const db = createDb(input.env)

  const profiles = await Promise.all(
    input.userIds.map(userId => getProfile({ userId, env: input.env })),
  )

  const validProfiles = profiles.filter((p): p is NonNullable<typeof p> => p !== null)

  if (validProfiles.length === 0) {
    return []
  }

  const conditions = validProfiles.map(profile => {
    if (profile.getGradeAt) {
      return and(eq(activity.userId, profile.id), gte(activity.date, profile.getGradeAt))
    }
    return eq(activity.userId, profile.id)
  })

  const activityData = await db
    .select()
    .from(activity)
    .where(or(...conditions))

  const results = validProfiles.map(profile => {
    const userActivities = activityData.filter(a => a.userId === profile.id)
    const totalPeriod = userActivities.reduce((sum, a) => sum + a.period, 0)
    const current = totalPeriod / 1.5
    const required = timeForNextGrade(profile.grade)

    return {
      userId: profile.id,
      current,
      required,
      grade: profile.grade,
      lastPromotionDate: profile.getGradeAt,
    }
  })

  return results
}
