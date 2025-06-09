import { db } from "@/src/lib/drizzle";
import { activity } from "@/./db/schema";
import { eq } from "drizzle-orm";
import { createClerkClient, type User } from "@clerk/astro/server";

export async function searchAccounts(input: {
    query: string;
}): Promise<User[] | null> {
    const clerkClient = createClerkClient({
        secretKey: import.meta.env.CLERK_SECRET_KEY,
    });

    try {
        const response = await clerkClient.users.getUserList({
            query: input.query,
            orderBy: "created_at",
        });

        // Clerk SDKのレスポンスをzodスキーマでバリデーション
        return response.data.map((user) => user);
    } catch (error) {
        console.error("Failed to search accounts:", error);
        throw new Error("Failed to fetch accounts");
    }
}

export async function countUsers(): Promise<number> {
    const clerkClient = createClerkClient({
        secretKey: import.meta.env.CLERK_SECRET_KEY,
    });

    try {
        const count = await clerkClient.users.getCount();
        return count;
    } catch (error) {
        console.error("Failed to count users:", error);
        throw new Error("Failed to count users");
    }
}

// list user
export async function listUser(offset?: number): Promise<User[]> {
    const clerkClient = createClerkClient({
        secretKey: import.meta.env.CLERK_SECRET_KEY,
    });

    try {
        const response = await clerkClient.users.getUserList({
            offset: offset || 0,
        });

        // Clerk SDKのレスポンスをzodスキーマでバリデーション
        return response.data.map((user) => user);
    } catch (error) {
        console.error("Failed to list users:", error);
        throw new Error("Failed to list users");
    }
}

export async function getUser(userId: string): Promise<User | null> {
    const clerkClient = createClerkClient({
        secretKey: import.meta.env.CLERK_SECRET_KEY,
    });

    try {
        const user = await clerkClient.users.getUser(userId);
        return user;
    } catch (error) {
        console.error("Failed to get user:", error);
        throw new Error("Failed to fetch user");
    }
}

export async function deleteUser(userId: string): Promise<Response> {
    const clerkClient = createClerkClient({
        secretKey: import.meta.env.CLERK_SECRET_KEY,
    });

    try {
        // 関連するアクティビティを先に削除
        const activities = await db
            .delete(activity)
            .where(eq(activity.userId, userId))
            .execute();

        // Clerk SDKを使用してユーザーを削除
        await clerkClient.users.deleteUser(userId);

        const response = new Response(
            JSON.stringify({
                success: true,
                deletedActivities: activities.rowsAffected || 0,
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response;
    } catch (error) {
        console.error("Failed to delete user:", error);
        throw new Error("Failed to delete user");
    }
}
