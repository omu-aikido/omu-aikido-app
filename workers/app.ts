import "./arktype-config"

import { Hono } from "hono"
import { RouterContextProvider, createRequestHandler } from "react-router"

import { api } from "../api"

declare module "react-router" {
  export interface RouterContextProvider {
    cloudflare: { env: Env; ctx: ExecutionContext }
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
)

const app = new Hono<{ Bindings: Env }>()

function getCacheControlForPathname(pathname: string): string | null {
  if (pathname.startsWith("/assets/")) return "public, max-age=31536000, immutable"
  if (pathname === "/favicon.ico") return "public, max-age=86400"
  if (pathname === "/favicon.svg") return "public, max-age=86400"
  if (pathname === "/robots.txt") return "public, max-age=86400"
  if (pathname === "/sitemap-index.xml") return "public, max-age=86400"
  return null
}

app.use("*", async (c, next) => {
  const request = c.req.raw
  if (request.method !== "GET") return next()

  const url = new URL(request.url)
  if (url.pathname.startsWith("/api/")) return next()

  const cacheControl = getCacheControlForPathname(url.pathname)
  if (!cacheControl) return next()

  const cacheKey = new Request(url.toString(), { method: "GET" })
  const cache = (caches as unknown as { default: Cache }).default

  const cached = await cache.match(cacheKey)
  if (cached) return cached

  await next()

  const response = c.res
  if (!response.ok) return
  if (response.headers.has("Set-Cookie")) return

  response.headers.set("Cache-Control", cacheControl)
  c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()))
})

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

  if (new URL(request.url).pathname.startsWith("/api/") && !response.headers.has("Cache-Control")) {
    response.headers.set("Cache-Control", "no-store")
  }

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
  const loadContext = new RouterContextProvider()
  loadContext.cloudflare = { env: c.env, ctx: c.executionCtx }

  const response = await requestHandler(c.req.raw, loadContext)
  return response
})

export default app
