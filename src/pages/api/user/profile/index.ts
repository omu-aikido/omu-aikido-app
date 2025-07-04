import type { APIRoute } from "astro"
import { createProfile, updateProfile, getProfile } from "@/src/lib/query/profile"
import { profile as profileSchema } from "@/src/zod"

const createProfileSchema = profileSchema.omit({ role: true })
const updateProfileSchema = profileSchema.omit({ role: true })

// プロファイル作成または更新（POST）
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const auth = locals.auth()
    if (!auth.userId) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
      })
    }

    const input = await request.json()
    const parsedInput = createProfileSchema.safeParse(input)

    if (!parsedInput.success) {
      return new Response(JSON.stringify({ success: false, error: "Invalid input" }), {
        status: 400,
      })
    }

    const { id, grade, getGradeAt, joinedAt, year } = parsedInput.data

    if (auth.userId !== id) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: User ID mismatch" }),
        { status: 403 },
      )
    }

    const result = await createProfile({
      id: id,
      grade: Number(grade),
      getGradeAt: getGradeAt ? new Date(getGradeAt) : new Date(),
      joinedAt: Number(joinedAt),
      year: year,
    })

    if (result instanceof Response && result.status !== 200) {
      const errorText = await result.text()
      return new Response(JSON.stringify({ success: false, error: errorText }), {
        status: result.status,
      })
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 201,
    })
  } catch (error) {
    console.error("Error creating/updating profile:", error)
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
      status: 500,
    })
  }
}

// プロファイル更新（PATCH）
export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
    console.log("PATCH")
    const auth = locals.auth()
    if (!auth.userId) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
      })
    }

    const input = await request.json()
    const parsedInput = updateProfileSchema.safeParse(input)

    if (!parsedInput.success) {
      return new Response(JSON.stringify({ success: false, error: "Invalid input" }), {
        status: 400,
      })
    }

    const { id, grade, getGradeAt, joinedAt, year } = parsedInput.data

    if (auth.userId !== id) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: User ID mismatch" }),
        { status: 403 },
      )
    }

    // 既存のプロファイル情報を取得してroleを取得
    console.log("fetchin current profile")
    const existingProfile = await getProfile({ userId: id })
    if (existingProfile instanceof Response) {
      return new Response(JSON.stringify({ success: false, error: "Profile not found" }), {
        status: 404,
      })
    }

    const result = await updateProfile({
      id: id,
      grade: Number(grade),
      getGradeAt: getGradeAt ? new Date(getGradeAt) : new Date(),
      joinedAt: Number(joinedAt),
      year: year,
      role: existingProfile.role, // 既存のプロファイルからroleを取得
    })

    if (result instanceof Response && result.status !== 200) {
      const errorText = await result.text()
      return new Response(JSON.stringify({ success: false, error: errorText }), {
        status: result.status,
      })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error("Error updating profile:", error)
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
      status: 500,
    })
  }
}
