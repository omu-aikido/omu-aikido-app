import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  // Home
  index("routes/home.tsx"),
  // Record
  route("record", "routes/record.tsx"),
  // User Account (nested with layout)
  route("account", "routes/user/layout.tsx", [
    index("routes/user/account.tsx"),
    route("security", "routes/user/security.tsx"),
    route("status", "routes/user/status.tsx"),
    route("discord", "routes/user/discord.tsx"),
  ]),
  // Sign In
  route("sign-in", "routes/sign-in.tsx"),
  // Sign Up
  route("sign-up", "routes/sign-up.tsx"),
] satisfies RouteConfig
