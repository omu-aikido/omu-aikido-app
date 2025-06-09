import { Role } from "@/src/class";
import { profile } from "@/src/zod";
import type { Profile } from "@/src/type";
import { createClerkClient } from "@clerk/astro/server";

// Validate user ID input and return the profile.
export async function getProfile(input: {
    userId: string;
}): Promise<Profile | Response> {
    const clerkClient = createClerkClient({
        secretKey: import.meta.env.CLERK_SECRET_KEY,
    });

    try {
        const user = await clerkClient.users.getUser(input.userId);

        if (Object.keys(user.publicMetadata).length === 0) {
            console.error("No profile found.");
            return new Response("No Profile Found", {
                status: 404,
            });
        }

        try {
            const parsedProfile = profile.safeParse(user.publicMetadata);
            if (!parsedProfile.success) {
                console.error("Invalid profile format:", parsedProfile.error);
                return new Response(
                    "Something Went Wrong with Loading Profile",
                    {
                        status: 303,
                        headers: {
                            Location: "/account/recovery",
                        },
                    }
                );
            }
            return parsedProfile.data as Profile;
        } catch (error) {
            console.error("Failed to parse profile:");
            return new Response("Something Went Wrong with Loading Profile", {
                status: 303,
                headers: {
                    Location: "/account/recovery",
                },
            });
        }
    } catch (error) {
        console.error("Failed to get user:");
        return new Response("Missing Correct User Schema", {
            status: 422,
        });
    }
}

export async function createProfile(input: {
    id: string;
    grade: number;
    getGradeAt: Date;
    joinedAt: number;
    year: string;
}): Promise<Response> {
    const clerkClient = createClerkClient({
        secretKey: import.meta.env.CLERK_SECRET_KEY,
    });

    // 既に有効なプロフィールがある場合はエラーとする。
    const existingProfile = await getProfile({ userId: input.id });
    if (!(existingProfile instanceof Response)) {
        throw new Error("User already exists.");
    }

    const getGradeAtString = new Date(input.getGradeAt).toISOString();

    try {
        await clerkClient.users.updateUserMetadata(input.id, {
            publicMetadata: profile.safeParse({
                grade: input.grade,
                getGradeAt: getGradeAtString,
                joinedAt: input.joinedAt,
                year: input.year,
                role: "member",
            }).data,
            privateMetadata: {},
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Failed to create profile:", error);
        return new Response("Failed to create profile", {
            status: 500,
        });
    }
}

export async function updateProfile(input: {
    id: string;
    grade: number;
    getGradeAt: Date;
    joinedAt: number;
    year: string;
    role: string;
}): Promise<Response> {
    const clerkClient = createClerkClient({
        secretKey: import.meta.env.CLERK_SECRET_KEY,
    });

    const year = new Date().getFullYear();
    const getGradeAtValidate = input.getGradeAt
        ? input.getGradeAt
        : new Date(year, 3, 1, 0, 0, 0, 0);
    const getGradeAtString = new Date(getGradeAtValidate).toISOString();

    try {
        await clerkClient.users.updateUserMetadata(input.id, {
            publicMetadata: profile.safeParse({
                grade: input.grade,
                getGradeAt: getGradeAtString,
                joinedAt: input.joinedAt,
                year: input.year,
                role: input.role,
            }).data,
            privateMetadata: {},
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Failed to update profile:", error);
        return new Response("Failed to update profile", {
            status: 500,
        });
    }
}

export function getRole(input: { profile: Profile }): Role | null {
    return Role.fromString(input.profile.role);
}
