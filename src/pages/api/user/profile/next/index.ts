import type { APIRoute } from "astro"
import { userActivity } from "@/src/lib/query/activity"
import { timeForNextGrade } from "@/src/utils"
import { getProfile } from "@/src/lib/query/profile"

export const GET: APIRoute = async (context) => {
  const userId = context.locals.auth().userId
  if (!userId) return new Response("Unauthorized", { status: 401 })
  const profile = await getProfile({ userId })
  if (profile instanceof Response) return new Response("Unauthorized", { status: 401 })

  const activityFromPreviousGrade = await userActivity({
    userId: userId,
    start: new Date(profile.getGradeAt ? profile.getGradeAt : new Date(profile.joinedAt, 3, 1)),
    end: new Date(),
  })
  const grade = profile.grade
  const forNextGrade = timeForNextGrade(grade)
  const needToNextGrade = Math.max(
    0,
    Math.floor(
      forNextGrade -
        activityFromPreviousGrade.map((record) => record.period).reduce((a, b) => a + b, 0) / 1.5,
    ),
  )

  return new Response(JSON.stringify({ grade, needToNextGrade, forNextGrade }), {
    headers: {
      "Content-Type": "application/json",
    },
  })
}
