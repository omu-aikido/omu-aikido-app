import {
  createActivities,
  updateActivities,
  deleteActivities,
  inputActivity,
} from "src/lib/query/activity"
import type { APIRoute } from "astro"

export type BatchRequestBody = {
  userId: string
  added?: Array<typeof inputActivity>
  updated?: Array<typeof inputActivity>
  deleted?: string[]
}

export const POST: APIRoute = async ({ request, locals }) => {
  const auth = locals.auth()
  if (!auth.userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = (await request.json()) as BatchRequestBody

  if (body.userId !== auth.userId) {
    return new Response("Invalid user ID in payload", { status: 403 })
  }

  type BatchResult = {
    affected: number
    success: boolean
  }

  type BatchResponse = {
    added?: BatchResult
    updated?: BatchResult
    delete?: BatchResult
  }

  try {
    const results: BatchResponse = {}
    let status = 200

    if (body.deleted && body.deleted.length > 0) {
      const expected = body.deleted.length
      const deleted = await deleteActivities({ userId: auth.userId, ids: body.deleted })
      const affected = deleted.map((r) => r.rowsAffected).reduce((a, b) => a + b, 0)
      results.delete = {
        affected: affected,
        success: affected === expected,
      }
      if (affected !== expected) status = 500
    }

    if (body.added && body.added.length > 0) {
      const expected = body.added.length
      const added = await createActivities({ userId: auth.userId, activities: body.added })
      const affected = added.rowsAffected
      results.added = {
        affected: affected,
        success: expected === added.rowsAffected,
      }
      if (affected !== expected) status = 500
    }

    if (body.updated && body.updated.length > 0) {
      const expected = body.updated.length
      const updated = await updateActivities({ userId: auth.userId, activities: body.updated })
      const affected = updated.map((r) => r.rowsAffected).reduce((a, b) => a + b, 0)
      results.updated = {
        affected: affected,
        success: expected === affected,
      }
      if (affected !== expected) status = 500
    }

    return new Response(JSON.stringify(results, null, 2).toString(), { status: status })
  } catch (error) {
    return new Response((error as Error).message, { status: 500 })
  }
}
