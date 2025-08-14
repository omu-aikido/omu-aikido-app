import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes"

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
    ...prefix("sign-up", [
      index("routes/sign-up.tsx"),
      route("verify", "routes/sign-up+/verify.tsx"),
      route("sso-callback", "routes/sign-up+/sso-callback.tsx"),
    ]),
  ]),
  // Onboarding
  route("onboarding", "routes/onboarding.tsx"),
] satisfies RouteConfig
