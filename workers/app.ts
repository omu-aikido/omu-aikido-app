import { createRequestHandler } from "react-router"

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: { env: Env; ctx: ExecutionContext }
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
)

export default {
  async fetch(request, env, ctx) {
    // HTTPSリダイレクト
    const url = new URL(request.url)
    if (env.CLERK_PUBLISHABLE_KEY.startsWith("pk_live") && url.protocol === "http:") {
      url.protocol = "https:"
      return new Response(null, { status: 301, headers: { Location: url.toString() } })
    }

    const response = await requestHandler(request, { cloudflare: { env, ctx } })

    if (env.CLERK_PUBLISHABLE_KEY.startsWith("pk_live")) {
      response.headers.set("X-Frame-Options", "DENY")
      response.headers.set("X-Content-Type-Options", "nosniff")
      response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'https://clerk.omu-aikido.com' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.clerk.dev https://api.clerk.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
      )
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload",
      )
    }
    return response
  },
} satisfies ExportedHandler<Env>
