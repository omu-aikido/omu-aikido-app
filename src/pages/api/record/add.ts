import type { APIRoute } from "astro"
import { createActivity } from "@/src/lib/query/activity"

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const auth = locals.auth()
    if (!auth.userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const {
      date,
      period,
      userId: requestUserId,
    } = (await request.json()) as {
      date: string
      period: string
      userId: string
    }

    if (!date || !period || !requestUserId) {
      return new Response("Missing required fields", { status: 400 })
    }

    // 認証されたユーザーIDとリクエストのuserIdが一致するか確認
    if (auth.userId !== requestUserId) {
      return new Response("Unauthorized: User ID mismatch", { status: 403 })
    }

    const result = await createActivity({
      userId: auth.userId,
      activity: {
        date: date,
        id: "", // バックエンドで生成されるのでなんでもOK
        userId: auth.userId,
        period: Number(period),
      },
    })

    if (!result || result.rowsAffected !== 1) {
      throw new Error("Failed to create activity")
    }

    return new Response("Record added successfully", { status: 200 })
  } catch (error) {
    console.error("Error adding record:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
