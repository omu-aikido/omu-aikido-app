// src/pages/api/me/activities/batch.ts
import { upsertActivities, inputActivity } from "@/src/lib/query/activity"
import type { APIRoute } from "astro"

// PATCH: 認証ユーザー自身の活動一括更新
export const PATCH: APIRoute = async ({ request, locals }) => {
  const auth = locals.auth()
  if (!auth.userId) return new Response("Unauthorized", { status: 401 })

  const body = (await request.json()) as Array<typeof inputActivity>

  // 各アクティビティのuserIdが認証ユーザーと一致するか確認
  const invalidActivities = body.filter((act) => act.userId && act.userId !== auth.userId)
  if (invalidActivities.length > 0) {
    return new Response("Invalid user ID in activity data", { status: 403 })
  }

  const results = await upsertActivities({
    userId: auth.userId,
    activities: body,
  })

  return Response.json(results)
}
