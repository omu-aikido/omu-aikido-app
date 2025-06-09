import { z } from "astro/zod"
import { ActionError, defineAction } from "astro:actions"

import { createActivity, inputActivity } from "@/src/lib/query/activity"

export const record = {
  add: defineAction({
    accept: "form",
    input: z.object({
      userId: z.string(),
      date: z.string(),
      period: z.string(),
    }),
    handler: async (input, context) => {
      const userId = context.locals.auth().userId
      if (!userId || userId !== input.userId) {
        throw new ActionError({ code: "UNAUTHORIZED" })
      }
      const actData: typeof inputActivity = {
        date: input.date,
        id: "", // バックエンドで生成されるのでなんでもOK
        userId: userId,
        period: Number(input.period),
      }

      // 稽古記録の作成
      const result = await createActivity({
        userId,
        activity: actData,
      })
      if (!result || result.rowsAffected !== 1) {
        throw new ActionError({ code: "INTERNAL_SERVER_ERROR" })
      }
    },
  }),
  // update: defineAction({}),
  // delete: defineAction({}),
  // get: defineAction({}),
  // list: defineAction({}),
  // recent: defineAction({}),
}
