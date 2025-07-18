import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes"

export default [
  // Home
  index("routes/home.tsx"),
  // Record
  route("record", "routes/record.tsx"),
  // User
  ...prefix("account", [
    index("routes/user/account.tsx"),
    route("security", "routes/user/security.tsx"),
    route("status", "routes/user/status.tsx"),
  ]),
  // Sign In
  route("sign-in", "routes/sign-in.tsx"),
  // Sign Up
  route("sign-up", "routes/sign-up.tsx"),
] satisfies RouteConfig
