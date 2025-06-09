import { getProfile, getRole } from "@/src/lib/query/profile";
import { createClerkClient } from "@clerk/astro/server";

export async function updateProfile(input: {
    applicateBy: string;
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
    const applicaterProfile = await getProfile({ userId: input.applicateBy });
    if (applicaterProfile instanceof Response) {
        throw new Error("Applicater profile not found.");
    }
    const applicated = getRole({ profile: applicaterProfile });
    if (!applicated || !applicated.isManagement()) {
        throw new Error("Unauthorized.");
    }

    const year = new Date().getFullYear();
    const getGradeAtValidate = input.getGradeAt
        ? input.getGradeAt
        : new Date(year, 3, 1, 0, 0, 0, 0);
    const getGradeAtString = new Date(getGradeAtValidate).toISOString();
    const profile = {
        grade: input.grade,
        getGradeAt: getGradeAtString,
        joinedAt: input.joinedAt,
        year: input.year,
        role: input.role,
    };

    try {
        await clerkClient.users.updateUserMetadata(input.id, {
            publicMetadata: profile,
            privateMetadata: {},
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Failed to update profile:");
        return new Response("Failed to update profile", {
            status: 500,
        });
    }
}
