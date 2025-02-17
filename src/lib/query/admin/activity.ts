import { z } from "zod";
import { db } from "@/src/lib/drizzle";
import { activity } from "@/./db/schema";
import { eq, gte, lte, and } from "drizzle-orm";

import * as uuid from "uuid";

import * as accounts from "@/src/lib/query/profile";
import { Role } from "@/src/class";

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
    startDate: Date;
    endDate: Date;
}) {
    const activities = await db
        .select()
        .from(activity)
        .where(
            and(
                eq(activity.userId, input.userId),
                gte(activity.date, input.startDate.toISOString()),
                lte(activity.date, input.endDate.toISOString())
            )
        );
    return activities;
}

// ユーザーの最後の昇級昇段からの稽古日数を取得する
export async function getTrainings(input: { userId: string }) {
    const user = await accounts.getProfile({ userId: input.userId });
    if (user instanceof Response) {
        throw new Error("Failed to fetch user profile.");
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
