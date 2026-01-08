import type { Context, Next } from 'hono'

const getCacheControlForPath = (path: string): string | null => {
  if (path === '/admin/accounts') return 'public, max-age=60'
  if (path === '/admin/norms') return 'public, max-age=60'
  if (path.startsWith('/admin/users/')) return 'public, max-age=30'
  if (path === '/user/profile') return 'private, max-age=60'
  if (path === '/user/account') return 'private, max-age=60'
  if (path === '/user/summary') return 'private, max-age=30'
  if (path === '/user/ranking') return 'private, max-age=60'
  if (path === '/user/activities') return 'private, max-age=15'
  if (path === '/user/onboarding') return 'private, max-age=10'
  return null
}

export const edgeCacheMiddleware = async (c: Context, next: Next): Promise<Response | void> => {
  if (c.req.method !== 'GET') {
    await next()
    return
  }

  const cacheControl = getCacheControlForPath(c.req.path)
  if (!cacheControl) {
    await next()
    return
  }

  const cache = (caches as unknown as { default: Cache }).default
  const cacheKey = new Request(new URL(c.req.url).toString(), {
    method: 'GET',
  })

  const cached = await cache.match(cacheKey)
  if (cached) {
    return cached
  }

  await next()

  const response = c.res
  if (!response.ok) return
  if (response.headers.has('Set-Cookie')) return

  response.headers.set('Cache-Control', cacheControl)
  c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()))
}
