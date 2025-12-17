import { Hono } from "hono"
import { createRequestHandler } from "react-router"

import { api } from "../api"

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: { env: Env; ctx: ExecutionContext }
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
)

const app = new Hono<{ Bindings: Env }>()

app.use("*", async (c, next) => {
  const request = c.req.raw
  const env = c.env

  const url = new URL(request.url)
  if (env.CLERK_PUBLISHABLE_KEY.startsWith("pk_live") && url.protocol === "http:") {
    url.protocol = "https:"
    return new Response(null, { status: 301, headers: { Location: url.toString() } })
  }

  await next()

  const response = c.res
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: ${env.CLERK_FRONTEND_API_URL} https://challenges.cloudflare.com https://static.cloudflareinsights.com https://*.clerk.com https://*.clerk.dev`,
      `connect-src 'self' ${env.CLERK_FRONTEND_API_URL} https://cloudflareinsights.com https://challenges.cloudflare.com https://*.clerk.com https://*.clerk.dev`,
      "img-src 'self' https://img.clerk.com https://*.clerk.com data:",
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.com",
      "font-src 'self' https://fonts.gstatic.com",
      "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.com",
      "child-src 'self' blob: https://challenges.cloudflare.com https://*.clerk.com",
      "form-action 'self'",
    ].join("; "),
  )

  response.headers.set("Permissions-Policy", "browsing-topics=(), interest-cohort=()")

  if (env.CLERK_PUBLISHABLE_KEY.startsWith("pk_live")) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    )
  }

  return
})

app.route("/api", api)

app.all("*", async c => {
  const response = await requestHandler(c.req.raw, {
    cloudflare: { env: c.env, ctx: c.executionCtx },
  })
  return response
})

export default app
