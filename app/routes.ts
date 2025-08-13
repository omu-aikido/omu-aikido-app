import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  layout("layout/auth.tsx", [
    // Home
    index("routes/home.tsx"),
    // Record
    route("record", "routes/record.tsx"),
    // Account
    route("account", "layout/user.tsx", [
      index("routes/user/account.tsx"),
      route("security", "routes/user/security.tsx"),
      route("status", "routes/user/status.tsx"),
      route("discord", "routes/user/discord.tsx"),
    ]),
    // Admin routes
    route("admin", "layout/admin.tsx", [
      index("routes/admin/accounts.tsx"),
      route("user/:userId", "routes/admin/user.tsx"),
    ]),
  ]),
  layout("layout/unauth.tsx", [
    // Sign In
    route("sign-in", "routes/sign-in.tsx"),
    // Sign Up
    route("sign-up", "routes/sign-up.tsx"),
  ]),
  // Onboarding
  route("onboarding", "routes/onboarding.tsx"),
] satisfies RouteConfig
