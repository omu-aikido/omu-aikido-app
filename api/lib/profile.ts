import { createClerkClient } from "@clerk/backend"
import { getAuth } from "@hono/clerk-auth"
import { ArkErrors } from "arktype"
import type { Context } from "hono"

import { profileBaseSchema } from "@/type/account"

export const getProfile = async (c: Context) => {
  const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })
  const auth = getAuth(c)
  if (!auth || !auth.userId) return null
  const user = await clerkClient.users.getUser(auth.userId)
  if (Object.keys(user.publicMetadata).length === 0) return null
  const profile = profileBaseSchema(user.publicMetadata)
  if (profile instanceof ArkErrors) return null
  return profile
}
