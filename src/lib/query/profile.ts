import { Role, createProfileInputSchema, updateProfileInputSchema } from "@/src/zod"
import { publicMetadataProfileSchema } from "@/src/zod"
import type { Profile } from "@/src/type"
import { createClerkClient, type User } from "@clerk/astro/server"
import { z } from "zod"

export async function getAccount(input: {
  userId: string | undefined | null
}): Promise<User | Response> {
  const clerkClient = createClerkClient({
    secretKey: import.meta.env.CLERK_SECRET_KEY,
  })

  if (!input.userId) {
    return new Response("Missing User ID", {
      status: 400,
    })
  }

  const user = await clerkClient.users.getUser(input.userId)

  if (Object.keys(user.publicMetadata).length === 0) {
    return new Response("No Profile Found", {
      status: 404,
    })
  }

  return user
}

// Validate user ID input and return the profile.
export async function getProfile(input: { userId: string }): Promise<Profile | Response> {
  const clerkClient = createClerkClient({
    secretKey: import.meta.env.CLERK_SECRET_KEY,
  })

  try {
    const user = await clerkClient.users.getUser(input.userId)

    if (Object.keys(user.publicMetadata).length === 0) {
      return new Response("No Profile Found", {
        status: 404,
      })
    }

    const parsedProfile = publicMetadataProfileSchema.safeParse(user.publicMetadata)
    if (!parsedProfile.success) {
      return new Response("Something Went Wrong with Loading Profile", {
        status: 303,
        headers: {
          Location: "/account/recovery",
        },
      })
    }

    // Profile型に変換
    return {
      ...parsedProfile.data,
      id: user.id,
    } as Profile
  } catch (error) {
    const status = error instanceof Error ? 422 : 303
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (status === 303) {
      headers.Location = "/account/recovery"
    }

    return new Response("Something Went Wrong with Loading Profile", {
      status,
      headers,
      statusText: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function createProfile(
  input: z.infer<typeof createProfileInputSchema>,
): Promise<Response> {
  const clerkClient = createClerkClient({
    secretKey: import.meta.env.CLERK_SECRET_KEY,
  })

  // 既に有効なプロフィールがある場合はエラーとする。
  const existingProfile = await getProfile({ userId: input.id })
  if (!(existingProfile instanceof Response)) {
    return new Response("User already exists.", {
      status: 409,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const { id, ...metadata } = input
    const publicMetadata = {
      ...metadata,
      role: "member" as const,
    }
    await clerkClient.users.updateUserMetadata(id, { publicMetadata })
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response("Failed to create profile", {
      status: 500,
      headers: { "Content-Type": "application/json" },
      statusText: `${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}

export async function updateProfile(
  input: z.infer<typeof updateProfileInputSchema>,
): Promise<Response> {
  const clerkClient = createClerkClient({
    secretKey: import.meta.env.CLERK_SECRET_KEY,
  })

  try {
    // 既存profile取得
    const existingProfile = await getProfile({ userId: input.id })
    if (existingProfile instanceof Response) {
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
