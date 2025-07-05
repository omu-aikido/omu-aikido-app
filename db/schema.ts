import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core"

export const activity = sqliteTable("activity", {
  id: text().primaryKey(),
  userId: text().notNull(),
  date: text().notNull(),
  period: integer().default(1.5).notNull(),
  createAt: text().default("sql`(CURRENT_TIMESTAMP)`").notNull(),
  updatedAt: text(),
})

export type ActivityType = typeof activity.$inferSelect