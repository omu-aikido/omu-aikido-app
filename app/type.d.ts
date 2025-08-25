import type { z } from "zod"

import type { ActivityType } from "./db/schema"
import type { profileSchema } from "./lib/zod"

export type Year = "b1" | "b2" | "b3" | "b4" | "m1" | "m2" | "d1" | "d2"
export type Grade = 0 | 5 | 4 | 3 | 2 | 1 | -1 | -2

export type Profile = z.infer<typeof profileSchema>

type PagePath = { name: string; href: string; desc: string }

type ActionResult<T = unknown> = { data: T; result: boolean }

export interface DailyActivityItem extends ActivityType {
  isDeleted?: boolean
  status: "added" | "updated" | "deleted" | "unchanged"
  /**
   * UI only: 編集前の元の period を保持するためのフィールド。
   * 削除したときに period を元に戻すために使用します。
   */
  originalPeriod?: number
}
