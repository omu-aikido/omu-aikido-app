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
    console.log(import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY);
    console.log(json);
    let user: Account;
    try {
        const parsedUser = clerkUserSchema.parse(json);
        user = parsedUser;
    } catch (error) {
        return new Response("ユーザーデータの形式が正しくありません。", {
            status: 400,
        });
    }

    if (Object.keys(user.public_metadata).length === 0) {
        return new Response("ユーザープロファイルが設定されていません。", {
            status: 400,
        });
    }

    try {
        const parsedProfile = profile.parse(user.public_metadata); // 修正: 引数にuser.public_metadataを渡す
        return parsedProfile;
    } catch (e) {
        return new Response("プロフィールのパースに失敗しました。", {
            status: 400,
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
    // 既に有効なプロフィールがある場合はエラーとする。
    const existingProfile = await getProfile({ userId: input.id });
    if (!(existingProfile instanceof Response)) {
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

    return response as unknown as Response;
}

export async function getRole(input: { userId: string }): Promise<Role | null> {
    const result = await getProfile({ userId: input.userId });
    if (result instanceof Response) {
        const errorMessage = await result.text();
        throw new Error(errorMessage);
    }
    const meta = profile.parse(result);
    return Role.fromString(meta.role);
}
