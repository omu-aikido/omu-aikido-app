import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server"
import * as profile from "@/src/lib/query/profile"
import { Role } from "@/src/zod"

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/app(.*)",
  "/account(.*)",
  "/admin(.*)",
])
const isAccountRecoverlyRoute = createRouteMatcher(["/account/setup", "/account/recovery"])
const isAdminRoute = createRouteMatcher(["/admin(.*)"])
const isApiRequest = createRouteMatcher(["/api(.*)"])
export const onRequest = clerkMiddleware(async (auth, context, next) => {
  const { redirectToSignIn, userId } = auth()

  if (!userId && isProtectedRoute(context.request)) {
    if (isApiRequest(context.request)) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
    return redirectToSignIn()
  } else if (userId) {
    if (isApiRequest(context.request)) {
      if (isAdminRoute(context.request)) {
        const userProfile = await profile.getProfile({ userId: userId })
        if (userProfile instanceof Response) {
          return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          })
        }
        const role = Role.fromString(userProfile.role)
        if (role && !role.isManagement()) {
          return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          })
        }
      }
      return next()
    }

    const userProfile = await profile.getProfile({ userId: userId })

    if (userProfile instanceof Response) {
      if (!isAccountRecoverlyRoute(context.request)) {
        if (userProfile.status === 404) {
          return context.redirect("/account/setup")
        } else if (userProfile.status === 422) {
          return context.redirect("/account/recovery")
        }
      }
    } else {
      context.locals.profile = userProfile
      const role = Role.fromString(userProfile.role)
      if (isAdminRoute(context.request) && role && !role.isManagement()) {
        return context.redirect("/dashboard")
      }
    }
  }
  return next()
})
