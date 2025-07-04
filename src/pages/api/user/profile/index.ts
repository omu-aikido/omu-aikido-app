import type { APIRoute } from "astro"
import { createProfile, updateProfile, getProfile } from "@/src/lib/query/profile"
import { createProfileInputSchema, updateProfileInputSchema } from "@/src/zod"

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const auth = locals.auth()
    if (!auth.userId) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
      })
    }

    const input = await request.json()
    const parsedInput = createProfileInputSchema.safeParse(input)

    if (!parsedInput.success) {
      return new Response(JSON.stringify({ success: false, error: "Invalid input" }), {
        status: 400,
      })
    }

    const data = parsedInput.data

    if (auth.userId !== data.id) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: User ID mismatch" }),
        { status: 403 },
      )
    }

    const result = await createProfile(data)

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

export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
    const auth = locals.auth()
    if (!auth.userId) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
      })
    }

    const input = await request.json()
    const parsedInput = updateProfileInputSchema.safeParse(input)

    if (!parsedInput.success) {
      return new Response(JSON.stringify({ success: false, error: "Invalid input" }), {
        status: 400,
      })
    }

    const data = parsedInput.data

    if (auth.userId !== data.id) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: User ID mismatch" }),
        { status: 403 },
      )
    }

    const existingProfile = await getProfile({ userId: data.id })
    if (existingProfile instanceof Response) {
      return new Response(JSON.stringify({ success: false, error: "Profile not found" }), {
        status: 404,
      })
    }

    const result = await updateProfile(data)

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
