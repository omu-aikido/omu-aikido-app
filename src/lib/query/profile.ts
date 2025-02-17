import { Role } from "@/src/class";
import { profile, clerkUserSchema } from "@/src/zod";
import type { Account, Profile } from "@/src/type";

// Validate user ID input and return the profile.
export async function getProfile(input: {
    userId: string;
}): Promise<Profile | Response> {
    // Build Clerk API URL with query parameters.
    const url = new URL("https://api.clerk.com/v1/users" + `/${input.userId}`);

    // Construct headers with secret key from environment.
    const headers = {
        Authorization: `Bearer ${import.meta.env.CLERK_SECRET_KEY}`,
    };

    // Execute the GET request.
    const response = await fetch(url.toString(), {
        method: "GET",
        headers,
    });

    const json = await response.json();
    let user: Account;
    try {
        const parsedUser = clerkUserSchema.parse(json);
        user = parsedUser;
    } catch (error) {
        console.log(error);
        return new Response(null, {
            status: 303,
            headers: { Location: "/account/recovery" },
        });
    }

    if (Object.keys(user.public_metadata).length === 0) {
        return new Response(null, {
            status: 303,
            headers: { Location: "/account/setup" },
        });
    }

    try {
        const parsedProfile = profile.parse(user.public_metadata); // 修正: 引数にuser.public_metadataを渡す
        return parsedProfile;
    } catch (e) {
        return new Response(null, {
            status: 303,
            headers: { Location: "/account/recovery" },
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
    if (await getProfile({ userId: input.id })) {
        throw new Error("User already exists.");
    }

    const getGradeAtString = new Date(input.getGradeAt).toISOString();

    const profile: Profile = {
        grade: input.grade,
        getGradeAt: getGradeAtString,
        joinedAt: input.joinedAt,
        year: input.year,
        role: "member",
    };

    // Build Clerk API URL with query parameters.
    const url = new URL(
        "https://api.clerk.com/v1/users/" + input.id + "/metadata"
    );

    // Construct headers with secret key from environment.
    const headers = {
        Authorization: `Bearer ${import.meta.env.CLERK_SECRET_KEY}`,
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

export async function updateProfile(input: {
    id: string;
    grade: number;
    getGradeAt: Date;
    joinedAt: number;
    year: string;
    role: string;
}): Promise<Response> {
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

    console.log(response);

    return response as unknown as Response;
}

export async function getRole(input: { userId: string }): Promise<Role | null> {
    const user = await getProfile({ userId: input.userId });
    const meta = profile.parse(user);
    return Role.fromString(meta.role);
}
