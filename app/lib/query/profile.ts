import { createClerkClient, type User } from "@clerk/react-router/api.server"
import type { z } from "zod"

import {
  publicMetadataProfileSchema,
  Role,
  type updateProfileInputSchema,
} from "~/lib/zod"
import type { Profile } from "~/type"

// Env型は worker-configuration.d.ts で定義されているグローバル型を使用

export async function getAccount(input: {
  userId: string | undefined | null
  env: Env
}): Promise<User | null> {
  const clerkClient = createClerkClient({ secretKey: input.env.CLERK_SECRET_KEY })

  if (!input.userId) {
    return null
  }

  const user = await clerkClient.users.getUser(input.userId)

  if (Object.keys(user.publicMetadata).length === 0) {
    return null
  }

  return user
}

// Validate user ID input and return the profile.
export async function getProfile(input: {
  userId: string | null
  env: Env
}): Promise<Profile | null> {
  const clerkClient = createClerkClient({ secretKey: input.env.CLERK_SECRET_KEY })

  if (!input.userId) return null

  try {
    const user = await clerkClient.users.getUser(input.userId)

    if (Object.keys(user.publicMetadata).length === 0) {
      return null
    }

    const parsedProfile = publicMetadataProfileSchema.safeParse(user.publicMetadata)
    if (!parsedProfile.success) {
      return null
    }

    // Profile型に変換
    return { ...parsedProfile.data, id: user.id } as Profile
  } catch {
    return null
  }
}

export async function updateProfile(
  input: z.infer<typeof updateProfileInputSchema>,
  env: Env,
): Promise<Response> {
  const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })

  try {
    // 既存profile取得
    const existingProfile = await getProfile({ userId: input.id, env })
    if (!existingProfile) {
      return new Response("Profile not found", {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { id, ...metadata } = input
    // 既存データとマージ
    const updatedMetadata = {
      grade: metadata.grade ?? existingProfile.grade,
      getGradeAt: metadata.getGradeAt ?? existingProfile.getGradeAt,
      joinedAt: metadata.joinedAt ?? existingProfile.joinedAt,
      year: metadata.year ?? existingProfile.year,
      role: metadata.role ?? existingProfile.role,
    }

    await clerkClient.users.updateUserMetadata(id, { publicMetadata: updatedMetadata })
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response("Failed to update profile", {
      status: 500,
      headers: { "Content-Type": "application/json" },
      statusText: `${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}

export function getRole(input: { profile: Profile }): Role | null {
  return Role.fromString(input.profile.role)
}
