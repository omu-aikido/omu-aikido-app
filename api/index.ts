import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import { Hono } from "hono"

import { adminApp } from "@/api/admin"
import { userApp } from "@/api/user"

export const api = new Hono<{ Bindings: Env }>()
  .use("*", clerkMiddleware())
  .use(async (c, next) => {
    const auth = getAuth(c)
    if (!auth || !auth.isAuthenticated || !auth.userId) return c.notFound()
    await next()
  })
  .route("/user", userApp)
  .route("/admin", adminApp)
