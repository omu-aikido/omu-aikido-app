// src/pages/api/admin/users/[userId]/activities/[id].ts
import { updateActivity, deleteActivity, inputActivity } from "@/src/lib/query/activity"
import { getProfile, getRole } from "@/src/lib/query/profile"
import type { APIRoute } from "astro"

// 管理者用: 特定ユーザーの特定活動更新
export const PUT: APIRoute = async ({ params, request, locals }) => {
  const auth = locals.auth()
  if (!auth.userId) return new Response("Unauthorized", { status: 401 })

  // 管理者判定
  const profile = await getProfile({ userId: auth.userId })
  if (profile instanceof Response) return new Response("Forbidden", { status: 403 })
  const role = getRole({ profile })
  if (!role || !role.isManagement()) return new Response("Forbidden", { status: 403 })

  const userId = params.userId as string
  const id = params.id as string
  const body = (await request.json()) as Partial<typeof inputActivity>

  // userIdを明示的に渡す
  const result = await updateActivity({
    userId,
    activityId: id,
    activityData: body,
  })
  return Response.json(result)
}

// 管理者用: 特定ユーザーの特定活動削除
export const DELETE: APIRoute = async ({ params, locals }) => {
  const auth = locals.auth()
  if (!auth.userId) return new Response("Unauthorized", { status: 401 })

  // 管理者判定
  const profile = await getProfile({ userId: auth.userId })
  if (profile instanceof Response) return new Response("Forbidden", { status: 403 })
  const role = getRole({ profile })
  if (!role || !role.isManagement()) return new Response("Forbidden", { status: 403 })

  const userId = params.userId as string
  const id = params.id as string

  const result = await deleteActivity({ userId, id })
  return Response.json(result)
}
