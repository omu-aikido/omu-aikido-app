import type { User } from "@clerk/backend"

import type { ApiUser } from "@/type/api-user"

const normalizeMetadata = (
  metadata: unknown,
): Record<string, string | number | boolean | null | undefined> => {
  if (!metadata || typeof metadata !== "object") return {}
  const result: Record<string, string | number | boolean | null | undefined> = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null ||
      value === undefined
    ) {
      result[key] = value
    }
  }
  return result
}

export const toApiUser = (user: User): ApiUser => {
  return {
    id: user.id,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    fullName: user.fullName ?? null,
    username: user.username ?? null,
    imageUrl: user.imageUrl ?? "",
    primaryEmailAddressId: user.primaryEmailAddressId ?? null,
    emailAddresses: user.emailAddresses.map(email => ({
      id: email.id,
      emailAddress: email.emailAddress,
    })),
    externalAccounts: user.externalAccounts.map(account => ({
      id: account.id,
      provider: account.provider,
      username: account.username ?? null,
      externalId: account.externalId ?? null,
      imageUrl: account.imageUrl ?? null,
    })),
    publicMetadata: normalizeMetadata(user.publicMetadata),
    unsafeMetadata:
      user.unsafeMetadata && typeof user.unsafeMetadata === "object"
        ? (user.unsafeMetadata as Record<string, unknown>)
        : {},
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
