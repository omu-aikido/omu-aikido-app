import { getRole } from "@/src/lib/query/profile";

export async function updateProfile(input: {
    applicateBy: string;
    id: string;
    grade: number;
    getGradeAt: Date;
    joinedAt: number;
    year: string;
    role: string;
}): Promise<Response> {
    const applicated = await getRole({ userId: input.applicateBy });
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

    // Build Clerk API URL with query parameters.
    const url = new URL(
        "https://api.clerk.com/v1/users/" + input.id + "/metadata"
    );

    // Construct headers with secret key from environment.
    const headers = {
        Authorization: `Bearer ${import.meta.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
    };

    const body = JSON.stringify({
        public_metadata: profile,
        private_metadata: {},
        unsafe_metadata: {},
    });

    // Execute the PATCH request.
    const response = await fetch(url.toString(), {
        method: "PATCH",
        headers,
        body,
    });

    return response as unknown as Response;
}
