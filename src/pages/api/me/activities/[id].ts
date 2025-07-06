// src/pages/api/me/activities/[id].ts
import {
  getActivity,
  updateActivity,
  deleteActivity,
  inputActivity,
} from "@/src/lib/query/activity"
import type { APIRoute } from "astro"

// GET: 認証ユーザー自身の特定活動取得
export const GET: APIRoute = async ({ params, locals }) => {
  const auth = locals.auth()
  if (!auth.userId) return new Response("Unauthorized", { status: 401 })
  const id = params.id as string
  const result = await getActivity({ id })
  if (!result || result.userId !== auth.userId) {
    return new Response("Not Found", { status: 404 })
  }
  return Response.json(result)
}

// PUT: 認証ユーザー自身の特定活動更新
export const PUT: APIRoute = async ({ params, request, locals }) => {
  const auth = locals.auth()
  if (!auth.userId) return new Response("Unauthorized", { status: 401 })
  const id = params.id as string
  const body = (await request.json()) as Partial<typeof inputActivity>
  // userIdの一致を保証
  const result = await updateActivity({
    userId: auth.userId,
    activityId: id,
    activityData: body,
  })
  return Response.json(result)
}

// DELETE: 認証ユーザー自身の特定活動削除
export const DELETE: APIRoute = async ({ params, locals }) => {
  const auth = locals.auth()
  if (!auth.userId) return new Response("Unauthorized", { status: 401 })
  const id = params.id as string
  const result = await deleteActivity({ userId: auth.userId, id })
  return Response.json(result)
}
