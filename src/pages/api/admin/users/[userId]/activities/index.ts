// src/pages/api/admin/users/[userId]/activities/index.ts
import { userActivity } from "@/src/lib/query/activity"
import { getProfile, getRole } from "@/src/lib/query/profile"
import type { APIRoute } from "astro"

// 管理者用: 特定ユーザーの活動一覧取得
export const GET: APIRoute = async ({ params, locals, url }) => {
  const auth = locals.auth()
  if (!auth.userId) return new Response("Unauthorized", { status: 401 })

  // 管理者判定
  const profile = await getProfile({ userId: auth.userId })
  if (profile instanceof Response) return new Response("Forbidden", { status: 403 })
  const role = getRole({ profile })
  if (!role || !role.isManagement()) return new Response("Forbidden", { status: 403 })

  const userId = params.userId as string
  const searchParams = url.searchParams
  const start = searchParams.get("start") ? new Date(searchParams.get("start")!) : undefined
  const end = searchParams.get("end") ? new Date(searchParams.get("end")!) : undefined

  const result = await userActivity({ userId, start, end })
  return Response.json(result)
}
