import { createInsertSchema, createSelectSchema } from 'drizzle-arktype'
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const activity = sqliteTable('activity', {
  id: text().primaryKey(),
  userId: text().notNull(),
  date: text().notNull(),
  period: real().default(1.5).notNull(),
  createAt: text().default('sql`(CURRENT_TIMESTAMP)`').notNull(),
  updatedAt: text(),
})

export const selectActivitySchema = createSelectSchema(activity)
export const insertActivitySchema = createInsertSchema(activity, {
  period: (schema) => schema.moreThan(0),
})

export type ActivityType = typeof activity.$inferSelect
