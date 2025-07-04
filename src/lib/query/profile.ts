import { Role } from "@/src/zod"
import { profile } from "@/src/zod"
import type { Profile } from "@/src/type"
import { createClerkClient, type User } from "@clerk/astro/server"

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

    try {
      const parsedProfile = profile.safeParse(user.publicMetadata)
      if (!parsedProfile.success) {
        return new Response("Something Went Wrong with Loading Profile", {
          status: 303,
          headers: {
            Location: "/account/recovery",
          },
        })
      }
      return parsedProfile.data as Profile
    } catch (error) {
      return new Response("Something Went Wrong with Loading Profile", {
        status: 303,
        headers: {
          Location: "/account/recovery",
        },
        statusText: `${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  } catch (error) {
    return new Response("Missing Correct User Schema", {
      status: 422,
      headers: {
        "Content-Type": "application/json",
      },
      statusText: `${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}

export async function createProfile(input: {
  id: string
  grade: number
  getGradeAt: Date
  joinedAt: number
  year: string
}): Promise<Response> {
  const clerkClient = createClerkClient({
    secretKey: import.meta.env.CLERK_SECRET_KEY,
  })

  // 既に有効なプロフィールがある場合はエラーとする。
  const existingProfile = await getProfile({ userId: input.id })
  if (!(existingProfile instanceof Response)) {
    return new Response("User already exists.", {
      status: 409, // Conflict
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  const getGradeAtString = new Date(input.getGradeAt).toISOString()

  try {
    const user = await clerkClient.users.updateUserMetadata(input.id, {
      publicMetadata: profile.parse({
        id: input.id,
        grade: input.grade,
        role: "member",
        getGradeAt: getGradeAtString,
        joinedAt: input.joinedAt,
        year: input.year,
      }),
    })

    console.log(user.publicMetadata)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    return new Response("Failed to create profile", {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      statusText: `${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}

export async function updateProfile(input: {
  id: string
  grade: number
  getGradeAt: Date
  joinedAt: number
  year: string
  role: string
}): Promise<Response> {
  const clerkClient = createClerkClient({
    secretKey: import.meta.env.CLERK_SECRET_KEY,
  })

  const year = new Date().getFullYear()
  const getGradeAtValidate = input.getGradeAt ? input.getGradeAt : new Date(year, 3, 1, 0, 0, 0, 0)
  const getGradeAtString = new Date(getGradeAtValidate).toISOString()

  try {
    await clerkClient.users.updateUserMetadata(input.id, {
      publicMetadata: profile.safeParse({
        grade: input.grade,
        getGradeAt: getGradeAtString,
        joinedAt: input.joinedAt,
        year: input.year,
        role: input.role,
      }).data,
      privateMetadata: {},
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    return new Response("Failed to update profile", {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      statusText: `${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}

export function getRole(input: { profile: Profile }): Role | null {
  return Role.fromString(input.profile.role)
}
