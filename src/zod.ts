import { z } from "zod";
import { Role } from "./class";

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

export const profile = z.object({
    grade: z.preprocess((val) => Number(val), z.number()), // 文字列から数値へ変換
    role: Role.type(),
    getGradeAt: z.string(),
    joinedAt: z.preprocess((val) => Number(val), z.number()), // 文字列から数値へ変換
    year: z.string(),
});

export const clerkUsers = z.array(clerkUserSchema);
