import type { APIRoute } from "astro"
import {
  createActivity,
  updateActivity,
  deleteActivity,
  inputActivity,
} from "@/src/lib/query/activity"
import { z } from "astro/zod"

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const auth = locals.auth()
    if (!auth.userId) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    let input: { date: string; period: string; userId: string }

    // Check if content-type is multipart/form-data
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await request.formData()
      input = {
        date: formData.get("date")?.toString() || "",
        period: formData.get("period")?.toString() || "",
        userId: formData.get("userId")?.toString() || "",
      }
    } else {
      // Assume JSON
      input = (await request.json()) as {
        date: string
        period: string
        userId: string
      }
    }

    // Zod validation
    const schema = z.object({
      userId: z.string(),
      date: z.string(),
      period: z.string(),
    })

    const validationResult = schema.safeParse(input)

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: validationResult.error.errors[0].message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const { date, period, userId: requestUserId } = validationResult.data

    // 認証されたユーザーIDとリクエストのuserIdが一致するか確認
    if (auth.userId !== requestUserId) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: User ID mismatch" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const actData: typeof inputActivity = {
      date: date,
      id: "", // バックエンドで生成されるのでなんでもOK
      userId: auth.userId,
      period: Number(period),
    }

    const result = await createActivity({
      userId: auth.userId,
      activity: actData,
    })

    // updateActivityはvoidを返すため、rowsAffectedはチェックしない
    // 成功したと仮定するか、別の方法で成功を確認する必要がある
    // // updateActivityはvoidを返すため、rowsAffectedはチェックしない
    // 成功したと仮定するか、別の方法で成功を確認する必要がある
    // if (!result || result.rowsAffected !== 1) {
    //   throw new Error("Failed to create activity")
    // }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error adding record:", error)
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
    const auth = locals.auth()
    if (!auth.userId) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const input = await request.json()

    const schema = z.object({
      id: z.string(),
      date: z.string().optional(),
      period: z.string().optional(),
      userId: z.string(),
    })

    const validationResult = schema.safeParse(input)

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: validationResult.error.errors[0].message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const { id, date, period, userId: requestUserId } = validationResult.data

    if (auth.userId !== requestUserId) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: User ID mismatch" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const updateData: Partial<typeof inputActivity> = {
      id: id,
      userId: auth.userId,
    }
    if (date) updateData.date = date
    if (period) updateData.period = Number(period)

    const result = await updateActivity({
      userId: auth.userId,
      activityId: id,
      activityData: updateData,
    })

    // updateActivityはvoidを返すため、rowsAffectedはチェックしない
    // 成功したと仮定するか、別の方法で成功を確認する必要がある
    // // updateActivityはvoidを返すため、rowsAffectedはチェックしない
    // 成功したと仮定するか、別の方法で成功を確認する必要がある
    // if (!result || result.rowsAffected !== 1) {
    //   throw new Error("Failed to update activity")
    // }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error updating record:", error)
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const auth = locals.auth()
    if (!auth.userId) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const input = await request.json()

    const schema = z.object({
      id: z.string(),
      userId: z.string(),
    })

    const validationResult = schema.safeParse(input)

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: validationResult.error.errors[0].message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const { id, userId: requestUserId } = validationResult.data

    if (auth.userId !== requestUserId) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: User ID mismatch" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const result = await deleteActivity({
      userId: auth.userId,
      id: id,
    })

    // updateActivityはvoidを返すため、rowsAffectedはチェックしない
    // 成功したと仮定するか、別の方法で成功を確認する必要がある
    // // updateActivityはvoidを返すため、rowsAffectedはチェックしない
    // 成功したと仮定するか、別の方法で成功を確認する必要がある
    // if (!result || result.rowsAffected !== 1) {
    //   throw new Error("Failed to delete activity")
    // }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error deleting record:", error)
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
