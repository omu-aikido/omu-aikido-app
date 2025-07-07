// src/pages/api/me/activities/index.ts
import { createActivity, inputActivity, getActivitiesByDateRange } from "@/src/lib/query/activity"
import type { APIRoute } from "astro"

// GET: 認証ユーザー自身の活動一覧取得
export const GET: APIRoute = async ({ url, locals }) => {
  const auth = locals.auth()
  if (!auth.userId) return new Response("Unauthorized", { status: 401 })

  const startDate = url.searchParams.get("startDate")
  const endDate = url.searchParams.get("endDate")

  const activities = await getActivitiesByDateRange({
    userId: auth.userId,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  return Response.json(activities)
}

// POST: 認証ユーザー自身の活動作成
export const POST: APIRoute = async ({ request, locals }) => {
  const auth = locals.auth()
  if (!auth.userId) return new Response("Unauthorized", { status: 401 })

  const body = (await request.json()) as typeof inputActivity
  if (auth.userId !== body.userId) {
    return new Response("Invalid user ID", { status: 403 })
  }
  const result = await createActivity({ userId: auth.userId, activity: body })
  return Response.json(result)
}
