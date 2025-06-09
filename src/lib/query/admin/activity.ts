import { db } from "@/src/lib/drizzle";
import { activity } from "@/./db/schema";
import { eq, gte, lte, and } from "drizzle-orm";

import * as accounts from "@/src/lib/query/profile";

export const selectActivity = activity.$inferSelect;
export const inputActivity = activity.$inferInsert;

// 特定のユーザーの全てのアクティビティを取得する
export async function getUserAllActivities(input: { userId: string }) {
    const activities = await db
        .select()
        .from(activity)
        .where(eq(activity.userId, input.userId));
    return activities;
}

// 特定のユーザーの特定の期間のアクティビティを取得する
export async function getUserActivities(input: {
    userId: string;
    start: Date | null;
    end: Date | null;
}) {
    // 1970-01-01T00:00:00.000Z ~ 2100-12-31T23:59:59.999Zまでのデータを取得
    const start = input.start
        ? input.start.toISOString()
        : new Date(0).toISOString();
    const end = input.end
        ? input.end.toISOString()
        : new Date(4102444799999).toISOString();
    const activities = await db
        .select()
        .from(activity)
        .where(
            and(
                eq(activity.userId, input.userId),
                gte(activity.date, start),
                lte(activity.date, end)
            )
        );
    return activities;
}

// ユーザーの最後の昇級昇段からの稽古日数を取得する
export async function getTrainings(input: { userId: string }) {
    const user = await accounts.getProfile({ userId: input.userId });
    if (user instanceof Response) {
        return [];
    }
    const date = new Date(user.getGradeAt);
    const today = new Date();

    const activities = await db
        .select()
        .from(activity)
        .where(
            and(
                eq(activity.userId, input.userId),
                gte(activity.date, date.toISOString()),
                lte(activity.date, today.toISOString())
            )
        );

    return activities;
}
