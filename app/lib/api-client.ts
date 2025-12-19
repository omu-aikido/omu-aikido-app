import type { Hono } from "hono"
import { hc } from "hono/client"

import type { AdminApp } from "@/api/admin"
import type { UserApp } from "@/api/user"

interface ClientArgs {
  request: Request
}

const createBaseUrl = (request: Request, path: string) => {
  const reqUrl = new URL(request.url)
  return `${reqUrl.origin}${path}`
}

// oxlint-disable @typescript-eslint/no-explicit-any
const createClient = <T extends Hono<{ Bindings: Env }, any, any>>(config: {
  request: Request
  path: string
}) => {
  const baseUrl = createBaseUrl(config.request, config.path)
  const cookie = config.request.headers.get("cookie")
  if (cookie) {
    return hc<T>(baseUrl, { headers: () => ({ cookie }) })
  }
  return hc<T>(baseUrl)
}

export const uc: ({
  request,
}: ClientArgs) => ReturnType<typeof createClient<UserApp>> = ({ request }) => {
  return createClient<UserApp>({ request, path: "/api/user" })
}

export const ac: ({
  request,
}: ClientArgs) => ReturnType<typeof createClient<AdminApp>> = ({ request }) => {
  return createClient<AdminApp>({ request, path: "/api/admin" })
}
