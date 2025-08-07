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
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.omu-aikido.com https://challenges.cloudflare.com",
          "connect-src 'self' https://clerk.omu-aikido.com",
          "img-src 'self' https://img.clerk.com",
          "worker-src 'self' blob:",
          "style-src 'self' 'unsafe-inline'",
          "frame-src 'self' https://challenges.cloudflare.com",
          "form-action 'self'",
        ].join(";"),
      )
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload",
      )
    }
    return response
  },
} satisfies ExportedHandler<Env>
