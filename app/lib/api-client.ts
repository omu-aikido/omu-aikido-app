import type { Hono } from "hono"
import { hc } from "hono/client"

import type { AdminApp } from "@/api/admin"
import type { UserApp } from "@/api/user"

type ClientArgs = { request: Request }

const createBaseUrl = (request: Request, path: string) => {
  const reqUrl = new URL(request.url)
  return `${reqUrl.origin}${path}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const uc = ({ request }: ClientArgs) => {
  return createClient<UserApp>({ request, path: "/api/user" })
}

export const ac = ({ request }: ClientArgs) => {
  return createClient<AdminApp>({ request, path: "/api/admin" })
}
