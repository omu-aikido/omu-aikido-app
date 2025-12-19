export interface ApiEmailAddress {
  id: string
  emailAddress: string
}

export interface ApiExternalAccount {
  id: string
  provider: string
  username: string | null
  externalId: string | null
  imageUrl: string | null
}

export interface ApiUser {
  id: string
  firstName: string | null
  lastName: string | null
  fullName: string | null
  username: string | null
  imageUrl: string
  primaryEmailAddressId: string | null
  emailAddresses: ApiEmailAddress[]
  externalAccounts: ApiExternalAccount[]
  publicMetadata: Record<string, string | number | boolean | null | undefined>
  unsafeMetadata: Record<string, unknown>
  createdAt: number
  updatedAt: number
}
