import { createClient } from "@libsql/client/web"
import { and, eq, gte } from "drizzle-orm"
import { drizzle } from "drizzle-orm/libsql/web"

import { activity } from "@/app/db/schema"

/**
 * テストワーカ向けデータベース操作クラス
 */
export class db {
  private client
  private testuser: string

  /**
   * dbクラスのインスタンスを生成します。
   */
  constructor() {
    this.client = drizzle(createClient({ url: "http://127.0.0.1:8080" }))
    this.testuser = process.env.E2E_CLERK_USER_ID!
  }

  /**
   * 現在のidxに紐づく全てのactivityレコードを取得します。
   * @returns 指定idxのactivityレコード一覧
   */
  list = async () => {
    return await this.client
      .select()
      .from(activity)
      .where(and(eq(activity.userId, this.testuser)))
  }

  /**
   * 現在のidxに紐づく全てのactivityレコードを削除します。
   */
  clear = async () => {
    await this.client.delete(activity).where(and(eq(activity.userId, this.testuser)))
  }

  /**
   * 指定した日付以降のactivityレコードを削除します。
   * @param date 削除対象となる日付(Date型)
   */
  dalete = async ({
    year,
    month,
    date,
  }: {
    year: number
    month: number
    date: number
  }) => {
    await this.client
      .delete(activity)
      .where(
        and(
          eq(activity.userId, this.testuser),
          gte(activity.date, `${year}-${month}-${date}`),
        ),
      )
  }

  /**
   * 新しいactivityレコードを追加します。
   * @param params year: 年, month: 月, date: 日, period: 期間
   * @returns 追加されたレコード情報
   * @throws 追加に失敗した場合はエラーを投げます
   */
  add = async (input: { year: number; month: number; date: number; period: number }) => {
    const data: typeof activity.$inferInsert = {
      date: `${input.year}-${input.month.toString().padStart(2, "0")}-${input.date.toString().padStart(2, "0")}`,
      id: crypto.randomUUID(),
      userId: this.testuser,
      period: input.period,
      createAt: new Date().toISOString(),
    }
    const res = await this.client.insert(activity).values(data).returning()
    if (
      res.length === 1 &&
      res[0].id === data.id &&
      res[0].date === data.date &&
      res[0].period === data.period
    ) {
      return { ok: true, data: res[0] }
    }
    throw new Error("Failed to add activity")
  }
}
