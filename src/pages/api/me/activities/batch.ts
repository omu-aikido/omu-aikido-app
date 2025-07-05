// src/pages/api/me/activities/batch.ts
import { upsertActivities, inputActivity } from "@/src/lib/query/activity"
import type { APIRoute } from "astro"

// PATCH: 認証ユーザー自身の活動の一括更新/作成
export const PATCH: APIRoute = async ({ request, locals }) => {
  const auth = locals.auth()
  if (!auth.userId) return new Response("Unauthorized", { status: 401 })

  const body = (await request.json()) as Array<typeof inputActivity>

  // 各アクティビティのuserIdが認証ユーザーと一致するか検証
  const invalidActivities = body.filter((act) => act.userId && act.userId !== auth.userId)
  if (invalidActivities.length > 0) {
    return new Response("Invalid user ID in some activities", { status: 403 })
  }
  // デバッグ用ログ: 受信したbodyとauth.userIdを出力
  // console.log("PATCH /api/me/activities/batch body:", body)
  // console.log("PATCH /api/me/activities/batch auth.userId:", auth.userId)

  try {
    const results = await upsertActivities({ userId: auth.userId, activities: body })
    return Response.json(results)
  } catch (error) {
    // console.error("Error upserting activities:", error)
    return new Response((error as Error).message, { status: 500 })
  }
}
