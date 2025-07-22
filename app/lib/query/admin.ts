import { createClerkClient, type User } from "@clerk/react-router/api.server"

import { getProfile, getRole } from "~/lib/query/profile"
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
    ? input.newProfile.getGradeAt.toISOString()
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
