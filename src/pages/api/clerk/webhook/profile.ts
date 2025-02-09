import { Webhook } from "svix";
import { db } from "@/src/lib/drizzle";
import { activity } from "@/./db/schema";
import { eq } from "drizzle-orm";

export async function POST(context: any) {
    const webhookSecret = context.runtime.env.CLERK_WEBHOOK_SECRET;

    const headers = context.request.headers;
    const svixId = headers.get("svix-id");
    const svixTimestamp = headers.get("svix-timestamp");
    const svixSignature = headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
        return new Response("Error occured -- no svix headers", {
            status: 400,
        });
    }

    const payload = await context.request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);

    let evt: Event | null = null;

    try {
        evt = wh.verify(body, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        }) as Event;
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error occured", {
            status: 400,
        });
    }

    const eventType = evt.type;

    if (eventType === "user.deleted") {
        const userId = evt.data.id;
        try {
            await db
                .delete(activity)
                .where(eq(activity.userId, userId))
                .execute();
            return new Response(null, { status: 204 });
        } catch (error) {
            console.error("データベース削除エラー:", error);
            return new Response("データベース削除エラー", { status: 500 });
        }
    }

    return new Response(null, { status: 204 });
}

type Event = {
    data: Record<string, any>;
    object: "event";
    type: EventType;
};

type EventType = "user.created" | "user.updated" | "user.deleted" | "*";
