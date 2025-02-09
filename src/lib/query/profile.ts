import { Role } from "@/src/class";
import { z } from "astro/zod";
import { object } from "astro:schema";

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

export async function searchAccounts(input: {
    query: string;
    applicateBy: string;
}): Promise<Accounts | null> {
    const applicated = await getRole({ userId: input.applicateBy });
    if (!applicated || applicated.isManagement()) {
        return null;
    }

    // Build Clerk API URL with query parameters.
    const url = new URL("https://api.clerk.com/v1/users");
    url.searchParams.append("offset", "0");
    url.searchParams.append("order_by", "created_at");
    url.searchParams.append("query", input.query);

    // Construct headers with secret key from environment.
    const headers = {
        Authorization: `Bearer ${import.meta.env.CLERK_SECRET_KEY}`,
    };

    // Execute the GET request.
    const response = await fetch(url.toString(), {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        throw new Error("Failed to fetch accounts. Status: " + response.status);
    }

    const users = clerkUsers.parse(await response.json());
    return users;
}

export const clerkUserSchema = z.object({
    id: z.string(),
    object: z.literal("user"),
    username: z.string().nullish(),
    first_name: z.string().nullish(),
    last_name: z.string().nullish(),
    primary_email_address_id: z.string(),
    email_addresses: z.array(z.any()),
    image_url: z.string(),
    has_image: z.boolean(),
    primary_phone_number_id: z.string().nullable(),
    primary_web3_wallet_id: z.string().nullable(),
    password_enabled: z.boolean(),
    two_factor_enabled: z.boolean(),
    totp_enabled: z.boolean(),
    backup_code_enabled: z.boolean(),
    phone_numbers: z.array(z.any()),
    web3_wallets: z.array(z.any()),
    passkeys: z.array(z.any()),
    external_accounts: z.array(z.any()),
    saml_accounts: z.array(z.any()),
    enterprise_accounts: z.array(z.any()),
    public_metadata: z.record(z.any()),
    private_metadata: z.record(z.any()).nullish(),
    unsafe_metadata: z.record(z.any()),
    external_id: z.string().nullable(),
    banned: z.boolean(),
    last_sign_in_at: z.number().nullish(),
    locked: z.boolean(),
    lockout_expires_in_seconds: z.number().nullish(),
    updated_at: z.number(),
    created_at: z.number(),
    last_active_at: z.number().nullable(),
    legal_accepted_at: z.number().nullable(),
    verification_attempts_remaining: z.number(),
    delete_self_enabled: z.boolean(),
    create_organization_enabled: z.boolean(),
    mfa_enabled_at: z.number().nullable(),
    mfa_disabled_at: z.number().nullable(),
});

export const clerkUsers = z.array(clerkUserSchema);

export const profile = z.object({
    grade: z.preprocess((val) => Number(val), z.number()), // 文字列から数値へ変換
    role: z.string(),
    getGradeAt: z.string(),
    joinedAt: z.preprocess((val) => Number(val), z.number()), // 文字列から数値へ変換
    year: z.string(),
});

export type Account = z.infer<typeof clerkUserSchema>;
export type Accounts = z.infer<typeof clerkUsers>;
export type Profile = z.infer<typeof profile>;
